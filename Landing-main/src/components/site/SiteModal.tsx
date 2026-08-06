import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable landing-page modal.
 * - Close X button
 * - Closes on outside (backdrop) click
 * - Closes on Escape key
 * - Responsive on desktop / mobile (full-width with max width, scrollable)
 */
const SiteModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidth = 'max-w-[520px]', children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-5" onClick={onClose}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 sm:px-7 pt-6 sm:pt-7 flex justify-between items-start gap-4">
          <div>
            {title && <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">{title}</h2>}
            {subtitle && <p className="text-[13px] text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-[#0F172A] shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 sm:px-7 py-6">{children}</div>
      </div>
    </div>
  );
};

export default SiteModal;
