import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock } from 'lucide-react';

// Non-public sign-in page. Reachable only by direct URL (/signin or /login).
// It is intentionally NOT linked from the main navigation.
const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
const labelCls = 'block text-xs font-semibold text-[#444749] mb-1.5';

const SignIn: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!email || !password) { setErr('Please enter your email and password.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setErr(error.message || 'Unable to sign in.'); return; }
      setMsg('Signed in successfully.');
    } finally { setBusy(false); }
  };

  const forgot = async () => {
    setErr(''); setMsg('');
    if (!email) { setErr('Enter your email address first, then click Forgot Password.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/signin`,
      });
      if (error) { setErr(error.message || 'Could not send reset email.'); return; }
      setMsg('If an account exists for that email, a password reset link has been sent.');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter] flex items-center justify-center px-5">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-2 font-extrabold text-[20px] tracking-tight text-[#0F172A] mb-6">
          <img src="/images/logo-icon.png" alt="MyHCBS logo" className="w-9 h-9 object-contain" />
          MyHCBS
        </div>
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-1"><Lock className="w-4 h-4 text-[#116AEF]" /><h1 className="text-xl font-extrabold text-[#0F172A]">Sign In</h1></div>
          <p className="text-[13px] text-slate-500 mb-6">Access your organization workspace.</p>
          <form onSubmit={submit} className="space-y-4">
            <div><label className={labelCls}>Domain / Subdomain</label><input className={inputCls} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.myhcbs.com" /></div>
            <div><label className={labelCls}>Email Address</label><input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
            <div><label className={labelCls}>Password</label><input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
            {err && <p className="text-xs text-[#FF4444]">{err}</p>}
            {msg && <p className="text-xs text-[#006F51]">{msg}</p>}
            <button disabled={busy} className="w-full text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Sign In</button>
            <button type="button" onClick={forgot} disabled={busy} className="w-full text-center text-xs font-semibold text-[#116AEF] hover:underline disabled:opacity-50">Forgot Password?</button>
          </form>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-5">Restricted access — for existing account holders only.</p>
      </div>
    </div>
  );
};

export default SignIn;
