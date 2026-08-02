import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BRAND } from '@/lib/brand';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Msg = { from: 'bot' | 'user'; text: string; links?: { label: string; href: string; external?: boolean }[] };

/**
 * Suggestion-button mapping system.
 * Add / edit chips here. actionType controls what a chip does:
 *  - 'chat'        -> sends `chat` (or label) into the conversation + triggers an AI response
 *  - 'navigate'    -> client-side route navigation (target = path)
 *  - 'scroll'      -> smooth-scroll to an element id (target = '#id'); navigates home first if needed
 *  - 'openModal'   -> opens a known modal (target = modal key, e.g. 'demo')
 *  - 'externalLink'-> opens an external url in a new tab (target = url)
 */
type SuggestionAction = 'chat' | 'navigate' | 'scroll' | 'openModal' | 'externalLink';
type Suggestion = { label: string; actionType: SuggestionAction; target?: string; chat?: string };

const SUGGESTIONS: Suggestion[] = [
  { label: 'Book a Demo', actionType: 'openModal', target: 'demo' },
  { label: 'Request a Call', actionType: 'openModal', target: 'call' },
  { label: 'Email Us', actionType: 'externalLink', target: `mailto:${BRAND.supportEmail}` },
  { label: 'Compliance Dashboard', actionType: 'scroll', target: '#features' },
  { label: 'Form Builder', actionType: 'scroll', target: '#features' },
  { label: 'Records Management', actionType: 'scroll', target: '#features' },
  { label: 'Employee Compliance', actionType: 'chat', chat: 'How does MyHCBS handle employee compliance and training tracking?' },
  { label: 'AI Knowledge Base', actionType: 'chat', chat: 'Tell me about the MyHCBS AI knowledge base.' },
  { label: 'Training', actionType: 'navigate', target: '/book/training' },
  { label: 'Onboarding', actionType: 'scroll', target: '#onboarding' },
  { label: 'Office Hours', actionType: 'navigate', target: '/book/office-hours' },
];

const Chatbot: React.FC<{ onDemo: () => void; onCall?: () => void }> = ({ onDemo, onCall }) => {

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [kb, setKb] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: "Hi! I'm the MyHCBS assistant. I can help you learn about our quality, compliance, and care platform. What would you like to know?" },
  ]);
  const navigate = useNavigate();
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only PUBLISHED / ACTIVE knowledge base entries are used as AI context.
    supabase.from('mq_kb').select('*').in('status', ['Published', 'Active'])
      .then(({ data }) => setKb(data || []));
  }, []);

  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [msgs, open, loading]);

  const push = (m: Msg) => setMsgs((p) => [...p, m]);

  // --- keyword retrieval over the published KB; returns top matches to send as AI context ---
  const retrieveKb = (q: string) => {
    const lq = q.toLowerCase();
    const terms = lq.split(/\W+/).filter((t) => t.length > 3);
    const scored = kb.map((k) => {
      const hay = `${k.title || ''} ${k.category || ''} ${k.keywords || ''} ${k.content || k.body || ''}`.toLowerCase();
      let score = 0;
      for (const t of terms) if (hay.includes(t)) score += 1;
      if ((k.title || '').toLowerCase() && lq.includes((k.title || '').toLowerCase())) score += 3;
      return { k, score };
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((x) => x.k);
    return scored.length ? scored : kb.slice(0, 3); // fall back to a few entries for general context
  };

  // --- send a message to the server-side AI endpoint (KB context injected server-side) ---
  const askAI = async (q: string) => {
    push({ from: 'user', text: q });
    setLoading(true);
    try {
      const history = msgs.slice(-8).map((m) => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text }));
      const contextKb = retrieveKb(q).map((k) => ({ title: k.title, category: k.category, content: k.content || k.body }));
      const { data, error } = await supabase.functions.invoke('mq-chat', {
        body: { message: q, history, kb: contextKb },
      });
      if (error) throw error;
      const reply = (data && (data.reply as string)) || `I'm sorry, I couldn't find that. Please email ${BRAND.supportEmail} and our team will help.`;
      push({ from: 'bot', text: reply });
    } catch (e) {
      push({ from: 'bot', text: `I'm having trouble responding right now. Please try again in a moment, or email ${BRAND.supportEmail}.` });
    } finally {
      setLoading(false);
    }
  };

  const send = () => {
    const q = input.trim();
    if (!q || loading) return; // prevent empty / duplicate submissions
    setInput('');
    askAI(q);
  };

  // --- handle a suggestion chip according to its mapping ---
  const runSuggestion = (s: Suggestion) => {
    switch (s.actionType) {
      case 'chat':
        askAI(s.chat || s.label);
        return;
      case 'openModal':
        if (s.target === 'demo') { onDemo(); push({ from: 'bot', text: 'Opening the demo scheduler for you now.' }); }
        else if (s.target === 'call') {
          if (onCall) { onCall(); push({ from: 'bot', text: 'Opening the call request form for you now.' }); }
          else scrollToTarget('#contact');
        }
        return;

      case 'navigate':
        if (s.target) { navigate(s.target); setOpen(false); }
        return;
      case 'scroll':
        scrollToTarget(s.target || '');
        return;
      case 'externalLink':
        if (s.target) window.open(s.target, s.target.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
        return;
    }
  };

  const scrollToTarget = (target: string) => {
    const id = target.replace('#', '');
    const go = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setOpen(false); }
    };
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(go, 350);
    } else {
      go();
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-7 right-7 z-[900] w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-[0_8px_28px_rgba(17,106,239,0.45)] hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#006F51] rounded-full border-2 border-white animate-pulse" />
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-7 right-7 z-[900] w-[min(360px,calc(100vw-2rem))] bg-white rounded-3xl shadow-[0_20px_70px_rgba(15,23,42,0.18)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#0F172A,#8A96C0)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}><MessageCircle className="w-5 h-5 text-white" /></div>
            <div className="flex-1"><h4 className="text-sm font-bold text-white">MyHCBS Assistant</h4><p className="text-[11px] text-white/50">Online · Powered by AI</p></div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white"><X className="w-[18px] h-[18px]" /></button>
          </div>
          <div ref={bodyRef} className="p-5 flex-1 overflow-y-auto max-h-[300px]">
            {msgs.map((m, i) => (
              <div key={i} className="mb-3">
                {m.from === 'bot' ? (
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 mb-1">MyHCBS Assistant</span>
                    <div className="bg-[#F4F5FB] border border-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13px] text-[#444749] leading-relaxed inline-block max-w-[90%] whitespace-pre-wrap">{m.text}</div>
                    {m.links && <div className="flex flex-wrap gap-1.5 mt-2">{m.links.map((l) => l.external ? (
                      <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#116AEF] bg-[#EFF6FF] border border-[#116AEF]/20 rounded-full px-3 py-1 hover:bg-[#116AEF]/10">{l.label}</a>
                    ) : (
                      <button key={l.label} onClick={() => { navigate(l.href); setOpen(false); }} className="text-[11px] font-semibold text-[#116AEF] bg-[#EFF6FF] border border-[#116AEF]/20 rounded-full px-3 py-1 hover:bg-[#116AEF]/10">{l.label}</button>
                    ))}</div>}
                  </div>
                ) : (
                  <div className="text-right"><div className="inline-block text-white text-[13px] rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[90%]" style={{ background: '#116AEF' }}>{m.text}</div></div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mb-3">
                <span className="block text-[11px] font-bold text-slate-400 mb-1">MyHCBS Assistant</span>
                <div className="bg-[#F4F5FB] border border-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13px] text-slate-400 inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>
          <div className="px-5 pb-3 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
            {SUGGESTIONS.map((s) => (
              <button key={s.label} onClick={() => runSuggestion(s)} disabled={loading && s.actionType === 'chat'} className="text-[11px] font-semibold text-[#116AEF] bg-[#116AEF]/[0.06] border-[1.5px] border-[#116AEF]/15 rounded-full px-3 py-1.5 hover:bg-[#116AEF]/10 transition disabled:opacity-50">{s.label}</button>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask a question..." disabled={loading} className="flex-1 border-[1.5px] border-slate-200 rounded-full px-3.5 py-2 text-[13px] outline-none focus:border-[#116AEF] disabled:bg-slate-50" />
            <button onClick={send} disabled={loading || !input.trim()} className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-50" style={{ background: '#116AEF' }}>{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
