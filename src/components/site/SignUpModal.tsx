import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crmSubscribe, SERVICE_TYPES } from '@/lib/brand';
import { X, Check, Loader2 } from 'lucide-react';

const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
const labelCls = 'block text-xs font-semibold text-[#444749] mb-1.5';

const ORG_TYPES = ['Non-Profit', 'For-Profit', 'Government', 'Healthcare System', 'Other'];
const COMPLIANCE_AREAS = ['ODP', 'OMHSAS', 'OCYF', 'CMS', 'HIPAA', 'State Licensing', 'Other'];
const RESERVED = ['admin', 'app', 'omniyou', 'demo', 'test', 'www', 'api', 'mail'];

type SubStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved';

const SignUpModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  // Step 2
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [website, setWebsite] = useState('');
  // Step 3
  const [orgType, setOrgType] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [userCount, setUserCount] = useState('');
  const [states, setStates] = useState('');
  const [compliance, setCompliance] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [subStatus, setSubStatus] = useState<SubStatus>('idle');
  const [privacy, setPrivacy] = useState(false);
  const [terms, setTerms] = useState(false);
  // Step 4
  const [sentCode, setSentCode] = useState('');
  const [otp, setOtp] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Real-time subdomain availability check (debounced).
  useEffect(() => {
    const raw = subdomain.trim().toLowerCase();
    if (!raw) { setSubStatus('idle'); return; }
    if (!/^[a-z0-9-]+$/.test(raw)) { setSubStatus('invalid'); return; }
    if (RESERVED.includes(raw)) { setSubStatus('reserved'); return; }
    setSubStatus('checking');
    const t = setTimeout(async () => {
      const [{ data: subs }, { data: leads }] = await Promise.all([
        supabase.from('mq_subscribers').select('id').eq('subdomain', raw).limit(1),
        supabase.from('mq_leads').select('id').ilike('notes', `%subdomain: ${raw}%`).limit(1),
      ]);
      if ((subs && subs.length) || (leads && leads.length)) setSubStatus('taken');
      else setSubStatus('available');
    }, 450);
    return () => clearTimeout(t);
  }, [subdomain]);

  if (!open) return null;

  const toggleSvc = (s: string) => setServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const next1 = () => {
    if (!firstName || !lastName || !phone || !email) { setErr('Please complete all fields.'); return; }
    setErr(''); setStep(2);
  };
  const next2 = () => {
    if (!companyName || !companyEmail || !companyPhone) { setErr('Please complete the required company fields.'); return; }
    setErr(''); setStep(3);
  };
  const sendCode = async () => {
    if (!orgType || services.length === 0 || !userCount || !states || !compliance) { setErr('Please complete all fields and select at least one service type.'); return; }
    if (subStatus !== 'available') { setErr('Please choose an available subdomain.'); return; }
    if (!privacy || !terms) { setErr('You must accept the Privacy Policy and Terms & Conditions.'); return; }
    setErr(''); setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('mq-signup-verify', {
        body: { email, name: `${firstName} ${lastName}` },
      });
      if (error || !data?.code) throw new Error('Could not send verification code.');
      setSentCode(String(data.code));
      setStep(4);
    } catch (e: any) {
      setErr(e.message || 'Could not send verification code. Please try again.');
    } finally { setBusy(false); }
  };
  const verifyAndSubmit = async () => {
    if (otp.trim() !== sentCode) { setErr('That code is incorrect. Please check your email and try again.'); return; }
    setErr(''); setBusy(true);
    try {
      const meta = [
        `Subdomain: ${subdomain.trim().toLowerCase()}`,
        `Company Email: ${companyEmail}`,
        `Company Phone: ${companyPhone}`,
        `Organization Type: ${orgType}`,
        `States Operating In: ${states}`,
        `Primary Compliance Area: ${compliance}`,
      ].join(' · ');
      await supabase.from('mq_leads').insert({
        full_name: `${firstName} ${lastName}`,
        email,
        phone,
        company_name: companyName,
        website: website || null,
        service_types: services,
        estimated_user_count: userCount || null,
        interest_type: 'Sign Up',
        source: 'Sign Up Popup',
        status: 'New Signup',
        notes: meta,
      });
      await crmSubscribe({ email, name: `${firstName} ${lastName}`, phone, sms_opt_in: smsOptIn, source: 'signup-popup', tags: ['signup', 'lead'] });
      setStep(5);
    } catch (e: any) {
      setErr('Something went wrong saving your information. Please try again.');
    } finally { setBusy(false); }
  };

  function close() {
    setStep(1); setErr(''); setBusy(false);
    setFirstName(''); setLastName(''); setPhone(''); setEmail('');
    setCompanyName(''); setCompanyEmail(''); setCompanyPhone(''); setWebsite('');
    setOrgType(''); setServices([]); setUserCount(''); setStates(''); setCompliance('');
    setSubdomain(''); setSubStatus('idle'); setPrivacy(false); setTerms(false);
    setSentCode(''); setOtp('');
    onClose();
  }

  const subMsg: Record<SubStatus, string> = {
    idle: '', checking: 'Checking availability…', available: 'Available',
    taken: 'That subdomain is taken.', invalid: 'Lowercase letters, numbers, and hyphens only.',
    reserved: 'That subdomain is reserved.',
  };
  const subColor = subStatus === 'available' ? 'text-[#006F51]' : (subStatus === 'checking' ? 'text-slate-400' : 'text-[#FF4444]');

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-5" onClick={close}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[620px] max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-7 pt-7 flex justify-between items-start">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">{step === 5 ? 'Almost There' : 'Create Your Account'}</h2>
            {step < 5 && <p className="text-[13px] text-slate-500 mt-1">Step {step} of 4</p>}
          </div>
          <button onClick={close} className="text-slate-400 hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
        </div>

        {step < 5 && (
          <div className="px-7 mt-4 flex gap-1.5">
            {[1, 2, 3, 4].map((n) => <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-[#116AEF]' : 'bg-slate-100'}`} />)}
          </div>
        )}

        <div className="px-7 py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>First Name *</label><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                <div><label className={labelCls}>Last Name *</label><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Phone Number *</label><input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><label className={labelCls}>Email Address *</label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div><label className={labelCls}>Company Name *</label><input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Company Email *</label><input className={inputCls} type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} /></div>
                <div><label className={labelCls}>Company Phone *</label><input className={inputCls} type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>Website URL</label><input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com (optional)" /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Organization Type *</label>
                  <select className={inputCls} value={orgType} onChange={(e) => setOrgType(e.target.value)}><option value="">Select</option>{ORG_TYPES.map((o) => <option key={o}>{o}</option>)}</select>
                </div>
                <div><label className={labelCls}>Estimated User Count *</label>
                  <select className={inputCls} value={userCount} onChange={(e) => setUserCount(e.target.value)}><option value="">Select</option>{['1–10', '11–25', '26–50', '51–100', '100+'].map((x) => <option key={x}>{x}</option>)}</select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Service Type(s) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map((s) => (
                    <label key={s} className={`flex items-center gap-2 border-[1.5px] rounded-xl px-3 py-2 cursor-pointer text-xs font-medium transition ${services.includes(s) ? 'border-[#116AEF] bg-[#EFF6FF] text-[#116AEF]' : 'border-slate-100 bg-[#F4F5FB] text-[#444749]'}`}>
                      <input type="checkbox" checked={services.includes(s)} onChange={() => toggleSvc(s)} className="accent-[#116AEF]" /> {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>State(s) Operating In *</label><input className={inputCls} value={states} onChange={(e) => setStates(e.target.value)} placeholder="PA, NJ" /></div>
                <div><label className={labelCls}>Primary Compliance Area *</label>
                  <select className={inputCls} value={compliance} onChange={(e) => setCompliance(e.target.value)}><option value="">Select</option>{COMPLIANCE_AREAS.map((c) => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Subdomain Selection *</label>
                <div className="flex items-center">
                  <input className={`${inputCls} rounded-r-none`} value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase())} placeholder="yourcompany" />
                  <span className="bg-[#F4F5FB] border-[1.5px] border-l-0 border-slate-200 rounded-r-xl px-3 py-2.5 text-sm text-slate-400">.myhcbs.com</span>
                </div>
                {subStatus !== 'idle' && <p className={`text-xs mt-1 flex items-center gap-1 ${subColor}`}>{subStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}{subMsg[subStatus]}</p>}
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
                <span>I have read and accept the Privacy Policy. *</span>
              </label>
              <label className="flex items-start gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
                <span>I agree to the Terms &amp; Conditions. *</span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">We sent a 6-digit verification code to <strong className="text-[#0F172A]">{email}</strong>. Enter it below to verify your email.</p>
              <div><label className={labelCls}>Verification Code *</label><input className={`${inputCls} tracking-[0.4em] text-center text-lg`} maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" /></div>
              <label className="flex items-start gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5 accent-[#116AEF]" />
                <span>Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.</span>
              </label>
              <button type="button" onClick={sendCode} disabled={busy} className="text-xs font-semibold text-[#116AEF] hover:underline disabled:opacity-50">Resend code</button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-4">
              <div className="rounded-full bg-[#ACFFF3] flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}><Check className="w-9 h-9 text-[#006F51]" /></div>
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-2.5">Thanks for signing up!</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[420px] mx-auto mb-5">Your information has been received and a verification email has been sent to <strong>{email}</strong>. Our team will be in touch with your next onboarding steps.</p>
              <button onClick={close} className="text-white text-sm font-semibold px-8 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Done</button>
            </div>
          )}

          {err && step < 5 && <p className="text-xs text-[#FF4444] mt-3">{err}</p>}

          {step < 5 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && step < 5 && <button type="button" onClick={() => { setErr(''); setStep(step - 1); }} className="flex-1 border-[1.5px] border-slate-200 text-[#444749] text-sm font-semibold py-3 rounded-xl hover:border-[#116AEF] hover:text-[#116AEF] transition">Back</button>}
              {step === 1 && <button type="button" onClick={next1} className="flex-1 text-white text-sm font-semibold py-3 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Continue</button>}
              {step === 2 && <button type="button" onClick={next2} className="flex-1 text-white text-sm font-semibold py-3 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Continue</button>}
              {step === 3 && <button type="button" onClick={sendCode} disabled={busy} className="flex-1 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Send Verification Code</button>}
              {step === 4 && <button type="button" onClick={verifyAndSubmit} disabled={busy} className="flex-1 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Verify &amp; Submit</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
