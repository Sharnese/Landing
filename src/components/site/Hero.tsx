import React from 'react';
import { BRAND } from '@/lib/brand';
import { Calendar } from 'lucide-react';

const Metric = ({ label, val, tag, tagColor }: any) => (
  <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
    <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{label}</div>
    <div className="text-lg font-extrabold text-[#0F172A] tracking-tight">{val}</div>
    <div className="text-[9px] font-semibold mt-0.5 inline-block px-1.5 rounded" style={{ background: tagColor + '1a', color: tagColor }}>{tag}</div>
  </div>
);

const Hero: React.FC<{ onDemo: () => void; onGetStarted?: () => void }> = ({ onDemo }) => {

  return (
    <section id="top" className="pt-[68px] min-h-screen flex items-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#EFF6FF 0%,#F4F5FB 60%,#fff 100%)' }}>
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-50 -top-[150px] -right-[100px]" style={{ background: 'radial-gradient(circle,rgba(17,106,239,0.18),transparent 70%)' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 bottom-0 left-24" style={{ background: 'radial-gradient(circle,rgba(0,111,81,0.15),transparent 70%)' }} />
      <div className="max-w-[1200px] mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#116AEF]/[0.08] border border-[#116AEF]/20 text-[#116AEF] text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wide mb-5">
            <span className="w-1.5 h-1.5 bg-[#116AEF] rounded-full animate-pulse" />
            Enterprise Quality & Compliance Platform
          </div>
          <h1 className="font-black leading-[1.08] tracking-tight text-[#0F172A] mb-5" style={{ fontSize: 'clamp(36px,5vw,56px)' }}>
            Stay <span className="text-[#116AEF]">Audit Ready.</span><br />Know Your <span className="text-[#006F51]">Status.</span>
          </h1>
          <p className="text-[17px] text-slate-500 leading-relaxed max-w-[520px] mb-2">
            Stop preparing for your audit. Stay ready — all the time.
          </p>
          <p className="text-[17px] text-slate-500 leading-relaxed max-w-[520px] mb-9">
            Real-time data, driving quality services. MyHCBS takes the guessing out of it.
          </p>
          <div className="flex gap-3.5 flex-wrap mb-12">
            <button onClick={onDemo} className="inline-flex items-center gap-2 bg-white text-[#0F172A] text-[15px] font-semibold px-7 py-3.5 rounded-xl border-[1.5px] border-slate-200 shadow-sm hover:border-[#116AEF] hover:-translate-y-0.5 transition-all">
              <Calendar className="w-4 h-4" /> Book a Demo
            </button>
          </div>
          <div className="flex gap-7">
            {[['12+', 'Industries Served'], ['100%', 'Configurable'], ['48hr', 'Onboarding SLA']].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{n}</div>
                <div className="text-xs text-slate-400 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.14)] overflow-hidden border border-slate-200">
            <div className="bg-[#0F172A] px-5 py-3.5 flex items-center justify-between">
              <span className="text-[13px] font-bold text-white tracking-tight">MyHCBS — Compliance Dashboard</span>
              <div className="flex gap-1.5">
                {['#FF4444', '#F59E0B', '#006F51'].map((c) => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />)}
              </div>
            </div>
            <div className="p-5 bg-[#F4F5FB]">
              <div className="grid grid-cols-4 gap-2.5 mb-3.5">
                <Metric label="Compliance" val="94.2%" tag="↑ 3.1%" tagColor="#006F51" />
                <Metric label="Incidents" val="7" tag="2 urgent" tagColor="#FF4444" />
                <Metric label="Records" val="1,248" tag="↑ 12" tagColor="#116AEF" />
                <Metric label="Tasks Due" val="23" tag="Today" tagColor="#F59E0B" />
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] gap-2.5 mb-2.5">
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Monthly Compliance Score</div>
                  <div className="flex items-end gap-1.5 h-[60px]">
                    {[52, 65, 58, 72, 78, 85, 88, 92].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t" style={{ height: h + '%', background: `rgba(17,106,239,${0.2 + i * 0.05})` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-2">Credentials</div>
                  <div className="relative flex items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#116AEF" strokeWidth="10" strokeDasharray="167 21" strokeDashoffset="25" strokeLinecap="round" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#006F51" strokeWidth="10" strokeDasharray="12 176" strokeDashoffset="-141" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-base font-extrabold text-[#0F172A]">88%</div>
                      <div className="text-[8px] text-slate-400 font-semibold">Current</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-2">Recent Activity</div>
                {[['#FF4444', 'Medication Error — Residential', 'Open'], ['#F59E0B', 'EVV Exception — Home Care', 'Review'], ['#006F51', 'Documentation Audit', 'Closed']].map(([c, t, b]) => (
                  <div key={t} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                    <div className="text-[9px] text-slate-500 font-medium flex-1">{t}</div>
                    <div className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: (c as string) + '1a', color: c }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-10 bg-white rounded-2xl px-4 py-3 shadow-lg border border-slate-100 min-w-[180px]">
            <div className="text-[9px] font-bold uppercase tracking-wide text-[#006F51] mb-1">Compliance Score</div>
            <div className="text-lg font-extrabold text-[#0F172A]">94.2%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">↑ 3.1% this month</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
