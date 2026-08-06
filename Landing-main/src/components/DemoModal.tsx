import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmSubscribe, SERVICE_TYPES } from '@/lib/brand';
import {
  loadAvailability, availableDates, slotsForDate, isSlotFree, to12h,
  buildDemoPlan, buildCalendarLinks, type AvailabilityConfig,
} from '@/lib/demoScheduling';
import { X, Check, Loader2, CalendarDays, Clock } from 'lucide-react';

const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
const labelCls = 'block text-xs font-semibold text-[#444749] mb-1.5';

const DemoModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: '', role: '', company: '', email: '', phone: '', website: '', users: '', notes: '' });
  const [services, setServices] = useState<string[]>([]);
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Scheduling state
  const [cfg, setCfg] = useState<AvailabilityConfig | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; endLabel: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    loadAvailability().then((c) => { setCfg(c); setDates(c ? availableDates(c) : []); });
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  useEffect(() => {
    if (!cfg || !date) { setSlots([]); return; }
    setSlotsLoading(true); setTime('');
    slotsForDate(cfg, date).then((s) => setSlots(s)).finally(() => setSlotsLoading(false));
  }, [cfg, date]);

  const minDate = dates[0] || '';
  const maxDate = dates[dates.length - 1] || '';
  const dateAllowed = !date || dates.includes(date);

  const endLabelFor = (startLabel: string): string => {
    if (!cfg) return '';
    const m = startLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return '';
    let h = Number(m[1]); const min = Number(m[2]); const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
    const total = h * 60 + min + cfg.slot_minutes;
    return to12h(`${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`);
  };

  if (!open) return null;

  const toggle = (s: string) => setServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.company || !form.email || !form.phone || services.length === 0) {
      setErr('Please complete all required fields and select at least one service type.'); return;
    }
    if (cfg && cfg.active && dates.length > 0 && (!date || !time)) {
      setErr('Please choose a preferred demo date and time.'); return;
    }
    if (date && !dateAllowed) { setErr('That date is not available. Please choose an available date.'); return; }
    setErr(''); setSubmitting(true);

    try {
      // Race guard: ensure the slot is still free.
      if (date && time) {
        const free = await isSlotFree(date, time);
        if (!free) {
          setErr('That time was just booked. Please pick another slot.');
          setCfg((c) => c); setSlots(cfg ? await slotsForDate(cfg, date) : []);
          setTime(''); setSubmitting(false); return;
        }
      }

      const plan = buildDemoPlan(services, form.users);
      const endLabel = time ? endLabelFor(time) : '';
      const planNote = `Standard demo: ${plan.standard.join(', ')}. Customized: ${plan.customized.join(', ')}.`;

      const { data: appt, error: apptErr } = await supabase.from('mq_appointments').insert({
        type: 'Demo', title: `Demo — ${form.company}`,
        description: form.notes || null, status: 'New',
        date: date || null, start_time: time || null, end_time: endLabel || null,
        participant_limit: 1, seats_booked: date && time ? 1 : 0,
        contact_name: form.name, contact_email: form.email, contact_phone: form.phone,
        source: 'Book Demo',
        internal_notes: `Contact: ${form.name} (${form.role}) · ${form.email} · ${form.phone} · Services: ${services.join(', ')} · Users: ${form.users}. ${planNote}`,
      }).select('id').single();
      if (apptErr) throw apptErr;

      await supabase.from('mq_leads').insert({
        full_name: form.name, role_title: form.role, company_name: form.company, email: form.email, phone: form.phone,
        service_types: services, estimated_user_count: form.users || null, interest_type: 'Demo',
        source: 'Book Demo', status: date && time ? 'Demo Scheduled' : 'Demo Requested', notes: form.notes || null,
      });

      await crmSubscribe({ email: form.email, name: form.name, phone: form.phone, sms_opt_in: smsOptIn, source: 'demo-request', tags: ['demo', 'lead'] });

      // Fire confirmation email (best-effort; won't block success).
      if (date && time && appt?.id) {
        supabase.functions.invoke('mq-demo-email', {
          body: { kind: 'confirmation', appointment_id: appt.id, email: form.email, name: form.name, company: form.company, date, time, end: endLabel, plan },
        }).catch(() => {});
      }

      if (date && time) setConfirmed({ date, time, endLabel });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setDone(false); setConfirmed(null);
    setForm({ name: '', role: '', company: '', email: '', phone: '', website: '', users: '', notes: '' });
    setServices([]); setDate(''); setTime(''); setSlots([]);
    onClose();
  };

  const calLinks = confirmed ? buildCalendarLinks({
    title: `MyHCBS Demo — ${form.company}`,
    date: confirmed.date, startLabel: confirmed.time, durationMin: cfg?.slot_minutes || 45,
    description: 'Your personalized MyHCBS product demonstration.',
  }) : null;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-5" onClick={close}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[580px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-7 pt-7 flex justify-between items-start">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">{done ? 'Demo Request Received' : 'Book a Product Demo'}</h2>
            <p className="text-[13px] text-slate-500 mt-1">See MyHCBS in action — personalized to your organization</p>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-7 py-6">
          {done ? (
            <div className="text-center py-4">
              <div className="rounded-full bg-[#ACFFF3] flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}><Check className="w-9 h-9 text-[#006F51]" /></div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-2.5">Your demo request has been received.</h3>
              {confirmed ? (
                <>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-[420px] mx-auto mb-1">
                    <CalendarDays className="inline w-4 h-4 mr-1 -mt-0.5 text-[#116AEF]" />
                    {new Date(confirmed.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-600 mb-4"><Clock className="inline w-4 h-4 mr-1 -mt-0.5 text-[#116AEF]" />{confirmed.time}{confirmed.endLabel ? ` – ${confirmed.endLabel}` : ''}</p>
                  <p className="text-xs text-slate-500 mb-4 max-w-[420px] mx-auto">A confirmation email with your meeting link is on its way. Add it to your calendar:</p>
                  {calLinks && (
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      <a href={calLinks.google} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 hover:border-[#116AEF] hover:text-[#116AEF]">Google Calendar</a>
                      <a href={calLinks.outlook} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 hover:border-[#116AEF] hover:text-[#116AEF]">Outlook</a>
                      <a href={calLinks.icsHref} download="myhcbs-demo.ics" className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 hover:border-[#116AEF] hover:text-[#116AEF]">ICS / Apple</a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 leading-relaxed max-w-[380px] mx-auto mb-5">A team member will confirm your appointment or send alternative availability.</p>
              )}
              <button onClick={close} className="text-white text-sm font-semibold px-8 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Done</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></div>
                <div><label className={labelCls}>Role / Title *</label><input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Director of Operations" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Company Name *</label><input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Services" /></div>
                <div><label className={labelCls}>Email Address *</label><input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Phone Number *</label><input className={inputCls} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" /></div>
                <div><label className={labelCls}>Company Website</label><input className={inputCls} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://company.com" /></div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Service Type(s) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map((s) => (
                    <label key={s} className={`flex items-center gap-2 border-[1.5px] rounded-xl px-3 py-2 cursor-pointer text-xs font-medium transition ${services.includes(s) ? 'border-[#116AEF] bg-[#EFF6FF] text-[#116AEF]' : 'border-slate-100 bg-[#F4F5FB] text-[#444749]'}`}>
                      <input type="checkbox" checked={services.includes(s)} onChange={() => toggle(s)} className="accent-[#116AEF]" /> {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Estimated User Count</label>
                  <select className={inputCls} value={form.users} onChange={(e) => setForm({ ...form, users: e.target.value })}>
                    <option value="">Select range</option>{['1–10', '11–25', '26–50', '51–100', '100+'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Notes / Questions</label><input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any topics to cover?" /></div>
              </div>

              {/* ---- Scheduling ---- */}
              {cfg && cfg.active && dates.length > 0 && (
                <div className="mb-4 rounded-2xl border border-slate-100 bg-[#F9FAFE] p-4">
                  <div className="flex items-center gap-2 mb-3 text-[13px] font-bold text-[#0F172A]"><CalendarDays className="w-4 h-4 text-[#116AEF]" /> Schedule Your Demo</div>
                  <div className="mb-3">
                    <label className={labelCls}>Preferred Demo Date *</label>
                    <input type="date" className={inputCls} value={date} min={minDate} max={maxDate}
                      onChange={(e) => setDate(e.target.value)} />
                    {date && !dateAllowed && <p className="text-[11px] text-[#FF4444] mt-1">This date isn't available — please pick another.</p>}
                  </div>
                  {date && dateAllowed && (
                    <div>
                      <label className={labelCls}>Preferred Demo Time *</label>
                      {slotsLoading ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading times…</div>
                      ) : slots.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">No times left for this date. Please choose another date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((s) => (
                            <button type="button" key={s} onClick={() => setTime(s)}
                              className={`text-xs font-semibold rounded-lg px-2 py-2 border-[1.5px] transition ${time === s ? 'border-[#116AEF] bg-[#EFF6FF] text-[#116AEF]' : 'border-slate-200 bg-white text-[#444749] hover:border-[#116AEF]'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
                <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
              </label>
              {err && <p className="text-xs text-[#FF4444] mb-2">{err}</p>}
              <button disabled={submitting} className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-[0_3px_12px_rgba(17,106,239,0.3)] hover:-translate-y-px transition disabled:opacity-60 inline-flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit Demo Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
