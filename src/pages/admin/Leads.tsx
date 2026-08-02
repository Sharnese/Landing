import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Badge, Btn, Modal, Field, inputCls, labelCls, Empty } from './ui';
import { Search, Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['New', 'Contacted', 'Demo Requested', 'Demo Scheduled', 'Follow Up Later', 'Converted', 'Not Interested', 'Archived'];
const errMsg = (e: any) => e?.message || (typeof e === 'string' ? e : 'Something went wrong.');

const Leads: React.FC<{ filterSource?: string; title?: string; sub?: string }> = ({ filterSource, title = 'Lead Management', sub = 'All leads from chatbot, demos, callbacks, forms, and registrations.' }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('mq_leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      let d = data || [];
      if (filterSource === 'demo') d = d.filter((x) => x.interest_type === 'Demo' || x.source === 'Book Demo');
      if (filterSource === 'callback') d = d.filter((x) => x.interest_type === 'Callback');
      setRows(d);
    } catch (e: any) {
      console.error('Load leads failed:', e);
      toast.error('Could not load leads: ' + errMsg(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterSource]);

  const filtered = rows.filter((r) => {
    const matchQ = !q || [r.full_name, r.email, r.company_name, r.phone].some((v) => (v || '').toLowerCase().includes(q.toLowerCase()));
    const matchS = !status || r.status === status;
    return matchQ && matchS;
  });

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('mq_leads').update({
        full_name: edit.full_name, email: edit.email, phone: edit.phone, company_name: edit.company_name,
        role_title: edit.role_title, status: edit.status, assigned_admin: edit.assigned_admin,
        assigned_specialist: edit.assigned_specialist, notes: edit.notes,
        last_contacted_date: edit.last_contacted_date || null, next_followup_date: edit.next_followup_date || null,
      }).eq('id', edit.id);
      if (error) throw error;
      toast.success('Lead saved.');
      setEdit(null); load();
    } catch (e: any) {
      console.error('Save lead failed:', e);
      toast.error('Save failed: ' + errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      const { error } = await supabase.from('mq_leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted.'); load();
    } catch (e: any) {
      console.error('Delete lead failed:', e);
      toast.error('Delete failed: ' + errMsg(e));
    }
  };

  return (
    <div>
      <PageHeader title={title} sub={sub} />
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#F4F5FB] rounded-lg px-3 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…" className="bg-transparent py-2 text-sm outline-none flex-1" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' max-w-[200px]'}>
            <option value="">All Statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : filtered.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F4F5FB] text-left text-[11px] uppercase tracking-wide text-slate-500">
                {['Name', 'Company', 'Contact', 'Source', 'Status', 'Assigned', ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F4F5FB]/50">
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{r.full_name || '—'}<div className="text-[11px] text-slate-400 font-normal">{r.role_title}</div></td>
                    <td className="px-4 py-3 text-slate-600">{r.company_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{r.email}<div>{r.phone}</div></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.source}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.assigned_specialist || r.assigned_admin || '—'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setEdit({ ...r })} className="text-[#116AEF] hover:bg-[#EFF6FF] p-1.5 rounded"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => del(r.id)} className="text-[#FF4444] hover:bg-[#FF4444]/10 p-1.5 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Lead Details" wide>
        {edit && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"><input className={inputCls} value={edit.full_name || ''} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} /></Field>
              <Field label="Role / Title"><input className={inputCls} value={edit.role_title || ''} onChange={(e) => setEdit({ ...edit, role_title: e.target.value })} /></Field>
              <Field label="Email"><input className={inputCls} value={edit.email || ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputCls} value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
              <Field label="Company"><input className={inputCls} value={edit.company_name || ''} onChange={(e) => setEdit({ ...edit, company_name: e.target.value })} /></Field>
              <Field label="Status"><select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Assigned Admin"><input className={inputCls} value={edit.assigned_admin || ''} onChange={(e) => setEdit({ ...edit, assigned_admin: e.target.value })} /></Field>
              <Field label="Assigned Specialist"><input className={inputCls} value={edit.assigned_specialist || ''} onChange={(e) => setEdit({ ...edit, assigned_specialist: e.target.value })} /></Field>
              <Field label="Last Contacted"><input type="date" className={inputCls} value={edit.last_contacted_date?.slice(0, 10) || ''} onChange={(e) => setEdit({ ...edit, last_contacted_date: e.target.value })} /></Field>
              <Field label="Next Follow-Up"><input type="date" className={inputCls} value={edit.next_followup_date?.slice(0, 10) || ''} onChange={(e) => setEdit({ ...edit, next_followup_date: e.target.value })} /></Field>
            </div>
            <Field label="Notes"><textarea className={inputCls + ' min-h-[80px]'} value={edit.notes || ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
            <div className="text-xs text-slate-400 mb-3">Source: {edit.source} · Created {new Date(edit.created_at).toLocaleDateString()}{edit.service_types?.length ? ` · Services: ${edit.service_types.join(', ')}` : ''}</div>
            <div className="flex gap-2 justify-end">
              <Btn variant="ghost" onClick={() => { setEdit({ ...edit, status: 'Archived' }); }}>Archive</Btn>
              <Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Changes'}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Leads;
