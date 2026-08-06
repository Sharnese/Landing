import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Badge, Btn, Modal, Field, inputCls, Empty } from './ui';
import { ChevronLeft, ChevronRight, Loader2, CalendarDays, AlertTriangle, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { slotsForDate, loadAvailability, type AvailabilityConfig } from '@/lib/demoScheduling';

const DEMO_STATUSES = ['New', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'];
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sameDay = (a: Date, b: Date) => fmt(a) === fmt(b);
const errMsg = (e: any) => e?.message || 'Something went wrong.';

const DemoCalendar: React.FC = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [cursor, setCursor] = useState(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staff, setStaff] = useState<string[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<AvailabilityConfig | null>(null);
  const [reslots, setReslots] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(null);
    try {
      const { data, error } = await supabase.from('mq_appointments').select('*').eq('type', 'Demo').order('date', { ascending: true });
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) { setLoadError(errMsg(e)); toast.error('Could not load demos: ' + errMsg(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    loadAvailability().then(setCfg);
    supabase.from('mq_admins').select('name').then(({ data }) => setStaff((data || []).map((a: any) => a.name).filter(Boolean)));
  }, [load]);

  // Re-fetch reschedule slots when edit date changes.
  useEffect(() => {
    if (edit?.date && cfg) slotsForDate(cfg, edit.date).then((s) => setReslots(Array.from(new Set([...(edit.start_time ? [edit.start_time] : []), ...s]))));
    else setReslots([]);
  }, [edit?.date, cfg]); // eslint-disable-line

  const days = useMemo(() => {
    if (view === 'day') return [new Date(cursor)];
    if (view === 'week') {
      const start = new Date(cursor); start.setDate(cursor.getDate() - cursor.getDay());
      return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    }
    // month grid
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first); start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [view, cursor]);

  const demosOn = (d: Date) => rows.filter((r) => r.date && sameDay(new Date(r.date + 'T00:00:00'), d));

  const move = (dir: number) => {
    const d = new Date(cursor);
    if (view === 'day') d.setDate(d.getDate() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCursor(d);
  };

  const title = view === 'month'
    ? cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : view === 'day'
      ? cursor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
      : `Week of ${days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  const emailFor = (r: any) => r.contact_email || (r.internal_notes || '').match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || '';

  const sendEmail = (kind: string, r: any) => {
    const email = emailFor(r);
    if (!email) return;
    supabase.functions.invoke('mq-demo-email', {
      body: { kind, email, name: r.contact_name || '', company: (r.title || '').replace('Demo — ', ''), date: r.date || '', time: r.start_time || '', meeting_link: r.meeting_link || '' },
    }).catch(() => {});
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id } = edit;
      const payload: any = {
        status: edit.status, date: edit.date || null, start_time: edit.start_time || null, end_time: edit.end_time || null,
        host: edit.host || null, specialist: edit.specialist || null, assigned_user_id: edit.assigned_user_id || null,
        meeting_link: edit.meeting_link || null,
      };
      const { error } = await supabase.from('mq_appointments').update(payload).eq('id', id);
      if (error) throw error;
      if (edit._notify === 'Rescheduled') sendEmail('rescheduled', edit);
      if (edit._notify === 'Cancelled') sendEmail('cancelled', edit);
      if (edit._notify === 'Confirmed') sendEmail('confirmation', edit);
      toast.success('Demo updated.');
      setEdit(null); await load();
    } catch (e: any) { toast.error('Update failed: ' + errMsg(e)); }
    finally { setSaving(false); }
  };

  const setStatus = (s: string) => setEdit((e: any) => ({ ...e, status: s, _notify: s }));

  return (
    <div>
      <PageHeader title="Demo Calendar" sub="View and manage scheduled product demos." action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`text-xs font-semibold px-3 py-2 capitalize ${view === v ? 'bg-[#116AEF] text-white' : 'bg-white text-slate-500 hover:text-[#116AEF]'}`}>{v}</button>
            ))}
          </div>
        </div>
      } />

      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#FF4444]/30 bg-[#FF4444]/5 px-4 py-3 text-sm text-[#FF4444]">
          <AlertTriangle className="w-4 h-4 shrink-0" /><span className="flex-1">{loadError}</span><button onClick={load} className="font-semibold underline">Retry</button>
        </div>
      )}

      <Card className="p-4 mb-4 flex items-center justify-between">
        <button onClick={() => move(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
        <div className="text-sm font-bold text-[#0F172A]">{title}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(new Date())} className="text-xs font-semibold text-[#116AEF] px-2">Today</button>
          <button onClick={() => move(1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : view === 'day' ? (
        <Card className="p-5">
          {demosOn(cursor).length === 0 ? <Empty text="No demos scheduled this day." /> : (
            <div className="space-y-2">{demosOn(cursor).map((r) => <DemoRow key={r.id} r={r} onClick={() => setEdit({ ...r })} />)}</div>
          )}
        </Card>
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((d) => (
            <Card key={fmt(d)} className="p-3 min-h-[140px]">
              <div className="text-[11px] font-bold text-slate-400 mb-2">{d.toLocaleDateString(undefined, { weekday: 'short' })} {d.getDate()}</div>
              <div className="space-y-1.5">{demosOn(d).map((r) => <MiniDemo key={r.id} r={r} onClick={() => setEdit({ ...r })} />)}</div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-3">
          <div className="grid grid-cols-7 text-[10px] font-bold text-slate-400 mb-1">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              return (
                <div key={fmt(d)} className={`min-h-[88px] rounded-lg border p-1.5 ${inMonth ? 'border-slate-100 bg-white' : 'border-transparent bg-slate-50/50 opacity-60'}`}>
                  <div className="text-[10px] font-semibold text-slate-400 mb-1">{d.getDate()}</div>
                  <div className="space-y-1">{demosOn(d).slice(0, 3).map((r) => <MiniDemo key={r.id} r={r} onClick={() => setEdit({ ...r })} />)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Modal open={!!edit} onClose={() => { if (!saving) setEdit(null); }} title={`Demo — ${edit?.title || ''}`} wide>
        {edit && (
          <div>
            <div className="text-xs text-slate-500 mb-3">{edit.contact_name || ''} {emailFor(edit) ? `· ${emailFor(edit)}` : ''} {edit.contact_phone ? `· ${edit.contact_phone}` : ''}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status"><select className={inputCls} value={edit.status} onChange={(e) => setStatus(e.target.value)}>{DEMO_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Assign to Staff">
                <select className={inputCls} value={edit.specialist || ''} onChange={(e) => setEdit({ ...edit, specialist: e.target.value, assigned_user_id: e.target.value })}>
                  <option value="">Unassigned</option>{staff.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Date (reschedule)"><input type="date" className={inputCls} value={edit.date || ''} onChange={(e) => setEdit({ ...edit, date: e.target.value, _notify: 'Rescheduled', status: edit.status === 'New' ? 'Rescheduled' : edit.status })} /></Field>
              <Field label="Time">
                {reslots.length > 0 ? (
                  <select className={inputCls} value={edit.start_time || ''} onChange={(e) => setEdit({ ...edit, start_time: e.target.value })}>
                    <option value="">Select…</option>{reslots.map((s) => <option key={s}>{s}</option>)}
                  </select>
                ) : <input className={inputCls} value={edit.start_time || ''} onChange={(e) => setEdit({ ...edit, start_time: e.target.value })} placeholder="10:00 AM" />}
              </Field>
            </div>
            <Field label="Meeting Link"><input className={inputCls} value={edit.meeting_link || ''} onChange={(e) => setEdit({ ...edit, meeting_link: e.target.value })} placeholder="https://meet.google.com/…" /></Field>
            <div className="text-[11px] text-slate-500 bg-[#F4F5FB] rounded-lg p-3 mb-4">{edit.internal_notes || 'No notes.'}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Btn variant="ghost" onClick={() => setStatus('Confirmed')}><Send className="w-3.5 h-3.5" /> Confirm & Email</Btn>
              <Btn variant="ghost" onClick={() => setStatus('Completed')}>Mark Completed</Btn>
              <Btn variant="ghost" onClick={() => setStatus('No Show')}>No Show</Btn>
              <Btn variant="danger" onClick={() => setStatus('Cancelled')}><XCircle className="w-3.5 h-3.5" /> Cancel Demo</Btn>
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => { if (!saving) setEdit(null); }}>Close</Btn>
              <Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save'}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const DemoRow: React.FC<{ r: any; onClick: () => void }> = ({ r, onClick }) => (
  <button onClick={onClick} className="w-full text-left bg-[#F4F5FB] hover:bg-[#EFF6FF] rounded-lg px-3.5 py-3 flex items-center justify-between gap-3 transition">
    <div className="min-w-0">
      <div className="text-sm font-semibold text-[#0F172A] truncate">{r.title || 'Demo'}</div>
      <div className="text-[11px] text-slate-500">{r.start_time || 'Time TBD'}{r.specialist ? ` · ${r.specialist}` : ''}</div>
    </div>
    <Badge status={r.status} />
  </button>
);

const MiniDemo: React.FC<{ r: any; onClick: () => void }> = ({ r, onClick }) => (
  <button onClick={onClick} className="w-full text-left rounded-md px-1.5 py-1 text-[10px] font-semibold bg-[#EFF6FF] text-[#116AEF] hover:bg-[#116AEF] hover:text-white transition truncate flex items-center gap-1">
    <CalendarDays className="w-2.5 h-2.5 shrink-0" />{r.start_time || ''} {r.title?.replace('Demo — ', '') || 'Demo'}
  </button>
);

export default DemoCalendar;
