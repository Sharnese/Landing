import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DemoModal from '@/components/DemoModal';
import { toast } from 'sonner';
import {
  ArrowLeft, PlayCircle, FileText, Presentation, Bot, BookOpen,
  Video, Download, MessageSquare, Search, HelpCircle, Compass, Sparkles,
} from 'lucide-react';

const TopBar: React.FC<{ onDemo: () => void }> = ({ onDemo }) => (
  <div className="h-[68px] bg-white border-b border-slate-200/60 flex items-center px-6 sticky top-0 z-30">
    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#444749] hover:text-[#116AEF]"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
    <span className="ml-auto font-extrabold text-[18px] tracking-tight text-[#0F172A] hidden sm:block">Learning Center</span>
    <button onClick={onDemo} className="ml-4 text-white text-[13px] font-semibold px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Book a Demo</button>
  </div>
);

const Section: React.FC<{ id?: string; icon: React.ReactNode; title: string; sub?: string; children: React.ReactNode }> = ({ id, icon, title, sub, children }) => (
  <section id={id} className="mb-14">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{icon}</div>
      <div>
        <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
    </div>
    {children}
  </section>
);

const card = 'bg-white rounded-2xl border border-slate-100 shadow-sm p-5';

const MANUALS = [
  { role: 'Administrator', desc: 'Org setup, user roles, billing, system configuration, and compliance settings.' },
  { role: 'Supervisor', desc: 'Team oversight, approvals, reporting, and managing individual records.' },
  { role: 'End User', desc: 'Day-to-day workflows: forms, visit verification, and documentation.' },
];

const VIDEO_LIBRARY: { module: string; videos: string[] }[] = [
  { module: 'Getting Started', videos: ['Platform Overview', 'Navigation Basics', 'Your First Login'] },
  { module: 'Compliance Dashboard', videos: ['Dashboard Tour', 'Reading Compliance Scores', 'Alerts & Tasks'] },
  { module: 'My Individuals', videos: ['Adding Individuals', 'ISP & Care Plans', 'Records Overview'] },
  { module: 'Form Builder', videos: ['Building a Form', 'Conditional Logic', 'Publishing Forms'] },
  { module: 'Records Management', videos: ['Document Storage', 'Version History', 'Audit Trails'] },
  { module: 'Employee Compliance', videos: ['Credential Tracking', 'Training Records', 'Expiration Alerts'] },
];

const LearningCenter: React.FC = () => {
  const [demo, setDemo] = useState(false);
  const request = (label: string) => toast.success(`Thanks! We'll send the ${label} to your inbox — book a demo for instant access.`);

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter]">
      <TopBar onDemo={() => setDemo(true)} />

      {/* Hero */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1100px] mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 text-[#116AEF]"><Sparkles className="w-3.5 h-3.5" /> Learning Center</div>
          <h1 className="font-extrabold text-[#0F172A] tracking-tight mb-3" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Everything you need to master MyHCBS</h1>
          <p className="text-base text-slate-500 max-w-[600px] mx-auto">Recorded presentations, downloadable decks, training manuals, a video library, and an AI knowledge base — all in one place.</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-14">
        {/* Recorded Product Presentation */}
        <Section icon={<PlayCircle className="w-5 h-5" />} title="Recorded Product Presentation" sub="A professionally recorded overview of the MyHCBS platform.">
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-black aspect-video flex items-center justify-center relative">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0F172A,#005DFF)' }} />
            <button onClick={() => setDemo(true)} className="relative z-10 flex flex-col items-center gap-3 text-white">
              <PlayCircle className="w-16 h-16" />
              <span className="text-sm font-semibold">Watch the MyHCBS Overview</span>
            </button>
          </div>
        </Section>

        {/* Downloadable Presentation Deck */}
        <Section icon={<Presentation className="w-5 h-5" />} title="Downloadable Presentation Deck" sub="Share MyHCBS with your team and stakeholders.">
          <div className={card + ' flex flex-col md:flex-row md:items-center gap-5'}>
            <div className="flex-1">
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                {['Platform Overview', 'Core Modules', 'Industry Use Cases', 'Implementation Process', 'Customer Benefits'].map((x) => (
                  <li key={x} className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#116AEF]" /> {x}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => request('presentation deck')} className="text-white text-sm font-semibold px-5 py-3 rounded-xl inline-flex items-center gap-2 shrink-0" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}><Download className="w-4 h-4" /> Get the Deck</button>
          </div>
        </Section>

        {/* Live Demo Information */}
        <Section icon={<Compass className="w-5 h-5" />} title="Live Demo Information" sub="Every customer receives a personalized live demonstration.">
          <div className="grid md:grid-cols-2 gap-5">
            <div className={card}>
              <h3 className="font-bold text-[#0F172A] mb-2">Standard Platform Demonstration</h3>
              <p className="text-sm text-slate-500 mb-3">Every demo begins with the core MyHCBS workflow:</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {['Platform Overview', 'Compliance Dashboard', 'My Individuals', 'Form Builder'].map((x) => <li key={x} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#116AEF]" /> {x}</li>)}
              </ul>
            </div>
            <div className={card}>
              <h3 className="font-bold text-[#0F172A] mb-2">Customized Demonstration</h3>
              <p className="text-sm text-slate-500 mb-3">We then tailor the session to your organization — for example Incident Management, Employee Compliance, or EVV — based on the interests you select.</p>
              <button onClick={() => setDemo(true)} className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Book Your Demo</button>
            </div>
          </div>
        </Section>

        {/* AI Knowledge Base */}
        <Section icon={<Bot className="w-5 h-5" />} title="AI Knowledge Base" sub="Self-serve answers, documentation, and guided help.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <MessageSquare className="w-5 h-5" />, t: 'AI Chat Assistant', d: 'Ask anything about MyHCBS and get instant answers.', to: '/' },
              { icon: <Search className="w-5 h-5" />, t: 'Searchable Documentation', d: 'Browse detailed product docs by topic.', to: '/use-cases' },
              { icon: <HelpCircle className="w-5 h-5" />, t: 'Frequently Asked Questions', d: 'Quick answers to common questions.', to: '/' },
              { icon: <Compass className="w-5 h-5" />, t: 'Guided Walkthroughs', d: 'Step-by-step tours of every module.', to: '#video-library' },
            ].map((c) => (
              c.to.startsWith('#')
                ? <a key={c.t} href={c.to} className={card + ' hover:-translate-y-1 transition-all block'}><div className="text-[#116AEF] mb-2">{c.icon}</div><h4 className="font-bold text-sm text-[#0F172A] mb-1">{c.t}</h4><p className="text-xs text-slate-500">{c.d}</p></a>
                : <Link key={c.t} to={c.to} className={card + ' hover:-translate-y-1 transition-all block'}><div className="text-[#116AEF] mb-2">{c.icon}</div><h4 className="font-bold text-sm text-[#0F172A] mb-1">{c.t}</h4><p className="text-xs text-slate-500">{c.d}</p></Link>
            ))}
          </div>
        </Section>

        {/* PDF Training Manuals */}
        <Section icon={<BookOpen className="w-5 h-5" />} title="PDF Training Manuals" sub="Role-based manuals for every user in your organization.">
          <div className="grid sm:grid-cols-3 gap-4">
            {MANUALS.map((m) => (
              <div key={m.role} className={card}>
                <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-[#116AEF]" /><h4 className="font-bold text-sm text-[#0F172A]">{m.role} Manual</h4></div>
                <p className="text-xs text-slate-500 mb-4">{m.desc}</p>
                <button onClick={() => request(`${m.role} manual`)} className="text-[#116AEF] text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 hover:border-[#116AEF]"><Download className="w-3.5 h-3.5" /> Download PDF</button>
              </div>
            ))}
          </div>
        </Section>

        {/* Training Video Library */}
        <Section id="video-library" icon={<Video className="w-5 h-5" />} title="Training Video Library" sub="Browse training videos organized by module.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VIDEO_LIBRARY.map((m) => (
              <div key={m.module} className={card}>
                <h4 className="font-bold text-sm text-[#0F172A] mb-3">{m.module}</h4>
                <ul className="space-y-2">
                  {m.videos.map((v) => (
                    <li key={v}>
                      <button onClick={() => request(`"${v}" training video`)} className="w-full text-left flex items-center gap-2 text-[13px] text-slate-600 hover:text-[#116AEF]">
                        <PlayCircle className="w-4 h-4 text-[#116AEF] shrink-0" /> {v}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <DemoModal open={demo} onClose={() => setDemo(false)} />
    </div>
  );
};

export default LearningCenter;
