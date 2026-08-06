import React, { useState } from 'react';
import { crmSubscribe } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react';
import SiteModal from './SiteModal';

const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
const labelCls = 'block text-xs font-semibold text-[#444749] mb-1.5';

// Request a Call form — fields, validation and save logic are UNCHANGED from the
// original inline landing form; only the presentation moved into a modal.
const RequestCallModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', company: '', email: '', bestTime: '', notes: '' });
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setErr('Contact name and phone are required.'); return; }
    setErr('');
    await supabase.from('mq_leads').insert({
      full_name: form.name, phone: form.phone, company_name: form.company || null,
      email: form.email || null, notes: [form.bestTime && `Best time: ${form.bestTime}`, form.notes].filter(Boolean).join(' — '),
      interest_type: 'Callback', source: 'Request a Call', status: 'New',
    });
    if (form.email) {
      await crmSubscribe({ email: form.email, name: form.name, phone: form.phone, sms_opt_in: smsOptIn, source: 'contact-form', tags: ['callback', 'lead'] });
    }
    setSubmitted(true);
  };

  const close = () => { setSubmitted(false); setErr(''); setForm({ name: '', phone: '', company: '', email: '', bestTime: '', notes: '' }); onClose(); };

  return (
    <SiteModal open={open} onClose={close} title="Request a Call" subtitle="Leave your details and a specialist will call you back at your preferred time.">
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#ACFFF3] flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-[#006F51]" /></div>
          <h4 className="text-lg font-bold text-[#0F172A] mb-2">Request Received</h4>
          <p className="text-sm text-slate-500 mb-5">A team member will reach out at your preferred time. Thank you!</p>
          <button onClick={close} className="text-white text-sm font-semibold px-8 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={labelCls}>Contact Name *</label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" /></div>
            <div><label className={labelCls}>Phone Number *</label><input className={inputCls} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className={labelCls}>Company Name</label><input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Services" /></div>
            <div><label className={labelCls}>Email Address</label><input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" /></div>
          </div>
          <div className="mb-4"><label className={labelCls}>Best Time to Call</label>
            <select className={inputCls} value={form.bestTime} onChange={(e) => setForm({ ...form, bestTime: e.target.value })}>
              <option value="">Select a time window</option>
              <option>Morning (8am – 12pm)</option><option>Afternoon (12pm – 5pm)</option><option>Flexible / Any time</option>
            </select>
          </div>
          <div className="mb-3"><label className={labelCls}>Notes / Questions</label><textarea className={inputCls + ' min-h-[80px] resize-y'} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What would you like to discuss?" /></div>
          <label className="flex items-start gap-2 mb-3 text-xs text-slate-500">
            <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
            <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
          </label>
          {err && <p className="text-xs text-[#FF4444] mb-2">{err}</p>}
          <button className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-[0_3px_12px_rgba(17,106,239,0.3)] hover:-translate-y-px transition" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Request a Call</button>
        </form>
      )}
    </SiteModal>
  );
};

export default RequestCallModal;
