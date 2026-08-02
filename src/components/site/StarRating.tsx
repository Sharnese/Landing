import React from 'react';
import { Star } from 'lucide-react';

export const StarDisplay: React.FC<{ value: number; count?: number; size?: number }> = ({ value, count, size = 16 }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} style={{ width: size, height: size }} className={n <= Math.round(value) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-slate-200 text-slate-200'} />
      ))}
    </div>
    <span className="text-xs font-medium text-slate-500">{value ? value.toFixed(1) : 'No ratings'}{count != null && count > 0 ? ` (${count})` : ''}</span>
  </div>
);

export const StarInput: React.FC<{ value: number; onRate: (n: number) => void; disabled?: boolean }> = ({ value, onRate, disabled }) => {
  const [hover, setHover] = React.useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={disabled} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onRate(n)} className="disabled:cursor-not-allowed">
          <Star className={`w-7 h-7 transition ${n <= (hover || value) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-slate-200 text-slate-200'}`} />
        </button>
      ))}
    </div>
  );
};
