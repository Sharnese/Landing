import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { StarDisplay } from '@/components/site/StarRating';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

type UseCase = {
  id: string; title: string; slug: string; industry: string | null; summary: string | null;
  image_url: string | null; tags: string[] | null;
};

const TopBar = () => (
  <div className="h-[68px] bg-white border-b border-slate-200/60 flex items-center px-6 sticky top-0 z-30">
    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#444749] hover:text-[#116AEF]"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
    <span className="ml-auto font-extrabold text-[18px] tracking-tight text-[#0F172A]">Use Cases</span>
  </div>
);

const UseCases: React.FC = () => {
  const [items, setItems] = useState<UseCase[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    const { data, error } = await supabase.from('mq_use_cases').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (error) { setErr('Could not load use cases.'); setLoading(false); return; }
    setItems((data || []) as UseCase[]);
    const ids = (data || []).map((d: any) => d.id);
    if (ids.length) {
      const { data: r } = await supabase.from('mq_use_case_ratings').select('use_case_id, rating').in('use_case_id', ids);
      const map: Record<string, { sum: number; count: number }> = {};
      (r || []).forEach((row: any) => {
        map[row.use_case_id] = map[row.use_case_id] || { sum: 0, count: 0 };
        map[row.use_case_id].sum += row.rating; map[row.use_case_id].count += 1;
      });
      const out: Record<string, { avg: number; count: number }> = {};
      Object.entries(map).forEach(([k, v]) => { out[k] = { avg: v.sum / v.count, count: v.count }; });
      setRatings(out);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#F4F5FB] font-[Inter]">
      <TopBar />
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 text-[#116AEF]"><span className="w-2 h-2 rounded-full bg-current" /> Customer Stories</div>
          <h1 className="font-extrabold text-[#0F172A] tracking-tight mb-3" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Use Cases & Success Stories</h1>
          <p className="text-base text-slate-500 max-w-[560px] mx-auto">See how organizations across regulated industries use MyHCBS to streamline compliance, onboarding, and records.</p>
        </div>

        {loading && <div className="flex justify-center py-20 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}
        {!loading && err && <div className="text-center py-20"><p className="text-sm text-[#FF4444] mb-3">{err}</p><button onClick={load} className="text-sm font-semibold text-[#116AEF]">Retry</button></div>}
        {!loading && !err && items.length === 0 && <p className="text-center py-20 text-slate-400 text-sm">No use cases published yet.</p>}

        {!loading && !err && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((u) => {
              const r = ratings[u.id] || { avg: 0, count: 0 };
              return (
                <Link key={u.id} to={`/use-cases/${u.slug}`} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all flex flex-col">
                  {u.image_url
                    ? <img src={u.image_url} alt={u.title} className="w-full h-44 object-cover" />
                    : <div className="w-full h-44" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }} />}
                  <div className="p-6 flex flex-col flex-1">
                    {u.industry && <span className="inline-block self-start text-[11px] font-semibold text-[#116AEF] bg-[#EFF6FF] rounded-full px-3 py-1 mb-3">{u.industry}</span>}
                    <h3 className="text-base font-bold text-[#0F172A] mb-2">{u.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4 flex-1">{u.summary}</p>
                    <div className="flex items-center justify-between">
                      <StarDisplay value={r.avg} count={r.count} />
                      <span className="text-xs font-semibold text-[#116AEF] inline-flex items-center gap-1">Read More <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UseCases;
