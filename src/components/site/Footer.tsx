import React from 'react';
import { BRAND } from '@/lib/brand';
import { Link } from 'react-router-dom';
import { usePageVisibility } from '@/contexts/PageVisibility';
const Footer: React.FC<{
  onDemo: () => void;
}> = ({
  onDemo
}) => {
  const { isVisible } = usePageVisibility();
  return <footer className="bg-[#0F172A] pt-14 px-6 pb-8" id="resources">
    <div className="max-w-[1200px] mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-lg text-white mb-1">
            <img src="/images/logo-icon.png" alt="MyHCBS logo" className="w-9 h-9 object-contain" />
            <span><span className="text-[#76BCFF]">my</span>HCBS</span>
          </div>
          <div className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-3">Health Care Based Software</div>
          <p className="text-[13px] text-white/45 leading-relaxed max-w-[280px]" data-mixed-content="true">{BRAND.primarySlogan} Built for human services, healthcare, and regulated industries.</p>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-4">Platform</h4>
          <ul className="space-y-2">{['Compliance Dashboard', 'Form Builder', 'Records Management', 'Incident Management', 'EVV Management', 'Reporting Engine'].map(x => <li key={x}><a href="#features" className="text-[13px] text-white/50 hover:text-white/85 transition">{x}</a></li>)}</ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-4">Solutions</h4>
          <ul className="space-y-2">{['Foster Care', 'Behavioral Health', 'IDD Services', 'Residential Programs', 'Home Care', 'Adult Services'].map(x => <li key={x}><a href="#solutions" className="text-[13px] text-white/50 hover:text-white/85 transition">{x}</a></li>)}</ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-wide mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#onboarding" className="text-[13px] text-white/50 hover:text-white/85 transition">Onboarding</a></li>
            <li><button onClick={onDemo} className="text-[13px] text-white/50 hover:text-white/85 transition">Book a Demo</button></li>
            <li><a href={`mailto:${BRAND.supportEmail}`} className="text-[13px] text-white/50 hover:text-white/85 transition">Contact Us</a></li>
            <li><Link to="/book/appointment" className="text-[13px] text-white/50 hover:text-white/85 transition">Book Appointment</Link></li>
            {isVisible('pricing') && <li><Link to="/pricing" className="text-[13px] text-white/50 hover:text-white/85 transition">Pricing</Link></li>}
            {isVisible('use_cases') && <li><Link to="/use-cases" className="text-[13px] text-white/50 hover:text-white/85 transition">Use Cases</Link></li>}
            {isVisible('learning_center') && <li><Link to="/learning-center" className="text-[13px] text-white/50 hover:text-white/85 transition">Learning Center</Link></li>}
            <li><Link to="/admin" className="text-[13px] text-white/50 hover:text-white/85 transition">EE LOGIN</Link></li>
            <li><a href="https://mauditready.com/tenant" className="text-[11px] text-white/85 hover:text-white/55 transition">LOGIN</a></li>

          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-white/35" data-mixed-content="true">© {new Date().getFullYear()} MyHCBS All rights reserved.</p>
        <div className="flex gap-5">{['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(x => <a key={x} href="#" className="text-xs text-white/35 hover:text-white/60 transition">{x}</a>)}</div>
      </div>
    </div>
  </footer>;
};
export default Footer;
