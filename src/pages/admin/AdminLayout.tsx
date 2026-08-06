import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuth';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Presentation, PhoneCall, Building2, CalendarClock,
  BookOpen, Mail, Webhook, FileEdit, CalendarRange, CalendarCheck2,
  ShieldCheck as ShieldUser, UserCog, Settings, LogOut, Menu,
} from 'lucide-react';

const NAV = [
  ['/admin/dashboard', 'Dashboard', LayoutDashboard],
  ['/admin/leads', 'Leads', Users],
  ['/admin/demos', 'Demo Requests', Presentation],
  ['/admin/demo-calendar', 'Demo Calendar', CalendarRange],
  ['/admin/availability', 'Availability', CalendarCheck2],
  ['/admin/callbacks', 'Callback Requests', PhoneCall],
  ['/admin/subscribers', 'Subscribers', Building2],
  ['/admin/appointments', 'Appointments', CalendarClock],
  ['/admin/use-cases', 'Use Cases', BookOpen],

  ['/admin/chatbot', 'Chatbot Knowledge', BookOpen],
  ['/admin/email-templates', 'Email Templates', Mail],
  ['/admin/webhooks', 'Webhook Logs', Webhook],
  ['/admin/content', 'Site Content', FileEdit],
  ['/admin/admins', 'Admin Users', ShieldUser],
  ['/admin/specialists', 'Account Specialists', UserCog],
  ['/admin/settings', 'Settings', Settings],
] as const;

const AdminLayout: React.FC = () => {
  const { admin, loading, logout } = useAdminAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (!admin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter] flex">
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-[#0F172A] flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 flex items-center gap-2 font-extrabold text-white text-lg border-b border-white/10">
          <img src="/images/logo-icon.png" alt="MyHCBS logo" className="w-8 h-8 object-contain" />MyHCBS
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition ${isActive ? 'bg-[#116AEF] text-white' : 'text-white/55 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-4 h-4 shrink-0" /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav('/admin'); }} className="m-3 flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/55 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4" /> Sign Out</button>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-20">
          <button className="lg:hidden text-[#0F172A]" onClick={() => setOpen(true)}><Menu /></button>
          <div className="hidden lg:block text-sm font-semibold text-[#0F172A]">Admin Portal</div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block"><div className="text-[13px] font-semibold text-[#0F172A]">{admin.name}</div><div className="text-[11px] text-slate-400 capitalize">{admin.role.replace('_', ' ')}</div></div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{admin.name?.[0] || 'A'}</div>
          </div>
        </header>
        {admin.must_change_password && (
          <div className="bg-[#FF4444]/10 border-b border-[#FF4444]/20 text-[#FF4444] text-xs px-5 py-2 text-center">For security, please change your default password in Settings.</div>
        )}
        <main className="flex-1 p-5 lg:p-8 overflow-x-auto"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
