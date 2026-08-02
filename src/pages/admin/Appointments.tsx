import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BRAND } from '@/lib/brand';
import { PageHeader, Card, Badge, Btn, Modal, Field, inputCls, Empty } from './ui';
import { Plus, Copy, Link2, Users, Trash2, CheckCircle2, Send, CalendarPlus, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['New', 'Pending Review', 'Approved', 'Alternative Sent', 'Confirmed', 'Full', 'Cancelled', 'Completed', 'No-Show'];

type TabCfg = {
  key: string;
  label: string;
  title: string;
  sub: string;
  types: string[];
  defaultType: string;
  typeFilter?: string[];
  publicSlug?: string;
};

const TABS: TabCfg[] = [
  {
    key: 'appointments',
    label: 'Appointments',
    title: 'Appointments',
    sub: 'Demos, onboarding, walkthroughs, and general appointments.',
    types: ['Demo', 'Onboarding', 'Q&A Session', 'Product Walkthrough', 'General Appointment'],
    defaultType: 'General Appointment',
    typeFilter: ['Demo', 'Onboarding', 'Q&A Session', 'Product Walkthrough', 'General Appointment'],
    publicSlug: 'appointment',
  },
  {
    key: 'office-hours',
    label: 'Office Hours',
    title: 'Office Hours',
    sub: 'Live office hours sessions.',
    types: ['Office Hours'],
    defaultType: 'Office Hours',
    typeFilter: ['Office Hours'],
    publicSlug: 'office-hours',
  },
  {
    key: 'training',
    label: 'Training Sessions',
    title: 'Training Sessions',
    sub: 'Customer and department training.',
    types: ['New Customer Training', 'Department Training', 'Program Training', 'Form Builder Training', 'Dashboard Training', 'Reporting Training', 'Compliance Training', 'EVV Training', 'Knowledge Base Training', 'Custom Training', 'Training'],
    defaultType: 'New Customer Training',
    typeFilter: ['Training', 'New Customer Training', 'Department Training', 'Program Training', 'Form Builder Training', 'Dashboard Training', 'Reporting Training', 'Compliance Training', 'EVV Training', 'Knowledge Base Training', 'Custom Training'],
    publicSlug: 'training',
  },
  {
    key: 'events',
    label: 'Events',
    title: 'Events',
    sub: 'Custom events and registrations.',
    types: ['Custom Event'],
    defaultType: 'Custom Event',
    typeFilter: ['Custom Event'],
    publicSlug: 'event',
  },
];

const blank = (t: string) => ({ type: t, title: '', description: '', date: '', start_time: '', end_time: '', time_zone: 'Eastern Time (ET)', host: '', specialist: '', meeting_link: '', participant_limit: 25, seats_booked: 0, registration_deadline: '', status: 'New', internal_notes: '', is_public: true });

const errMsg = (e: any) => e?.message || e?.error_description || (typeof e === 'string' ? e : 'Something went wrong. Please try again.');

const AppointmentsTable: React.FC<{ cfg: TabCfg }> = ({ cfg }) => {
  const { typeFilter, defaultType, title, sub, types, publicSlug } = cfg;

  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [regs, setRegs] = useState<any>(null);
  const [regList, setRegList] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('mq_appointments')
        .select('*')
        .order('date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      let d = data || [];
      if (typeFilter) d = d.filter((x) => typeFilter.includes(x.type));
      setRows(d);
    } catch (e: any) {
      console.error('Failed to load appointments:', e);
      setLoadError(errMsg(e));
      toast.error('Could not load records: ' + errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => !status || r.status === status);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: any = { ...edit };
      const editId = edit.id;
      delete payload.id;
      delete payload.created_at;
      delete payload.public_link;
      // Registration deadline is OPTIONAL. Convert empty strings to null.
      ['date', 'registration_deadline', 'start_time', 'end_time'].forEach((k) => { if (!payload[k]) payload[k] = null; });
      payload.participant_limit = Number(payload.participant_limit) || 0;

      if (editId) {
        const { error } = await supabase.from('mq_appointments').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        payload.public_link = publicSlug || (edit.type || '').toLowerCase().replace(/\s+/g, '-');
        const { error } = await supabase.from('mq_appointments').insert(payload);
        if (error) throw error;
      }
      toast.success('Saved successfully.');
      setEdit(null); // only close on success
      await load();
    } catch (e: any) {
      console.error('Failed to save appointment:', e);
      setSaveError(errMsg(e));
      toast.error('Save failed: ' + errMsg(e));
      // modal stays open so the user can retry
    } finally {
      setSaving(false);
    }
  };

  const setStatusFor = async (id: string, s: string, link?: string) => {
    try {
      const upd: any = { status: s };
      if (link !== undefined) upd.meeting_link = link;
      const { error } = await supabase.from('mq_appointments').update(upd).eq('id', id);
      if (error) throw error;
      toast.success('Status updated to ' + s + '.');
      setEdit(null);
      await load();
    } catch (e: any) {
      console.error('Status update failed:', e);
      setSaveError(errMsg(e));
      toast.error('Update failed: ' + errMsg(e));
    }
  };

  const dup = async (r: any) => {
    try {
      const c: any = { ...r };
      delete c.id; delete c.created_at;
      c.title = (c.title || '') + ' (Copy)'; c.seats_booked = 0; c.status = 'New';
      const { error } = await supabase.from('mq_appointments').insert(c);
      if (error) throw error;
      toast.success('Duplicated.');
      await load();
    } catch (e: any) {
      console.error('Duplicate failed:', e);
      toast.error('Duplicate failed: ' + errMsg(e));
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      const { error } = await supabase.from('mq_appointments').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted.');
      await load();
    } catch (e: any) {
      console.error('Delete failed:', e);
      toast.error('Delete failed: ' + errMsg(e));
    }
  };

  const openRegs = async (a: any) => {
    setRegs(a);
    setRegList([]);
    setRegError(null);
    setRegLoading(true);
    try {
      const { data, error } = await supabase
        .from('mq_participants')
        .select('*')
        .eq('appointment_id', a.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegList(data || []);
    } catch (e: any) {
      console.error('Failed to load registrants:', e);
      setRegError(errMsg(e));
      toast.error('Could not load registrants: ' + errMsg(e));
      setRegList([]);
    } finally {
      setRegLoading(false);
    }
  };

  const removeReg = async (p: any) => {
    try {
      const { error: e1 } = await supabase.from('mq_participants').delete().eq('id', p.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('mq_appointments').update({ seats_booked: Math.max(0, (regs.seats_booked || 1) - 1) }).eq('id', regs.id);
      if (e2) throw e2;
      const { data, error: e3 } = await supabase.from('mq_participants').select('*').eq('appointment_id', regs.id);
      if (e3) throw e3;
      setRegList(data || []);
      toast.success('Registrant removed.');
      await load();
    } catch (e: any) {
      console.error('Remove registrant failed:', e);
      toast.error('Could not remove registrant: ' + errMsg(e));
    }
  };

  const baseUrl = window.location.origin;
  const pubLink = (r: any) => `${baseUrl}/book/${r.public_link || publicSlug || 'appointment'}`;

  const openEditor = (v: any) => { setSaveError(null); setEdit(v); };

  return (
    <div>
      <PageHeader title={title} sub={sub} action={<Btn onClick={() => openEditor(blank(defaultType || types[0]))}><Plus className="w-4 h-4" /> New</Btn>} />

      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#FF4444]/30 bg-[#FF4444]/5 px-4 py-3 text-sm text-[#FF4444]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">Failed to load records: {loadError}</span>
          <button onClick={load} className="font-semibold underline">Retry</button>
        </div>
      )}

      <Card className="p-4 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' max-w-[220px]'}>
          <option value="">All Statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Card>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : filtered.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-[#F4F5FB] text-left text-[11px] uppercase tracking-wide text-slate-500">
              {['Title', 'Type', 'Date / Time', 'Seats', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#F4F5FB]/50 align-top">
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">{r.title || '—'}<div className="text-[11px] text-slate-400 font-normal">{r.specialist || r.host}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.type}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.date || 'TBD'}<div>{r.start_time}{r.end_time ? `–${r.end_time}` : ''}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.seats_booked || 0}/{r.participant_limit || '∞'}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button title="Edit" onClick={() => openEditor({ ...r })} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded text-xs font-semibold">Edit</button>
                      <button title="Registrants" onClick={() => openRegs(r)} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded"><Users className="w-4 h-4" /></button>
                      <button title="Copy public link" onClick={() => { navigator.clipboard.writeText(pubLink(r)); toast.success('Public link copied.'); }} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded"><Link2 className="w-4 h-4" /></button>
                      <button title="Duplicate" onClick={() => dup(r)} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded"><Copy className="w-4 h-4" /></button>
                      <button title="Delete" onClick={() => del(r.id)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => { if (!saving) setEdit(null); }} title={edit?.id ? 'Edit' : 'New Appointment'} wide>
        {edit && (
          <div>
            {saveError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#FF4444]/30 bg-[#FF4444]/5 px-4 py-3 text-sm text-[#FF4444]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select className={inputCls} value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>{types.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Title"><input className={inputCls} value={edit.title || ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
              <Field label="Date"><input type="date" className={inputCls} value={edit.date || ''} onChange={(e) => setEdit({ ...edit, date: e.target.value })} /></Field>
              <Field label="Registration Deadline (optional)"><input type="date" className={inputCls} value={edit.registration_deadline || ''} onChange={(e) => setEdit({ ...edit, registration_deadline: e.target.value })} /></Field>
              <Field label="Start Time"><input className={inputCls} value={edit.start_time || ''} onChange={(e) => setEdit({ ...edit, start_time: e.target.value })} placeholder="10:00 AM" /></Field>
              <Field label="End Time"><input className={inputCls} value={edit.end_time || ''} onChange={(e) => setEdit({ ...edit, end_time: e.target.value })} placeholder="11:00 AM" /></Field>
              <Field label="Host"><input className={inputCls} value={edit.host || ''} onChange={(e) => setEdit({ ...edit, host: e.target.value })} /></Field>
              <Field label="Account Specialist"><input className={inputCls} value={edit.specialist || ''} onChange={(e) => setEdit({ ...edit, specialist: e.target.value })} /></Field>
              <Field label="Participant Limit"><input type="number" className={inputCls} value={edit.participant_limit} onChange={(e) => setEdit({ ...edit, participant_limit: e.target.value })} /></Field>
              <Field label="Status"><select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            </div>
            <Field label="Meeting Link"><input className={inputCls} value={edit.meeting_link || ''} onChange={(e) => setEdit({ ...edit, meeting_link: e.target.value })} placeholder={BRAND.urls.login} /></Field>
            <Field label="Description"><textarea className={inputCls + ' min-h-[60px]'} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <Field label="Internal Notes"><textarea className={inputCls + ' min-h-[60px]'} value={edit.internal_notes || ''} onChange={(e) => setEdit({ ...edit, internal_notes: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-xs text-slate-600 mb-4"><input type="checkbox" checked={edit.is_public} onChange={(e) => setEdit({ ...edit, is_public: e.target.checked })} className="accent-[#116AEF]" /> Available on public registration page</label>
            {edit.id && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#F4F5FB] rounded-xl">
                <Btn variant="ghost" onClick={() => setStatusFor(edit.id, 'Approved', edit.meeting_link)}><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Btn>
                <Btn variant="ghost" onClick={() => setStatusFor(edit.id, 'Confirmed', edit.meeting_link)}><Send className="w-3.5 h-3.5" /> Confirm & Send Link</Btn>
                <Btn variant="ghost" onClick={() => setStatusFor(edit.id, 'Alternative Sent')}><CalendarPlus className="w-3.5 h-3.5" /> Send Alternative</Btn>
                <Btn variant="ghost" onClick={() => setStatusFor(edit.id, 'Full')}>Close Registration</Btn>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => { if (!saving) setEdit(null); }}>Cancel</Btn>
              <Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!regs} onClose={() => setRegs(null)} title={`Registrants — ${regs?.title || ''}`} wide>
        {regs && (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              {regLoading ? 'Loading registrants…' : `${regList.length} registered · ${regs.participant_limit ? `${Math.max(0, regs.participant_limit - regList.length)} seats remaining` : 'Unlimited'}`}
            </p>
            {regs.meeting_link && regList.length > 0 && (
              <Btn className="mb-3" onClick={() => { navigator.clipboard.writeText(`Meeting link for all ${regList.length} participants: ${regs.meeting_link}`); toast.success('Link copied.'); }}>
                <Send className="w-3.5 h-3.5" /> Copy Link to Send All
              </Btn>
            )}
            {regError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#FF4444]/30 bg-[#FF4444]/5 px-4 py-3 text-sm text-[#FF4444]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="flex-1">Could not load registrants: {regError}</span>
                <button onClick={() => openRegs(regs)} className="font-semibold underline">Retry</button>
              </div>
            )}
            {regLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading registrants…</div>
            ) : !regError && regList.length === 0 ? (
              <Empty text="No registrants yet." />
            ) : !regError ? (
              <div className="space-y-2">
                {regList.map((p) => (
                  <div key={p.id} className="bg-[#F4F5FB] rounded-lg px-3.5 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#0F172A]">{p.full_name || 'Unnamed'}</span>
                        {p.role_title && <span className="text-[11px] text-slate-500">· {p.role_title}</span>}
                        <span className="text-[10px] font-bold text-[#116AEF] bg-[#EFF6FF] border border-[#116AEF]/15 rounded-full px-2 py-0.5">{p.status || 'Registered'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {p.email || '—'}{p.phone ? ` · ${p.phone}` : ''}{p.company_name ? ` · ${p.company_name}` : ''}{p.subscriber_id ? ` · Sub ${p.subscriber_id}` : ''}
                      </div>
                      {p.topics && <div className="text-[11px] text-slate-600 mt-1 italic">“{p.topics}”</div>}
                      {p.created_at && <div className="text-[10px] text-slate-400 mt-1">Registered {new Date(p.created_at).toLocaleString()}</div>}
                    </div>
                    <button title="Remove registrant" onClick={() => removeReg(p)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
};

const Appointments: React.FC = () => {
  const [active, setActive] = useState(TABS[0].key);
  const cfg = TABS.find((t) => t.key === active) || TABS[0];
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition ${active === t.key ? 'border-[#116AEF] text-[#116AEF]' : 'border-transparent text-slate-500 hover:text-[#0F172A]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <AppointmentsTable key={cfg.key} cfg={cfg} />
    </div>
  );
};

export default Appointments;
