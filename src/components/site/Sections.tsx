import React from 'react';
import { VALUE_PILLS } from '@/lib/brand';
import {
  LayoutDashboard, FileText, FolderArchive, AlertCircle, BarChart3, ShieldCheck,
  Users, Activity, ListChecks, Building2, BookOpen, GraduationCap, ArrowRight, CheckCircle2,
} from 'lucide-react';

const Eyebrow = ({ children, light }: any) => (
  <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 ${light ? 'text-[#76BCFF]' : 'text-[#116AEF]'}`}>
    <span className="w-2 h-2 rounded-full bg-current" /> {children}
  </div>
);

export const ValuePills: React.FC = () => (
  <section className="bg-white py-12 px-6 border-b border-slate-100">
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Platform Capabilities</div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {VALUE_PILLS.map((p) => (
          <div key={p} className="flex items-center gap-1.5 bg-[#F4F5FB] border border-slate-100 rounded-full px-4 py-2 text-[13px] font-medium text-[#444749] hover:border-[#76BCFF] hover:bg-[#EFF6FF] hover:-translate-y-px transition-all">
            <CheckCircle2 className="w-4 h-4 text-[#116AEF]" /> {p}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FEATURES = [
  { icon: LayoutDashboard, title: 'Compliance Dashboard', desc: 'Centralized operational and compliance visibility with real-time metrics, alerts, and oversight across every program.' },
  { icon: FileText, title: 'Dynamic Form Builder', desc: 'Build intelligent forms connected directly to workflows, records, dashboards, and reporting — no code required.' },
  { icon: FolderArchive, title: 'Records Management', desc: 'Manage participant, employee, and compliance records within one secure ecosystem with version control and audit trails.' },
  { icon: AlertCircle, title: 'Incident Management', desc: 'Track, investigate, and monitor incidents with structured workflows, documentation, and integrated reporting.' },
  { icon: BarChart3, title: 'Reporting Engine', desc: 'Generate operational, compliance, and program reports with configurable filtering, date ranges, and exports.' },
  { icon: ShieldCheck, title: 'Compliance Management', desc: 'Monitor regulations, audits, corrective actions, due dates, and organizational readiness in real time.' },
  { icon: Users, title: 'Employee Compliance', desc: 'Track credentials, trainings, clearances, certifications, expirations, and compliance status for every staff member.' },
  { icon: Activity, title: 'EVV Management', desc: 'Support Electronic Visit Verification with scheduling, visit tracking, documentation, and exception management.' },
  { icon: ListChecks, title: 'Task Management', desc: 'Manage tasks, reminders, assignments, escalations, and operational accountability across departments.' },
  { icon: Building2, title: 'Organization Infrastructure', desc: 'Configure locations, departments, programs, services, permissions, and the full operational hierarchy.' },
  { icon: BookOpen, title: 'Knowledge Base', desc: 'Centralized hub for policies, procedures, onboarding resources, and intelligent search capabilities.' },
  { icon: GraduationCap, title: 'Training & Onboarding', desc: 'Structured onboarding with dedicated account specialists, training sessions, guided setup, and office hours.' },
];

export const Features: React.FC = () => (
  <section id="features" className="py-24 px-6 bg-[#F4F5FB]">
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <div className="flex justify-center"><Eyebrow>Platform Features</Eyebrow></div>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight leading-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Everything Your Organization Needs</h2>
        <p className="text-base text-slate-500 max-w-[560px] mx-auto leading-relaxed">Twelve integrated modules — one unified platform. Every feature connects to every other, eliminating silos.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="group bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:border-[#116AEF]/20 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-[#116AEF]" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-2">{f.title}</h3>
            <p className="text-[13.5px] text-slate-500 leading-relaxed mb-4">{f.desc}</p>
            <span className="text-xs font-semibold text-[#116AEF] inline-flex items-center gap-1 group-hover:gap-2 transition-all">Learn more <ArrowRight className="w-3 h-3" /></span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ECO = [
  'Forms feed dashboards', 'Records inform reporting', 'Incidents impact compliance',
  'EVV connects to documentation', 'Employee compliance supports operations',
  'Knowledge Base supports onboarding', 'Tasks create accountability',
];

export const Ecosystem: React.FC = () => (
  <section className="py-24 px-6" style={{ background: 'linear-gradient(135deg,#0F172A,#8A96C0)' }}>
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-14">
        <div className="flex justify-center"><Eyebrow light>Connected Platform</Eyebrow></div>
        <h2 className="font-extrabold text-white tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>One Connected Operational Ecosystem</h2>
        <p className="text-base text-white/60 max-w-[600px] mx-auto leading-relaxed">Every module informs every other. The result is accountability and visibility across your entire organization.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ECO.map((e, i) => (
          <div key={e} className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 backdrop-blur flex items-center gap-3 hover:bg-white/10 hover:border-[#76BCFF]/50 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#116AEF]/20 flex items-center justify-center shrink-0 text-[#76BCFF] font-bold text-sm">{i + 1}</div>
            <span className="text-sm font-medium text-white/85">{e}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SOLUTIONS = [
  ['Foster Care', 'Placement records, licensing compliance, caseworker documentation, and regulatory requirements.'],
  ['Behavioral Health', 'Clinical documentation, service authorizations, compliance tracking, and staff credentialing.'],
  ['IDD Services', 'Person-centered plans, support documentation, regulatory compliance, and waiver management.'],
  ['Residential Programs', 'Daily living documentation, incident tracking, medication records, and licensing requirements.'],
  ['Home Care', 'EVV visits, caregiver schedules, service documentation, billing compliance, and client records.'],
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
        <svg viewBox="0 0 520 440" className="w-full h-auto max-w-[440px] mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="520" height="440" rx="32" fill="#EFF6FF" />
          <rect x="40" y="378" width="440" height="10" rx="5" fill="#E2E8F0" />

          {/* plant */}
          <g transform="translate(452,320)">
            <rect x="-16" y="34" width="32" height="38" rx="7" fill="#8A96C0" />
            <path d="M0 34 C -22 6 -12 -18 0 -38 C 12 -18 22 6 0 34Z" fill="#006F51" />
          </g>

          {/* seated person supported */}
          <g transform="translate(140,250)">
            <rect x="-58" y="18" width="116" height="76" rx="18" fill="#ffffff" stroke="#E2E8F0" strokeWidth="2" />
            <rect x="-58" y="-46" width="18" height="96" rx="9" fill="#ffffff" stroke="#E2E8F0" strokeWidth="2" />
            <rect x="-40" y="-6" width="80" height="76" rx="32" fill="#76BCFF" />
            <circle cx="0" cy="-46" r="33" fill="#F2C9A0" />
            <path d="M-32 -50 a32 32 0 0 1 64 0 q-6 -16 -32 -16 t-32 16Z" fill="#3A2A20" />
            <path d="M-12 -38 Q0 -28 12 -38" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="-11" cy="-48" r="3" fill="#0F172A" />
            <circle cx="11" cy="-48" r="3" fill="#0F172A" />
            <path d="M32 14 Q64 4 58 -28" stroke="#76BCFF" strokeWidth="18" fill="none" strokeLinecap="round" />
            <circle cx="58" cy="-30" r="11" fill="#F2C9A0" />
          </g>

          {/* standing DSP */}
          <g transform="translate(330,222)">
            <rect x="-26" y="96" width="19" height="86" rx="9" fill="#2C2F33" />
            <rect x="7" y="96" width="19" height="86" rx="9" fill="#2C2F33" />
            <rect x="-42" y="12" width="84" height="94" rx="28" fill="#116AEF" />
            <circle cx="0" cy="-24" r="35" fill="#E8B896" />
            <path d="M-35 -30 a35 35 0 0 1 70 0 q-5 -22 -35 -22 t-35 22Z" fill="#1C1F22" />
            <path d="M-12 -16 Q0 -6 12 -16" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="-11" cy="-27" r="3" fill="#0F172A" />
            <circle cx="11" cy="-27" r="3" fill="#0F172A" />
            <rect x="-11" y="34" width="22" height="28" rx="4" fill="#ffffff" />
            <rect x="-7" y="40" width="14" height="4" rx="2" fill="#116AEF" />
            <rect x="-7" y="48" width="14" height="4" rx="2" fill="#CBD5E1" />
            <path d="M-42 42 Q-74 58 -70 96" stroke="#116AEF" strokeWidth="19" fill="none" strokeLinecap="round" />
          </g>

          {/* tablet held between them */}
          <g transform="translate(238,318) rotate(-7)">
            <rect x="-48" y="-64" width="96" height="128" rx="13" fill="#0F172A" />
            <rect x="-40" y="-54" width="80" height="108" rx="7" fill="#ffffff" />
            <rect x="-29" y="-39" width="58" height="9" rx="4.5" fill="#116AEF" />
            <rect x="-29" y="-20" width="42" height="6" rx="3" fill="#CBD5E1" />
            <rect x="-29" y="-6" width="50" height="6" rx="3" fill="#CBD5E1" />
            <rect x="-29" y="8" width="36" height="6" rx="3" fill="#CBD5E1" />
            <circle cx="18" cy="32" r="17" fill="#ACFFF3" />
            <path d="M10 32 l5.5 6.5 L30 22" stroke="#006F51" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* caring accent */}
          <g transform="translate(420,96)">
            <circle r="27" fill="#ffffff" stroke="#E2E8F0" strokeWidth="1.5" />
            <path d="M0 12 C-13 2 -13 -10 -4 -10 C0 -10 0 -6 0 -6 C0 -6 0 -10 4 -10 C13 -10 13 2 0 12Z" fill="#FF4444" />
          </g>
        </svg>
      </div>
    </div>
  </section>
);

const STEPS = [
  'Sign up on the official app', 'Subscription is completed', 'Onboarding request is created',
  'Company setup and onboarding session', 'Training hours and office hours', 'Continued support',
];


export const Onboarding: React.FC = () => (
  <section id="onboarding" className="py-24 px-6" style={{ background: 'linear-gradient(160deg,#EFF6FF,#F4F5FB)' }}>
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-14">
        <div className="flex justify-center"><Eyebrow>Getting Started</Eyebrow></div>
        <h2 className="font-extrabold text-[#0F172A] tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>A Guided Onboarding Journey</h2>
        <p className="text-base text-slate-500 max-w-[560px] mx-auto leading-relaxed">From subscription on the official app to live operations — our structured onboarding gets you configured, trained, and supported.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#116AEF] flex items-center justify-center text-[15px] font-extrabold text-[#116AEF] shadow-[0_4px_16px_rgba(17,106,239,0.15)]">{i + 1}</div>
            <div className="text-[11px] font-semibold text-slate-500 leading-snug">{s}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
