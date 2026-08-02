import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Onboarding', href: '#onboarding' },
  { label: 'Appointments', href: '#appointments' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
];

const Logo = () => (
  <a href="#top" className="flex items-center gap-2.5 font-extrabold text-[20px] tracking-tight text-[#0F172A]">
    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shadow-[0_3px_10px_rgba(17,106,239,0.35)]"
      style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" className="w-[18px] h-[18px]">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    </div>
    <span>MyHcbs<span className="text-[#116AEF]"></span></span>
  </a>
);

const SiteNav: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-[1000] h-[68px] bg-white/90 backdrop-blur-xl border-b border-slate-200/60 transition-shadow ${scrolled ? 'shadow-[0_4px_24px_rgba(15,23,42,0.08)]' : ''}`}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-full px-6">
        <Logo />
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-sm font-medium text-slate-500 px-3.5 py-1.5 rounded-lg hover:text-[#0F172A] hover:bg-[#F4F5FB] transition-colors">{l.label}</a>
            </li>
          ))}
        </ul>
        <button className="md:hidden text-[#0F172A]" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600 py-2">{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default SiteNav;
