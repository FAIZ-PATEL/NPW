import React, { useState } from 'react';
import { Wrench, Zap, Cpu, Camera, Eye, X, ZoomIn } from 'lucide-react';

interface MachineCardProps {
  brand: string;
  model: string;
  type: string;
  serialNumber?: string;
  complaint?: string;
  photoUrl?: string;
  compact?: boolean;
  onOpenPhotoModal?: () => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({
  brand,
  model,
  type,
  serialNumber,
  complaint,
  photoUrl,
  compact = false,
  onOpenPhotoModal,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isWelder =
    type?.toLowerCase().includes('weld') ||
    brand?.toLowerCase().includes('esab') ||
    brand?.toLowerCase().includes('ador');

  if (compact) {
    return (
      <div className="flex items-start gap-2.5">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${brand} ${model}`}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isWelder ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isWelder ? <Zap className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-sm truncate">
            {brand} {model}
          </div>
          <div className="text-xs text-slate-500 truncate">{type}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
        <div className="flex items-start gap-3">
          {/* Photo Thumbnail or Fallback */}
          {photoUrl ? (
            <div className="relative group shrink-0">
              <img
                src={photoUrl}
                alt={`${brand} ${model}`}
                onClick={() => setIsZoomOpen(true)}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
              />
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity cursor-pointer"
                title="Zoom Photo"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onOpenPhotoModal?.()}
              className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-transform ${
                onOpenPhotoModal ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
              } ${
                isWelder
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                  : 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              }`}
            >
              {isWelder ? <Zap className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
              <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">
                {isWelder ? 'WELDER' : 'TOOL'}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {brand}
                </span>
                {serialNumber && (
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    S/N: {serialNumber}
                  </span>
                )}
              </div>

              {/* Photo Action Button */}
              {onOpenPhotoModal && (
                <button
                  type="button"
                  onClick={onOpenPhotoModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{photoUrl ? 'Change Photo' : '+ Add Photo'}</span>
                </button>
              )}
            </div>

            <h4 className="font-extrabold text-slate-900 text-base leading-snug mt-1">
              {model}
            </h4>

            <p className="text-xs text-slate-600 font-medium">{type}</p>
          </div>
        </div>

        {/* If no photo exists, show a friendly prompt button to snap one */}
        {!photoUrl && onOpenPhotoModal && (
          <div className="mt-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Take Machine Photo with Camera (or Upload)</span>
            </button>
          </div>
        )}

        {complaint && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Problem / Complaint:
            </div>
            <p className="text-xs text-rose-700 font-medium bg-rose-50/70 p-2 rounded-xl border border-rose-100">
              {complaint}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {isZoomOpen && photoUrl && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
          >
            <div className="p-3 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h4 className="font-extrabold text-sm">{brand} {model}</h4>
                <p className="text-[11px] text-slate-400 font-mono">Serial: {serialNumber || 'N/A'}</p>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={photoUrl}
                alt={`${brand} ${model}`}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
