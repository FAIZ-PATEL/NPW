import React from 'react';
import { Plus, QrCode } from 'lucide-react';
import { NWLogo } from './NWLogo';

interface HeaderProps {
  onOpenNewJob: () => void;
  onOpenSearch?: () => void;
  onOpenQRScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewJob,
  onOpenSearch,
  onOpenQRScanner,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-blue-700 text-white shadow-md select-none">
      {/* Android Mobile Status Bar Indicator */}
      <div className="bg-blue-800/80 px-4 py-1 flex items-center justify-between text-[11px] text-blue-200 font-mono tracking-wider">
        <span className="font-semibold text-white">NW SERVICE CENTER</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SYNC
          </span>
          <span>4G • 98%</span>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <NWLogo variant="header" />

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {onOpenQRScanner && (
              <button
                onClick={onOpenQRScanner}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs p-2 rounded-xl flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                title="Scan Machine QR Code"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
              </button>
            )}

            <button
              onClick={onOpenNewJob}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-900/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">New Job</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

