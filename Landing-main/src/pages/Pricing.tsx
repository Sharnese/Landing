import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import DemoModal from '@/components/DemoModal';
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';

type Plan = {
  id: string; name: string; price_label: string; billing_note: string | null;
  description: string | null; features: string[]; cta_label: string; highlighted: boolean;
};

const TopBar: React.FC<{ onDemo: () => void }> = ({ onDemo }) => (
  <div className="h-[68px] bg-white border-b border-slate-200/60 flex items-center px-6 sticky top-0 z-30">
    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#444749] hover:text-[#116AEF]"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
    <span className="ml-auto font-extrabold text-[18px] tracking-tight text-[#0F172A] hidden sm:block">Pricing</span>
    <button onClick={onDemo} className="ml-4 text-white text-[13px] font-semibold px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>Book a Demo</button>
  </div>
);

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('mq_pricing_plans').select('*').order('sort_order', { ascending: true });
      setPlans(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter]">
      <TopBar onDemo={() => setDemo(true)} />

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1000px] mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 text-[#116AEF]"><Sparkles className="w-3.5 h-3.5" /> Pricing</div>
          <h1 className="font-extrabold text-[#0F172A] tracking-tight mb-3" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Plans That Scale With Your Organization</h1>
          <p className="text-base text-slate-500 max-w-[600px] mx-auto">Straightforward pricing for organizations that need to stay audit-ready. Every plan is backed by real people, not just software.</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Pricing is being finalized — book a demo and we'll walk you through it.</div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 3 ? 'md:grid-cols-3' : plans.length === 2 ? 'md:grid-cols-2 max-w-[760px] mx-auto' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl p-7 flex flex-col ${p.highlighted ? 'bg-[#0F172A] text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] lg:-translate-y-3' : 'bg-white border border-slate-100 shadow-sm'}`}
              >
                {p.highlighted && <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#76BCFF] mb-3">Most Popular</div>}
                <h3 className={`text-lg font-extrabold mb-1 ${p.highlighted ? 'text-white' : 'text-[#0F172A]'}`}>{p.name}</h3>
                <div className={`text-3xl font-extrabold mb-1 ${p.highlighted ? 'text-white' : 'text-[#0F172A]'}`}>{p.price_label}</div>
                {p.billing_note && <div className={`text-[12.5px] mb-4 ${p.highlighted ? 'text-white/50' : 'text-slate-400'}`}>{p.billing_note}</div>}
                {p.description && <p className={`text-[13.5px] mb-5 leading-relaxed ${p.highlighted ? 'text-white/70' : 'text-slate-500'}`}>{p.description}</p>}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {(p.features || []).map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-[13.5px] ${p.highlighted ? 'text-white/85' : 'text-[#444749]'}`}>
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlighted ? 'text-[#76BCFF]' : 'text-[#116AEF]'}`} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setDemo(true)}
                  className={`text-sm font-semibold px-5 py-3 rounded-xl text-center transition ${p.highlighted ? 'bg-white text-[#0F172A] hover:-translate-y-0.5' : 'text-white hover:-translate-y-0.5'}`}
                  style={p.highlighted ? {} : { background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}
                >
                  {p.cta_label || 'Book a Demo'}
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[12.5px] text-slate-400 mt-10 max-w-[560px] mx-auto">Every plan includes onboarding support and a dedicated specialist to help you get set up. Pricing shown here reflects current published rates — final terms are confirmed during your onboarding call.</p>
      </div>

      <DemoModal open={demo} onClose={() => setDemo(false)} />
    </div>
  );
};

export default Pricing;
