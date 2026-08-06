import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { StarDisplay, StarInput } from '@/components/site/StarRating';
import { ArrowLeft, Loader2 } from 'lucide-react';

type UseCase = {
  id: string; title: string; slug: string; industry: string | null; summary: string | null;
  content: string | null; image_url: string | null; tags: string[] | null; author: string | null;
  created_at: string;
};

async function getIp(): Promise<string> {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const j = await r.json();
    return j.ip || 'unknown';
  } catch { return 'unknown'; }
}

const UseCaseDetail: React.FC = () => {
  const { slug } = useParams();
  const [uc, setUc] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadRatings = async (id: string) => {
    const { data } = await supabase.from('mq_use_case_ratings').select('rating').eq('use_case_id', id);
    const rows = data || [];
    setCount(rows.length);
    setAvg(rows.length ? rows.reduce((s: number, r: any) => s + r.rating, 0) / rows.length : 0);
  };

  const load = async () => {
    setLoading(true); setErr('');
    const { data, error } = await supabase.from('mq_use_cases').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
    if (error) { setErr('Could not load this use case.'); setLoading(false); return; }
    if (!data) { setErr('Use case not found.'); setLoading(false); return; }
    setUc(data as UseCase);
    await loadRatings((data as UseCase).id);
    if (localStorage.getItem(`uc_rated_${(data as UseCase).id}`)) setRated(true);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const rate = async (n: number) => {
    if (!uc || rated || submitting) return;
    setSubmitting(true);
    setMyRating(n);
    const ip = await getIp();
    // Prevent obvious duplicates: one rating per IP per use case.
    const { data: existing } = await supabase.from('mq_use_case_ratings').select('id').eq('use_case_id', uc.id).eq('ip_address', ip).limit(1);
    if (existing && existing.length) {
      setRated(true); localStorage.setItem(`uc_rated_${uc.id}`, '1'); setSubmitting(false);
      return;
    }
    await supabase.from('mq_use_case_ratings').insert({ use_case_id: uc.id, rating: n, ip_address: ip });
    localStorage.setItem(`uc_rated_${uc.id}`, '1');
    setRated(true);
    await loadRatings(uc.id);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white font-[Inter]">
      <div className="h-[68px] bg-white border-b border-slate-200/60 flex items-center px-6 sticky top-0 z-30">
        <Link to="/use-cases" className="flex items-center gap-2 text-sm font-semibold text-[#444749] hover:text-[#116AEF]"><ArrowLeft className="w-4 h-4" /> All Use Cases</Link>
      </div>

      {loading && <div className="flex justify-center py-32 text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}
      {!loading && err && <div className="text-center py-32"><p className="text-sm text-[#FF4444] mb-3">{err}</p><Link to="/use-cases" className="text-sm font-semibold text-[#116AEF]">Back to Use Cases</Link></div>}

      {!loading && !err && uc && (
        <article className="max-w-[760px] mx-auto px-6 py-12">
          {uc.industry && <span className="inline-block text-[11px] font-semibold text-[#116AEF] bg-[#EFF6FF] rounded-full px-3 py-1 mb-4">{uc.industry}</span>}
          <h1 className="font-extrabold text-[#0F172A] tracking-tight mb-3" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{uc.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <StarDisplay value={avg} count={count} />
            {uc.author && <span className="text-xs text-slate-400">By {uc.author}</span>}
            <span className="text-xs text-slate-400">{new Date(uc.created_at).toLocaleDateString()}</span>
          </div>
          {uc.image_url && <img src={uc.image_url} alt={uc.title} className="w-full rounded-3xl mb-8 object-cover max-h-[380px]" />}
          {uc.summary && <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">{uc.summary}</p>}
          <div className="prose prose-slate max-w-none text-[15px] text-slate-700 leading-relaxed whitespace-pre-line mb-8">{uc.content}</div>
          {uc.tags && uc.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {uc.tags.map((t) => <span key={t} className="text-xs font-medium text-[#444749] bg-[#F4F5FB] border border-slate-100 rounded-full px-3 py-1">{t}</span>)}
            </div>
          )}

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Rate this use case</h3>
            <p className="text-[13px] text-slate-500 mb-4">{rated ? 'Thanks for your rating!' : 'Tap a star to share your feedback.'}</p>
            <StarInput value={rated ? myRating || Math.round(avg) : myRating} onRate={rate} disabled={rated || submitting} />
            <p className="text-xs text-slate-400 mt-3">Average rating: {avg ? avg.toFixed(1) : '—'} from {count} {count === 1 ? 'rating' : 'ratings'}.</p>
          </div>
        </article>
      )}
    </div>
  );
};

export default UseCaseDetail;
