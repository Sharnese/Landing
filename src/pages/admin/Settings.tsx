import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BRAND } from '@/lib/brand';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { PageHeader, Card, Btn, Field, inputCls } from './ui';

const Settings: React.FC = () => {
  const { admin, refresh } = useAdminAuth();
  const [email, setEmail] = useState(admin?.email || '');
  const [name, setName] = useState(admin?.name || '');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  const saveProfile = async () => {
    setMsg('');
    if (email && email !== admin?.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { setMsg(error.message); return; }
    }
    await supabase.from('admin_profiles').update({ full_name: name, email, updated_at: new Date().toISOString() }).eq('id', admin!.id);
    await refresh(); setMsg('Profile updated.'); setTimeout(() => setMsg(''), 2500);
  };
  const savePw = async () => {
    setMsg('');
    if (pw.length < 6) { setMsg('Password must be at least 6 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { setMsg(error.message); return; }
    await supabase.from('admin_profiles').update({ first_login: false, updated_at: new Date().toISOString() }).eq('id', admin!.id);
    await refresh(); setPw(''); setMsg('Password changed.'); setTimeout(() => setMsg(''), 2500);
  };


  return (
    <div>
      <PageHeader title="Settings" sub="Profile, security, integrations, and branding." />
      {msg && <div className="mb-4 text-sm text-[#006F51] bg-[#ACFFF3]/40 border border-[#006F51]/20 rounded-lg px-4 py-2">{msg}</div>}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Admin Profile</h3>
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Btn onClick={saveProfile}>Save Profile</Btn>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Change Password</h3>
          <Field label="New Password"><input type="password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" /></Field>
          <Btn onClick={savePw}>Update Password</Btn>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Official App URLs</h3>
          <Field label="Login URL"><input className={inputCls} defaultValue={BRAND.urls.login} readOnly /></Field>
          <Field label="Signup / Get Started URL"><input className={inputCls} defaultValue={BRAND.urls.signup} readOnly /></Field>
          <p className="text-[11px] text-slate-400">These power the public Sign In / Get Started buttons.</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-[#0F172A] mb-4">Email, Webhook & Branding</h3>
          <Field label="Support Email"><input className={inputCls} defaultValue={BRAND.supportEmail} readOnly /></Field>
          <Field label="Default Meeting Link Placeholder"><input className={inputCls} defaultValue="https://meet.myhcbs.com/" readOnly /></Field>
          <Field label="Webhook Endpoint"><input className={inputCls} defaultValue="/functions/v1/new-subscriber-webhook" readOnly /></Field>
          <p className="text-[11px] text-slate-400">Brand: {BRAND.name} · {BRAND.primarySlogan}</p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
