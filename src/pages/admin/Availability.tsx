import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Btn, Field, inputCls, labelCls } from './ui';
import { Loader2, Plus, Trash2, CalendarOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Cfg = {
  id?: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  slot_minutes: number;
  buffer_minutes: number;
  max_per_day: number;
  blocked_dates: string[];
  onetime: { date: string; start: string; end: string }[];
  active: boolean;
};

const blank: Cfg = { days_of_week: [1, 2, 3, 4, 5], start_time: '09:00', end_time: '17:00', slot_minutes: 45, buffer_minutes: 15, max_per_day: 6, blocked_dates: [], onetime: [], active: true };

const Availability: React.FC = () => {
  const [cfg, setCfg] = useState<Cfg>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlock, setNewBlock] = useState('');
  const [ot, setOt] = useState({ date: '', start: '09:00', end: '12:00' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('mq_demo_availability').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (data) setCfg({
      id: data.id, days_of_week: data.days_of_week || [], start_time: data.start_time || '09:00', end_time: data.end_time || '17:00',
      slot_minutes: data.slot_minutes || 45, buffer_minutes: data.buffer_minutes || 15, max_per_day: data.max_per_day || 6,
      blocked_dates: data.blocked_dates || [], onetime: Array.isArray(data.onetime) ? data.onetime : [], active: data.active !== false,
    });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleDay = (d: number) => setCfg((c) => ({ ...c, days_of_week: c.days_of_week.includes(d) ? c.days_of_week.filter((x) => x !== d) : [...c.days_of_week, d].sort() }));

  const save = async () => {
    setSaving(true);
    const payload = { ...cfg, updated_at: new Date().toISOString() } as any;
    delete payload.id;
    try {
      if (cfg.id) {
        const { error } = await supabase.from('mq_demo_availability').update(payload).eq('id', cfg.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('mq_demo_availability').insert(payload);
        if (error) throw error;
      }
      toast.success('Availability saved.');
      await load();
    } catch (e: any) {
      toast.error('Save failed: ' + (e?.message || e));
    } finally { setSaving(false); }
  };

  const addBlock = () => { if (newBlock && !cfg.blocked_dates.includes(newBlock)) { setCfg((c) => ({ ...c, blocked_dates: [...c.blocked_dates, newBlock].sort() })); setNewBlock(''); } };
  const addOt = () => { if (ot.date) { setCfg((c) => ({ ...c, onetime: [...c.onetime.filter((o) => o.date !== ot.date), { ...ot }] })); setOt({ date: '', start: '09:00', end: '12:00' }); } };

  if (loading) return <div className="flex items-center justify-center gap-2 py-20 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div>
      <PageHeader title="Demo Availability" sub="Control when customers can schedule demos. The public demo scheduler only shows slots generated from these settings." action={<Btn onClick={save}>{saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Changes'}</Btn>} />

      <Card className="p-6 mb-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] mb-5"><input type="checkbox" checked={cfg.active} onChange={(e) => setCfg({ ...cfg, active: e.target.checked })} className="accent-[#116AEF] w-4 h-4" /> Accept demo bookings (when off, the scheduler is hidden and customers submit without a time)</label>

        <div className="mb-5">
          <label className={labelCls}>Available Days of the Week</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d, i) => (
              <button key={d} type="button" onClick={() => toggleDay(i)} className={`text-xs font-semibold rounded-lg px-3.5 py-2 border-[1.5px] transition ${cfg.days_of_week.includes(i) ? 'border-[#116AEF] bg-[#EFF6FF] text-[#116AEF]' : 'border-slate-200 text-slate-500 hover:border-[#116AEF]'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Working Hours Start"><input type="time" className={inputCls} value={cfg.start_time} onChange={(e) => setCfg({ ...cfg, start_time: e.target.value })} /></Field>
          <Field label="Working Hours End"><input type="time" className={inputCls} value={cfg.end_time} onChange={(e) => setCfg({ ...cfg, end_time: e.target.value })} /></Field>
          <Field label="Appointment Duration (min)"><input type="number" className={inputCls} value={cfg.slot_minutes} onChange={(e) => setCfg({ ...cfg, slot_minutes: Number(e.target.value) })} /></Field>
          <Field label="Buffer Between Demos (min)"><input type="number" className={inputCls} value={cfg.buffer_minutes} onChange={(e) => setCfg({ ...cfg, buffer_minutes: Number(e.target.value) })} /></Field>
          <Field label="Max Demos Per Day"><input type="number" className={inputCls} value={cfg.max_per_day} onChange={(e) => setCfg({ ...cfg, max_per_day: Number(e.target.value) })} /></Field>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#0F172A]"><CalendarOff className="w-4 h-4 text-[#FF4444]" /> Blocked Dates (holidays / vacation)</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {cfg.blocked_dates.length === 0 && <span className="text-xs text-slate-400">No blocked dates.</span>}
          {cfg.blocked_dates.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#FF4444]/10 text-[#FF4444] rounded-full px-3 py-1.5">
              {d}<button onClick={() => setCfg((c) => ({ ...c, blocked_dates: c.blocked_dates.filter((x) => x !== d) }))}><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2"><input type="date" className={inputCls + ' max-w-[200px]'} value={newBlock} onChange={(e) => setNewBlock(e.target.value)} /><Btn variant="ghost" onClick={addBlock}><Plus className="w-3.5 h-3.5" /> Block Date</Btn></div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#0F172A]"><Clock className="w-4 h-4 text-[#116AEF]" /> One-Time Availability (extra dates outside your weekly schedule)</div>
        <div className="space-y-2 mb-3">
          {cfg.onetime.length === 0 && <span className="text-xs text-slate-400">No one-time availability added.</span>}
          {cfg.onetime.map((o) => (
            <div key={o.date} className="flex items-center justify-between bg-[#F4F5FB] rounded-lg px-3 py-2 text-xs">
              <span className="font-semibold text-[#0F172A]">{o.date} · {o.start}–{o.end}</span>
              <button onClick={() => setCfg((c) => ({ ...c, onetime: c.onetime.filter((x) => x.date !== o.date) }))} className="text-[#FF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div><label className={labelCls}>Date</label><input type="date" className={inputCls + ' max-w-[180px]'} value={ot.date} onChange={(e) => setOt({ ...ot, date: e.target.value })} /></div>
          <div><label className={labelCls}>Start</label><input type="time" className={inputCls + ' max-w-[130px]'} value={ot.start} onChange={(e) => setOt({ ...ot, start: e.target.value })} /></div>
          <div><label className={labelCls}>End</label><input type="time" className={inputCls + ' max-w-[130px]'} value={ot.end} onChange={(e) => setOt({ ...ot, end: e.target.value })} /></div>
          <Btn variant="ghost" onClick={addOt}><Plus className="w-3.5 h-3.5" /> Add</Btn>
        </div>
      </Card>
    </div>
  );
};

export default Availability;
