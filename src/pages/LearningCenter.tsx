import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import DemoModal from '@/components/DemoModal';
import {
  ArrowLeft, PlayCircle, FileText, Presentation, Bot, BookOpen,
  Video, Download, MessageSquare, Search, HelpCircle, Compass, Sparkles, Loader2,
} from 'lucide-react';

type ResourceRow = { id: string; kind: 'video' | 'file'; title: string; url: string };
type ModuleRow = { id: string; name: string; description: string | null; resources: ResourceRow[] };

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

const LearningCenter: React.FC = () => {
  const [demo, setDemo] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: mods } = await supabase.from('mq_learning_modules').select('*').order('sort_order', { ascending: true });
      const ids = (mods || []).map((m: any) => m.id);
      let byModule: Record<string, ResourceRow[]> = {};
      if (ids.length) {
        const { data: res } = await supabase.from('mq_learning_resources').select('*').in('module_id', ids).order('sort_order', { ascending: true });
        (res || []).forEach((r: any) => { (byModule[r.module_id] = byModule[r.module_id] || []).push(r); });
      }
      setModules((mods || []).map((m: any) => ({ ...m, resources: byModule[m.id] || [] })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter]">
      <TopBar onDemo={() => setDemo(true)} />

      {/* Hero */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1100px] mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 text-[#116AEF]"><Sparkles className="w-3.5 h-3.5" /> Learning Center</div>
          <h1 className="font-extrabold text-[#0F172A] tracking-tight mb-3" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Everything you need to master MyHCBS</h1>
          <p className="text-base text-slate-500 max-w-[600px] mx-auto">Recorded presentations, training videos, and downloadable manuals — organized by module, all in one place.</p>
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
              { icon: <Compass className="w-5 h-5" />, t: 'Guided Walkthroughs', d: 'Step-by-step tours of every module.', to: '#modules' },
            ].map((c) => (
              c.to.startsWith('#')
                ? <a key={c.t} href={c.to} className={card + ' hover:-translate-y-1 transition-all block'}><div className="text-[#116AEF] mb-2">{c.icon}</div><h4 className="font-bold text-sm text-[#0F172A] mb-1">{c.t}</h4><p className="text-xs text-slate-500">{c.d}</p></a>
                : <Link key={c.t} to={c.to} className={card + ' hover:-translate-y-1 transition-all block'}><div className="text-[#116AEF] mb-2">{c.icon}</div><h4 className="font-bold text-sm text-[#0F172A] mb-1">{c.t}</h4><p className="text-xs text-slate-500">{c.d}</p></Link>
            ))}
          </div>
        </Section>

        {/* Module Library — videos and digital manuals, managed per module from Admin */}
        <Section id="modules" icon={<BookOpen className="w-5 h-5" />} title="Module Library" sub="Training videos and downloadable manuals, organized by module.">
          {loading ? (
            <div className="flex justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : modules.length === 0 ? (
            <div className={card + ' text-center text-sm text-slate-400 py-10'}>Module resources are on the way — check back soon, or book a demo for a full walkthrough.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((m) => {
                const videos = m.resources.filter((r) => r.kind === 'video');
                const files = m.resources.filter((r) => r.kind === 'file');
                return (
                  <div key={m.id} className={card}>
                    <h4 className="font-bold text-sm text-[#0F172A] mb-1">{m.name}</h4>
                    {m.description && <p className="text-xs text-slate-500 mb-3">{m.description}</p>}

                    {videos.length > 0 && (
                      <ul className="space-y-2 mb-3">
                        {videos.map((v) => (
                          <li key={v.id}>
                            <a href={v.url} target="_blank" rel="noreferrer" className="w-full text-left flex items-center gap-2 text-[13px] text-slate-600 hover:text-[#116AEF]">
                              <Video className="w-4 h-4 text-[#116AEF] shrink-0" /> {v.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    {files.length > 0 && (
                      <ul className="space-y-2">
                        {files.map((f) => (
                          <li key={f.id}>
                            <a href={f.url} target="_blank" rel="noreferrer" download className="w-full text-left flex items-center gap-2 text-[13px] text-slate-600 hover:text-[#116AEF]">
                              <Download className="w-4 h-4 text-[#116AEF] shrink-0" /> {f.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    {videos.length === 0 && files.length === 0 && <p className="text-xs text-slate-400">Content coming soon.</p>}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <DemoModal open={demo} onClose={() => setDemo(false)} />
    </div>
  );
};

export default LearningCenter;
