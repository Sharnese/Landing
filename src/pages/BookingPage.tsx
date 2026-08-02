import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { crmSubscribe } from '@/lib/brand';
import { Check, Clock, Calendar, Users } from 'lucide-react';

const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
const labelCls = 'block text-xs font-semibold text-[#444749] mb-1.5';

type Cfg = { kind: 'appointment' | 'office-hours' | 'training' | 'event'; title: string; subtitle: string; types: string[] };

const CONFIG: Record<string, Cfg> = {
  appointment: { kind: 'appointment', title: 'Book an Appointment', subtitle: 'Schedule time with the MyHCBS team. Subscriber onboarding is captured automatically when linked.', types: ['Demo', 'Onboarding', 'Q&A Session', 'Product Walkthrough', 'General Appointment'] },
  'office-hours': { kind: 'office-hours', title: 'Live Office Hours', subtitle: 'Register for open Q&A sessions with our specialists.', types: ['Office Hours'] },
  training: { kind: 'training', title: 'Training Appointment', subtitle: 'Reserve your spot in a MyHCBS training session. Each customer receives 6 complimentary training hours.', types: ['New Customer Training', 'Department Training', 'Dashboard Training', 'Reporting Training', 'Compliance Training', 'EVV Training'] },
  event: { kind: 'event', title: 'Event Registration', subtitle: 'Register for upcoming MyHCBS events.', types: ['Custom Event'] },
};

const BookingPage: React.FC<{ kind: string }> = ({ kind }) => {
  const cfg = CONFIG[kind] || CONFIG.appointment;
  const [params] = useSearchParams();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', role: '', topics: '' });
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const subscriberId = params.get('subscriber_id') || '';
  const companyId = params.get('company_id') || '';
  const subStatus = params.get('subscription_status') || '';

  const load = async () => {
    setLoading(true);
    const typeFilter = cfg.kind === 'office-hours' ? 'Office Hours' : cfg.kind === 'training' ? 'Training' : cfg.kind === 'event' ? 'Custom Event' : null;
    let q = supabase.from('mq_appointments').select('*').in('status', ['Confirmed', 'Approved', 'New', 'Pending Review']).order('date', { ascending: true });
    if (typeFilter) q = q.eq('type', typeFilter);
    const { data } = await q;
    const avail = (data || []).filter((s) => s.is_public !== false);
    setSessions(avail);
    if (avail.length) setSelected(avail[0]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [kind]);

  const isFull = selected && selected.participant_limit && selected.seats_booked >= selected.participant_limit;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { setErr('Name, email and phone are required.'); return; }
    if (!selected) { setErr('Please select a session.'); return; }
    if (isFull) { setErr('This session is full.'); return; }
    setErr('');

    // 1) Save the registrant FIRST and verify it succeeded. Seat counts must only
    //    increment after a confirmed participant row, otherwise the tally and the
    //    registrant list go out of sync ("count up but no registrants shown").
    const { error: pErr } = await supabase.from('mq_participants').insert({
      appointment_id: selected.id, full_name: form.name, company_name: form.company || null,
      email: form.email, phone: form.phone, role_title: form.role || null, topics: form.topics || null,
      status: 'Registered',
      subscriber_id: subscriberId || null, company_id: companyId || null, subscription_status: subStatus || null,
    });
    if (pErr) {
      console.error('Registration failed:', pErr);
      setErr('We could not complete your registration. Please try again, or contact us if the problem persists.');
      return;
    }

    // 2) Only now bump the seat count.
    const newSeats = (selected.seats_booked || 0) + 1;
    await supabase.from('mq_appointments').update({
      seats_booked: newSeats,
      status: selected.participant_limit && newSeats >= selected.participant_limit ? 'Full' : selected.status,
    }).eq('id', selected.id);

    // 3) Best-effort lead + CRM sync (non-blocking for the registrant record).
    await supabase.from('mq_leads').insert({
      full_name: form.name, email: form.email, phone: form.phone, company_name: form.company || null,
      role_title: form.role || null, interest_type: cfg.title, source: `${cfg.title} registration`, status: 'New', notes: form.topics || null,
    });
    await crmSubscribe({ email: form.email, name: form.name, phone: form.phone, sms_opt_in: smsOptIn, source: cfg.kind, tags: [cfg.kind, 'registration'] });
    setDone(true);
  };


  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter] py-12 px-5">
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-extrabold text-xl text-[#0F172A] mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" className="w-4 h-4"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            </div>MyHCBS
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{cfg.title}</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{cfg.subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
          {done ? (
            <div className="text-center py-6">
              <div className="w-18 h-18 rounded-full bg-[#ACFFF3] flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}><Check className="w-9 h-9 text-[#006F51]" /></div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-2.5">You're registered!</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">A confirmation email with the meeting details will be sent shortly. We look forward to seeing you{selected ? ` on ${selected.date || 'the scheduled date'}` : ''}.</p>
              {selected?.meeting_link && <a href={selected.meeting_link} target="_blank" rel="noopener noreferrer" className="text-[#116AEF] text-sm font-semibold underline">Meeting link</a>}
            </div>
          ) : loading ? (
            <p className="text-center text-sm text-slate-400 py-8">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No sessions are currently scheduled. Please check back soon or contact us.</p>
          ) : (
            <form onSubmit={submit}>
              <label className={labelCls}>Select a Session</label>
              <div className="space-y-2 mb-5">
                {sessions.map((s) => {
                  const full = s.participant_limit && s.seats_booked >= s.participant_limit;
                  const remaining = s.participant_limit ? s.participant_limit - (s.seats_booked || 0) : null;
                  return (
                    <button type="button" key={s.id} disabled={full} onClick={() => setSelected(s)}
                      className={`w-full text-left border-[1.5px] rounded-xl p-3.5 transition ${selected?.id === s.id ? 'border-[#116AEF] bg-[#EFF6FF]' : 'border-slate-100 bg-[#F4F5FB]'} ${full ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#116AEF]/40'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-[#0F172A]">{s.title}</div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mt-1">
                            {s.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {s.date}</span>}
                            {s.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.start_time}{s.end_time ? `–${s.end_time}` : ''}</span>}
                            {remaining !== null && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {full ? 'Full' : `${remaining} seats left`}</span>}
                          </div>
                        </div>
                        {full && <span className="text-[10px] font-bold text-[#FF4444] bg-[#FF4444]/10 px-2 py-0.5 rounded-full">Full</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isFull ? (
                <div className="text-center bg-[#FF4444]/5 border border-[#FF4444]/20 rounded-xl py-6 mb-2">
                  <p className="text-sm font-bold text-[#FF4444]">This session is full.</p>
                  <p className="text-xs text-slate-500 mt-1">Please select a different session.</p>
                </div>
              ) : (
                <>
                  {(subscriberId || companyId || subStatus) && (
                    <div className="bg-[#EFF6FF] border border-[#116AEF]/20 rounded-xl p-3 mb-4 text-[11px] text-[#116AEF]">
                      Subscriber linked{subscriberId && ` · ID ${subscriberId}`}{subStatus && ` · ${subStatus}`}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className={labelCls}>Company Name</label><input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div><label className={labelCls}>Email Address *</label><input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div><label className={labelCls}>Phone Number *</label><input className={inputCls} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div className="mb-4"><label className={labelCls}>Role / Title</label><input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                  <div className="mb-4"><label className={labelCls}>Questions or Topics to Cover</label><textarea className={inputCls + ' min-h-[70px] resize-y'} value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} /></div>
                  <label className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                    <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
                    <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
                  </label>
                  {err && <p className="text-xs text-[#FF4444] mb-2">{err}</p>}
                  <button className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-[0_3px_12px_rgba(17,106,239,0.3)] hover:-translate-y-px transition" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Confirm Registration</button>
                </>
              )}
            </form>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">© {new Date().getFullYear()} MyHCBS</p>
      </div>
    </div>
  );
};

export default BookingPage;
