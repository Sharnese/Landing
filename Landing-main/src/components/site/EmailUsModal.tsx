import React, { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { Mail, Copy, Check } from 'lucide-react';
import SiteModal from './SiteModal';

// Email Us — same content/behavior as the original inline section, now in a modal.
const EmailUsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [copied, setCopied] = useState(false);

  return (
    <SiteModal open={open} onClose={onClose} title="Email Us" subtitle="Our support team can answer questions about the platform, pricing, implementation, and onboarding.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-[#F4F5FB] border-[1.5px] border-slate-200 rounded-xl px-4 py-3.5 text-base font-semibold text-[#116AEF]">
          <Mail style={{ width: 18, height: 18 }} /> {BRAND.supportEmail}
        </div>
        <div className="flex gap-2.5">
          <a href={`mailto:${BRAND.supportEmail}`} className="flex-1 py-2.5 bg-white border-[1.5px] border-slate-200 rounded-xl text-[13px] font-semibold text-[#444749] hover:border-[#116AEF] hover:text-[#116AEF] flex items-center justify-center gap-1.5 transition"><Mail className="w-3.5 h-3.5" /> Send Email</a>
          <button onClick={() => { navigator.clipboard.writeText(BRAND.supportEmail); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="flex-1 py-2.5 bg-white border-[1.5px] border-slate-200 rounded-xl text-[13px] font-semibold text-[#444749] hover:border-[#116AEF] hover:text-[#116AEF] flex items-center justify-center gap-1.5 transition">{copied ? <Check className="w-3.5 h-3.5 text-[#006F51]" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy Email'}</button>
        </div>
      </div>
    </SiteModal>
  );
};

export default EmailUsModal;
