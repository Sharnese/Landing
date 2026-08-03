import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Onboarding', href: '#onboarding' },
  { label: 'Appointments', href: '#appointments' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
];

const NavLink: React.FC<{ href: string; className: string; onClick?: () => void; children: React.ReactNode }> = ({ href, className, onClick, children }) =>
  href.startsWith('/') ? (
    <Link to={href} onClick={onClick} className={className}>{children}</Link>
  ) : (
    <a href={href} onClick={onClick} className={className}>{children}</a>
  );

const Logo = () => (
  <a href="#top" className="flex items-center gap-2 tracking-tight text-[#0F172A]">
    <img src="/images/logo-icon.png" alt="MyHCBS logo" className="w-9 h-9 object-contain shrink-0" />
    <span className="flex flex-col leading-none">
      <span className="font-extrabold text-[20px]"><span className="text-[#116AEF]">my</span>HCBS</span>
      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Care Based Software</span>
    </span>
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
              <NavLink href={l.href} className="text-sm font-medium text-slate-500 px-3.5 py-1.5 rounded-lg hover:text-[#0F172A] hover:bg-[#F4F5FB] transition-colors">{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <button className="md:hidden text-[#0F172A]" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600 py-2">{l.label}</NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default SiteNav;
