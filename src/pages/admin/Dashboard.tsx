import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader, Card, Badge } from './ui';
import { useNavigate } from 'react-router-dom';
import { Users, Presentation, PhoneCall, Building2, CalendarClock, Clock, GraduationCap, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const nav = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [leads, appts, subs] = await Promise.all([
        supabase.from('mq_leads').select('*'),
        supabase.from('mq_appointments').select('*'),
        supabase.from('mq_subscribers').select('*'),
      ]);
      const L = leads.data || [], A = appts.data || [], S = subs.data || [];
      setStats({
        newLeads: L.filter((l) => l.status === 'New' && l.interest_type !== 'Callback' && l.source !== 'Book Demo').length,
        demos: A.filter((a) => a.type === 'Demo').length,
        callbacks: L.filter((l) => l.interest_type === 'Callback').length,
        newSubAppts: A.filter((a) => a.type === 'Onboarding' && a.status === 'Pending Review').length,
        upcoming: A.filter((a) => ['Confirmed', 'Approved'].includes(a.status)).length,
        officeHours: A.filter((a) => a.type === 'Office Hours').length,
        training: A.filter((a) => a.type === 'Training').length,
        full: A.filter((a) => a.status === 'Full').length,
        pending: A.filter((a) => a.status === 'Pending Review').length,
        confirmed: A.filter((a) => a.status === 'Confirmed').length,
        subscribers: S.length,
      });
      setRecent(L.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6));
    })();
  }, []);

  const CARDS = [
    ['New Leads', stats.newLeads, Users, '#116AEF', '/admin/leads'],
    ['Demo Requests', stats.demos, Presentation, '#005DFF', '/admin/demos'],
    ['Callback Requests', stats.callbacks, PhoneCall, '#F59E0B', '/admin/callbacks'],
    ['New Subscriber Requests', stats.newSubAppts, Building2, '#006F51', '/admin/subscribers'],
    ['Upcoming Appointments', stats.upcoming, CalendarClock, '#116AEF', '/admin/appointments'],
    ['Upcoming Office Hours', stats.officeHours, Clock, '#8A96C0', '/admin/office-hours'],
    ['Training Sessions', stats.training, GraduationCap, '#005DFF', '/admin/training'],
    ['Full Events', stats.full, CalendarDays, '#FF4444', '/admin/events'],
    ['Pending Approval', stats.pending, AlertTriangle, '#F59E0B', '/admin/appointments'],
    ['Confirmed Appointments', stats.confirmed, CheckCircle2, '#006F51', '/admin/appointments'],
  ] as const;

  return (
    <div>
      <PageHeader title="Dashboard" sub="Operations overview across leads, appointments, and subscribers." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {CARDS.map(([label, val, Icon, color, to]) => (
          <button key={label} onClick={() => nav(to as string)} className="text-left">
            <Card className="p-5 hover:-translate-y-0.5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: (color as string) + '1a' }}><Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: color as string }} /></div>
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{val ?? 0}</div>
              <div className="text-[12px] text-slate-500 font-medium">{label}</div>
            </Card>
          </button>
        ))}
      </div>
      <Card className="p-5">
        <h3 className="text-sm font-bold text-[#0F172A] mb-3">Recent Leads</h3>
        {recent.length === 0 ? <p className="text-sm text-slate-400 py-4">No leads yet.</p> : (
          <div className="divide-y divide-slate-50">
            {recent.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5">
                <div><div className="text-sm font-semibold text-[#0F172A]">{l.full_name || '—'}</div><div className="text-xs text-slate-400">{l.company_name || l.email || ''} · {l.source}</div></div>
                <Badge status={l.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
