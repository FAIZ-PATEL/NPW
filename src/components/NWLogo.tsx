import React from 'react';

interface NWLogoProps {
  variant?: 'header' | 'dashboard' | 'card' | 'receipt' | 'icon';
  className?: string;
  showText?: boolean;
}

export const NWLogo: React.FC<NWLogoProps> = ({
  variant = 'header',
  className = '',
  showText = true,
}) => {
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-0.5 shadow-md shadow-blue-950/20 border border-blue-400/30 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nwGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
              <linearGradient id="sparkGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Letter N */}
            <path
              d="M20 78 V24 L44 64 V24"
              stroke="url(#nwGradIcon)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Letter W */}
            <path
              d="M48 24 L58 76 L70 38 L82 76 L92 24"
              stroke="url(#nwGradIcon)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Electric Welding Spark */}
            <path
              d="M46 16 L49 26 L59 27 L51 33 L54 43 L45 36 L37 42 L41 32 L33 27 L43 25 Z"
              fill="url(#sparkGradIcon)"
            />
            <circle cx="50" cy="20" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'receipt') {
    return (
      <div className={`flex items-center justify-center gap-2.5 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 border border-blue-700 shadow-xs">
          <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none">
            <path
              d="M20 78 V24 L44 64 V24"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M48 24 L58 76 L70 38 L82 76 L92 24"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M46 16 L49 26 L59 27 L51 33 L54 43 L45 36 L37 42 L41 32 L33 27 L43 25 Z"
              fill="#F59E0B"
            />
          </svg>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="font-black text-sm tracking-tight text-slate-900 font-mono">
              NW SERVICE CENTER
            </span>
          </div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            National Welding Machine Specialists
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-1 shadow-lg shadow-blue-950/25 border-2 border-blue-400/40 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nwGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#BFDBFE" />
              </linearGradient>
              <linearGradient id="sparkGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <path
              d="M20 78 V24 L44 64 V24"
              stroke="url(#nwGradDash)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M48 24 L58 76 L70 38 L82 76 L92 24"
              stroke="url(#nwGradDash)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M46 16 L49 26 L59 27 L51 33 L54 43 L45 36 L37 42 L41 32 L33 27 L43 25 Z"
              fill="url(#sparkGradDash)"
            />
            <circle cx="48" cy="22" r="3" fill="#FFFFFF" />
          </svg>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-xs border border-white">
            PRO
          </div>
        </div>

        {showText && (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Workshop Operations
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white leading-tight">
              NW SERVICE CENTER
            </h2>
            <p className="text-xs text-blue-100 font-medium">
              National Welding Machine & Inverter Specialist
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default 'header' variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white to-blue-50 text-blue-800 p-0.5 shadow-md shadow-blue-950/25 border-2 border-blue-200/60 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nwGradHead" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="sparkGradHead" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path
            d="M20 78 V24 L44 64 V24"
            stroke="url(#nwGradHead)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M48 24 L58 76 L70 38 L82 76 L92 24"
            stroke="url(#nwGradHead)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M46 16 L49 26 L59 27 L51 33 L54 43 L45 36 L37 42 L41 32 L33 27 L43 25 Z"
            fill="url(#sparkGradHead)"
          />
        </svg>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <h1 className="text-base font-black tracking-tight text-white">
              NW SERVICE CENTER
            </h1>
          </div>
          <p className="text-[10px] text-blue-100 font-medium tracking-wide">
            National Welding Machine Service Center
          </p>
        </div>
      )}
    </div>
  );
};
