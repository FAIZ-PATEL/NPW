import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  QrCode,
  Search,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { scanQRFromCanvas, parseJobNumberFromQR } from '../utils/qrUtils';
import { Job } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (jobNumber: string) => void;
  jobs: Job[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  jobs,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setCameraPermissionGranted(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS/Android
        videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error or permission denied:', err);
      setCameraPermissionGranted(false);
      setErrorMsg('Could not access live camera. You can upload an image or type the Job # below.');
      setIsScanning(false);
    }
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const qrResult = scanQRFromCanvas(ctx, canvas.width, canvas.height);
      if (qrResult) {
        const foundJobNumber = parseJobNumberFromQR(qrResult);
        if (foundJobNumber) {
          handleFoundJobNumber(foundJobNumber);
          return;
        }
      }
    }

    // Next frame
    animationFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleFoundJobNumber = (code: string) => {
    stopCamera();
    const cleanCode = code.toUpperCase().trim();
    // Verify job exists or notify
    const matched = jobs.find((j) => j.jobNumber.toUpperCase() === cleanCode);
    if (matched) {
      onScanSuccess(matched.jobNumber);
      onClose();
    } else {
      setErrorMsg(`Job "${cleanCode}" not found in system.`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    let target = manualCode.trim().toUpperCase();
    if (!target.startsWith('NW-') && /^\d+$/.test(target)) {
      target = `NW-${target.padStart(4, '0')}`;
    }

    const matched = jobs.find((j) => j.jobNumber.toUpperCase() === target);
    if (matched) {
      stopCamera();
      onScanSuccess(matched.jobNumber);
      onClose();
    } else {
      setErrorMsg(`No job found with number "${target}".`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const qrResult = scanQRFromCanvas(ctx, canvas.width, canvas.height);
        if (qrResult) {
          const found = parseJobNumberFromQR(qrResult);
          if (found) {
            handleFoundJobNumber(found);
            return;
          }
        }
        setErrorMsg('No readable QR code found in this image.');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <QrCode className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Scan Machine QR Tag</h3>
              <p className="text-[11px] text-blue-100">Point at machine sticker to view job</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="p-4 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border-2 border-blue-500 shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="w-48 h-48 border-2 border-amber-400 rounded-2xl relative shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-0.5 -ml-0.5 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-0.5 -mr-0.5 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-0.5 -ml-0.5 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-0.5 -mr-0.5 rounded-br" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80 animate-pulse shadow-md" />
              </div>
            </div>

            <div className="absolute bottom-2 text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-full font-mono">
              Align QR Code inside box
            </div>
          </div>

          {/* Alternative: Upload Photo of QR */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload QR Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Fallback Manual Search */}
          <form onSubmit={handleManualSearch} className="pt-2 border-t border-slate-200">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Or Enter Job Number Manually
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. NW-0001 or 1"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Find
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
