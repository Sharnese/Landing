import React from 'react';

export const inputCls = 'w-full bg-white border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#116AEF] focus:ring-2 focus:ring-[#116AEF]/10 transition';
export const labelCls = 'block text-xs font-semibold text-[#444749] mb-1';

export const PageHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  New: '#116AEF', Contacted: '#8A96C0', 'Demo Requested': '#F59E0B', 'Demo Scheduled': '#005DFF',
  'Follow Up Later': '#8A96C0', Converted: '#006F51', 'Not Interested': '#FF4444', Archived: '#94A3B8',
  'Pending Review': '#F59E0B', Approved: '#005DFF', 'Alternative Sent': '#8A96C0', Confirmed: '#006F51',
  Full: '#FF4444', Cancelled: '#FF4444', Completed: '#006F51', 'No-Show': '#FF4444',
  'New Subscriber': '#116AEF', 'Onboarding Requested': '#F59E0B', 'Onboarding Scheduled': '#005DFF',
  'Onboarding Completed': '#006F51', Active: '#006F51', Published: '#006F51', Draft: '#F59E0B',
  Success: '#006F51', Error: '#FF4444',
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const c = STATUS_COLORS[status] || '#8A96C0';
  return <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: c + '1a', color: c }}>{status}</span>;
};

export const Btn: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; className?: string }> = ({ onClick, children, variant = 'primary', type = 'button', className = '' }) => {
  const base = 'text-[13px] font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5 ' + className;
  if (variant === 'ghost') return <button type={type} onClick={onClick} className={base + ' border-[1.5px] border-slate-200 text-[#444749] hover:border-[#116AEF] hover:text-[#116AEF]'}>{children}</button>;
  if (variant === 'danger') return <button type={type} onClick={onClick} className={base + ' text-[#FF4444] border-[1.5px] border-[#FF4444]/30 hover:bg-[#FF4444]/5'}>{children}</button>;
  return <button type={type} onClick={onClick} className={base + ' text-white shadow-[0_2px_8px_rgba(17,106,239,0.3)] hover:-translate-y-px'} style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>{children}</button>;
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
);

export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }> = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-5 font-[Inter]" onClick={onClose}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? 'max-w-[640px]' : 'max-w-[480px]'} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-[#0F172A]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-[#0F172A] text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-3"><label className={labelCls}>{label}</label>{children}</div>
);

export const Empty: React.FC<{ text?: string }> = ({ text = 'No records yet.' }) => (
  <div className="text-center py-12 text-sm text-slate-400">{text}</div>
);
