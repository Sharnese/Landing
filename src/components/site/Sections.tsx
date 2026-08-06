import React from 'react';
import { VALUE_PILLS } from '@/lib/brand';
import {
  LayoutDashboard, FileText, FolderArchive, AlertCircle, BarChart3, ShieldCheck,
  Users, Activity, ListChecks, Building2, MessageCircle, GraduationCap, CheckCircle2,
  UserCircle, Sparkles, Pill, IdCard, LifeBuoy,
} from 'lucide-react';

const PEOPLE_PHOTO = '/images/people-support.png';
const ONBOARDING_PHOTO = '/images/onboarding-team.png';

const Eyebrow = ({ children, light }: any) => (
  <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 ${light ? 'text-[#76BCFF]' : 'text-[#116AEF]'}`}>
    <span className="w-2 h-2 rounded-full bg-current" /> {children}
  </div>
);

export const ValuePills: React.FC = () => (
  <section className="relative bg-white py-12 px-6 border-b border-slate-100 overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'linear-gradient(90deg,#005DFF,#76BCFF,#006F51)' }} />
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-center"><Eyebrow>Platform Capabilities</Eyebrow></div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {VALUE_PILLS.map((p, i) => (
          <div
            key={p}
            className="flex items-center gap-1.5 border rounded-full px-4 py-2 text-[13px] font-semibold hover:-translate-y-px hover:shadow-md transition-all"
            style={{
              background: i % 3 === 0 ? '#EFF6FF' : i % 3 === 1 ? '#ECFDF5' : '#F4F5FB',
              borderColor: i % 3 === 0 ? '#116AEF33' : i % 3 === 1 ? '#006F5133' : '#E2E4EE',
              color: i % 3 === 0 ? '#0F4FB0' : i % 3 === 1 ? '#00593F' : '#444749',
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: i % 3 === 0 ? '#116AEF' : i % 3 === 1 ? '#006F51' : '#76BCFF' }} /> {p}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FEATURES = [
  { icon: LayoutDashboard, title: 'Compliance Dashboard', desc: 'See how your organization is doing at a glance — coverage, alerts, and compliance status, all in one place.' },
  { icon: ShieldCheck, title: 'Compliance Manager', desc: 'Run structured compliance checks, flag what needs attention, and track corrective actions until they are resolved.' },
  { icon: Sparkles, title: 'AI Trend Insights', desc: 'Know what is improving, slipping, or at risk — spotted automatically, before it becomes an audit finding.' },
  { icon: FileText, title: 'Custom Forms', desc: 'Build the exact forms your team needs — no coding, no IT ticket required.' },
  { icon: FolderArchive, title: 'Records Management', desc: 'Keep every participant and employee record organized, secure, and easy to find.' },
  { icon: AlertCircle, title: 'Incident Tracking', desc: 'Log incidents, follow up on what happens next, and keep everyone in the loop.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Pull the reports funders, auditors, and your own team need — in just a few clicks.' },
  { icon: Users, title: 'Staff Credentialing', desc: 'Know exactly who is trained, certified, and cleared to work — and who is not.' },
  { icon: Activity, title: 'Visit Verification (EVV)', desc: 'Track visits electronically, exactly the way state and federal rules require.' },
  { icon: Pill, title: 'eMAR', desc: 'Document every medication administration accurately, track counts, and keep nothing unaccounted for.' },
  { icon: IdCard, title: 'Client Portal', desc: 'Give the people you serve a secure place to view and sign their own records, plans, and notes.' },
  { icon: ListChecks, title: 'Task Management', desc: 'Assign tasks, send reminders, and keep your team accountable without the chasing.' },
  { icon: Building2, title: 'Company Infrastructure', desc: 'Set up your programs, sites, and teams the way your organization actually runs.' },
  { icon: MessageCircle, title: 'Knowledge-Based Chat', desc: 'Live chat with answers about your company — policies, procedures, contacts, HR, benefits, and more.' },
  { icon: GraduationCap, title: 'Training & Onboarding', desc: 'Get new hires trained and supported, with real people helping along the way.' },
  { icon: LifeBuoy, title: 'Help Desk', desc: 'Get real help from real people, and track every request until it is resolved.' },
];

export const Features: React.FC = () => (
  <section id="features" className="py-24 px-6 bg-[#F4F5FB]">
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <div className="flex justify-center"><Eyebrow>Platform Features</Eyebrow></div>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Everything Your Organization Needs</h2>
        <p className="text-base text-slate-500 max-w-[560px] mx-auto leading-relaxed">A full platform working as one system, so nothing falls through the cracks.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:border-[#116AEF]/20 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-[#116AEF]" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">{f.title}</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ECO_NODES = [
  { icon: ShieldCheck, label: 'Compliance', x: 300, y: 130 },
  { icon: UserCircle, label: 'Clients', x: 400, y: 163 },
  { icon: FileText, label: 'Forms', x: 462, y: 248 },
  { icon: FolderArchive, label: 'Records', x: 462, y: 353 },
  { icon: AlertCircle, label: 'Incidents', x: 400, y: 438 },
  { icon: Activity, label: 'EVV', x: 300, y: 470 },
  { icon: BarChart3, label: 'Reports', x: 200, y: 438 },
  { icon: Users, label: 'Staff', x: 138, y: 353 },
  { icon: MessageCircle, label: 'Live Chat', x: 138, y: 248 },
  { icon: ListChecks, label: 'Tasks', x: 200, y: 163 },
];

export const Ecosystem: React.FC = () => (
  <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg,#0F172A,#8A96C0)' }}>
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-12">
        <div className="flex justify-center"><Eyebrow light>Connected Platform</Eyebrow></div>
        <h2 className="font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>One System. Everything Connected.</h2>
        <p className="text-base text-white/60 max-w-[520px] mx-auto leading-relaxed">Update one thing, and everything downstream updates with it.</p>
      </div>
      <div className="relative mx-auto" style={{ maxWidth: 520, aspectRatio: '1 / 1' }}>
        <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {ECO_NODES.map((n) => (
            <line key={n.label} x1={300} y1={300} x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
          ))}
        </svg>
        <div
          className="absolute rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          style={{ left: '50%', top: '50%', width: 116, height: 116, transform: 'translate(-50%,-50%)', background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}
        >
          <span className="text-white font-extrabold text-[15px] tracking-tight">MyHCBS</span>
        </div>
        {ECO_NODES.map((n) => (
          <div
            key={n.label}
            className="absolute flex flex-col items-center gap-2"
            style={{ left: `${(n.x / 600) * 100}%`, top: `${(n.y / 600) * 100}%`, transform: 'translate(-50%,-50%)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center">
              <n.icon className="w-5 h-5 text-[#76BCFF]" />
            </div>
            <span className="text-[10.5px] font-semibold text-white/80 whitespace-nowrap">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SOLUTIONS = [
  ['Foster Care', 'Placement records, licensing compliance, caseworker documentation, and regulatory requirements.'],
  ['Behavioral Health', 'Clinical documentation, service authorization reports, compliance tracking, and staff credentialing.'],
  ['IDD Services', 'Person-centered plans, support documentation, incident tracking, and regulatory compliance.'],
  ['Residential Programs', 'Daily living documentation, incident tracking, medication records, and licensing requirements.'],
  ['Home Care', 'EVV visits, caregiver schedules, service documentation, and client records.'],
  ['Adult Services', 'Day programs, community integration, service coordination, and staff-to-participant ratios.'],
  ['Healthcare Services', 'Clinical compliance, patient records, credentialing, and quality assurance in one view.'],
  ['Human Services', 'Case management, service documentation, compliance monitoring, and program reporting.'],
  ['Compliance Programs', 'Configurable regulations, audit readiness, corrective action plans, and oversight.'],
];

const SOL_GRAD = ['#005DFF', '#006F51', '#8A96C0', '#116AEF', '#FF4444', '#F59E0B', '#0F172A', '#006F51', '#005DFF'];

export const Solutions: React.FC = () => (
  <section id="solutions" className="py-24 px-6 bg-white">
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-14">
        <Eyebrow>Industries & Services</Eyebrow>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Built for Your Industry</h2>
        <p className="text-base text-slate-500 max-w-[560px] leading-relaxed">Purpose-built for regulated human services. Whether you run a single program or a multi-site organization, the platform configures to your needs.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOLUTIONS.map(([t, d], i) => (
          <div key={t} className="bg-[#F4F5FB] border border-slate-100 rounded-3xl p-7 hover:bg-white hover:border-[#116AEF]/25 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-default">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md" style={{ background: `linear-gradient(135deg,${SOL_GRAD[i]},${SOL_GRAD[i]}cc)` }}>
              <ShieldCheck className="w-5.5 h-5.5 text-white" style={{ width: 22, height: 22 }} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">{t}</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const People: React.FC = () => (
  <section className="py-24 px-6 bg-white overflow-hidden">
    <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <Eyebrow>Built Around Real Support</Eyebrow>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>
          Made for the People Doing the Work
        </h2>
        <p className="text-base text-slate-500 max-w-[520px] leading-relaxed mb-6">
          Direct support professionals document visits, plans, and progress in real time — right from a
          tablet, in the moment, alongside the people they support. MyHCBS turns that everyday work into
          clean, audit-ready records automatically.
        </p>
        <div className="flex flex-col gap-3">
          {[
            'Real-time documentation during every visit',
            'Person-centered notes tied directly to compliance',
            'Less paperwork, more time with the people who matter',
          ].map((t) => (
            <div key={t} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#116AEF] shrink-0" style={{ width: 18, height: 18 }} />
              <span className="text-sm font-medium text-[#444749]">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <img
          src={PEOPLE_PHOTO}
          alt="A caregiver spending warm, attentive time with the person she supports at home"
          loading="lazy"
          className="w-full h-[420px] object-cover rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        />
        <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-4 py-3 shadow-lg border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#116AEF]" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#0F172A] leading-tight">Visit documented</div>
            <div className="text-[10px] text-slate-400">Synced automatically</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const STEPS = [
  { t: 'Sign up', d: 'Create your account and tell us about your organization.' },
  { t: 'We reach out', d: 'We schedule your onboarding call within 48 hours.' },
  { t: 'We support your setup', d: 'We support you in configuring your programs, users, and workflows.' },
  { t: 'Your team trains', d: 'Hands-on training with a dedicated onboarding specialist.' },
  { t: 'You go live', d: 'Start running your organization on MyHCBS, fully supported.' },
];

const STEP_GRAD = ['#005DFF', '#2A7BEE', '#0EA5A0', '#059669', '#006F51'];

const HIGHLIGHTS = [
  { label: '48-hour onboarding SLA', color: '#116AEF', bg: '#EFF6FF' },
  { label: '6 free training hours', color: '#006F51', bg: '#ECFDF5' },
  { label: 'Live office hours included', color: '#B45309', bg: '#FFF7ED' },
];

export const Onboarding: React.FC = () => (
  <section id="onboarding" className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#EFF6FF,#F4F5FB)' }}>
    <div className="absolute w-[520px] h-[520px] rounded-full blur-[100px] opacity-40 -top-52 -right-40 pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(17,106,239,0.25),transparent 70%)' }} />
    <div className="max-w-[1200px] mx-auto relative">
      <div className="text-center mb-14">
        <div className="flex justify-center"><Eyebrow>Getting Started</Eyebrow></div>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>From Sign-Up to Fully Supported</h2>
        <p className="text-base text-slate-500 max-w-[560px] mx-auto leading-relaxed">A guided path to get your organization configured, trained, and live — with real people helping at every step.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <img
          src={ONBOARDING_PHOTO}
          alt="A group onboarding and training session with caregivers"
          loading="lazy"
          className="w-full h-[300px] object-cover rounded-3xl shadow-[0_16px_50px_rgba(15,23,42,0.15)]"
        />
        <div>
          <div className="flex flex-wrap gap-3 mb-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold" style={{ background: h.bg, color: h.color }}>
                <CheckCircle2 className="w-4 h-4" /> {h.label}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-[15px] leading-relaxed">No guesswork and no long implementation timeline — just a clear path from sign-up to go-live, backed by a dedicated specialist the whole way.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {STEPS.map((s, i) => (
          <div key={s.t} className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
              style={{ background: `linear-gradient(135deg, ${STEP_GRAD[i]}, ${STEP_GRAD[i]}cc)` }}
            >
              {i + 1}
            </div>
            <div className="text-[13px] font-bold text-[#0F172A]">{s.t}</div>
            <div className="text-[11px] text-slate-500 leading-snug">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
