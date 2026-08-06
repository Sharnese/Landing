import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await login(email, pw);
    setBusy(false);
    if (res) setErr(res);
    else nav('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-[Inter] px-5" style={{ background: 'linear-gradient(135deg,#0F172A,#8A96C0)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-9">
        <div className="flex items-center gap-2 font-extrabold text-xl text-[#0F172A] mb-1">
          <img src="/images/logo-icon.png" alt="MyHCBS logo" className="w-9 h-9 object-contain" />MyHCBS
        </div>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Admin Portal Sign In</p>
        <form onSubmit={submit}>
          <label className="block text-xs font-semibold text-[#444749] mb-1.5">Email</label>
          <input className="w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#116AEF] mb-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@myhcbs.com" />
          <label className="block text-xs font-semibold text-[#444749] mb-1.5">Password</label>
          <input type="password" className="w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#116AEF] mb-4" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          {err && <p className="text-xs text-[#FF4444] mb-3">{err}</p>}
          <button disabled={busy} className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-[0_3px_12px_rgba(17,106,239,0.3)] hover:-translate-y-px transition disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{busy ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="text-[11px] text-slate-400 mt-4 text-center">Default admin: Omniyouapp@gmail.com</p>
      </div>
    </div>
  );
};

export default AdminLogin;
