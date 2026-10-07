import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Wrench,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { compressImage, SAMPLE_WORKSHOP_PHOTOS } from '../utils/imageCompressor';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoDataUrl: string) => void;
  initialPhotoUrl?: string;
  title?: string;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  initialPhotoUrl,
  title = 'Machine & Tool Photo',
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(initialPhotoUrl || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets'>('upload');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setPhotoPreview(initialPhotoUrl || '');
  }, [initialPhotoUrl, isOpen]);

  // Clean up camera stream on modal close or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleStartLiveCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Direct live camera access not granted, falling back to camera file picker:', err);
      setCameraError('Direct webcam not supported or permitted. Tap below to launch device camera app.');
      // Trigger native Android camera input as fallback
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureFromLiveStream = async () => {
    if (!videoRef.current) return;
    try {
      setIsProcessing(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const raw = canvas.toDataURL('image/jpeg', 0.85);
        const compressed = await compressImage(raw);
        setPhotoPreview(compressed);
        stopCamera();
      }
    } catch (e) {
      console.error('Capture failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch (err: any) {
      alert('Failed to process image: ' + err.message);
    } finally {
      setIsProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSelectPreset = async (url: string) => {
    try {
      setIsProcessing(true);
      setPhotoPreview(url);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onSavePhoto(photoPreview);
    stopCamera();
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">{title}</h3>
              <p className="text-xs text-blue-100 font-medium">Capture or upload machine photo</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Preview Section */}
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-400 bg-slate-900 shadow-md">
              <img
                src={photoPreview}
                alt="Machine Preview"
                className="w-full h-56 object-contain bg-slate-950"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPhotoPreview('')}
                  className="bg-red-600/90 hover:bg-red-700 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Remove / Retake
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Photo Ready
              </div>
            </div>
          ) : (
            <>
              {/* Tabs for choosing input source */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveTab('upload');
                  }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Camera/File
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    handleStartLiveCamera();
                  }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'camera'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveTab('presets');
                  }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'presets'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Presets
                </button>
              </div>

              {/* Tab 1: Direct File & Android Camera Launch */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  {/* Large Android Camera Button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-900/20 transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                    <span>Open Phone Camera (Take Photo)</span>
                  </button>

                  {/* Device Gallery / File Picker */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Select from Gallery / Storage</span>
                  </button>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Auto Compression Included:
                    </p>
                    <p className="text-slate-600">
                      Photos are automatically compressed and sharpened so nameplates, serial numbers, and fault codes are clearly legible.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Live Video Feed */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {cameraStream ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-56 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleCaptureFromLiveStream}
                        disabled={isProcessing}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 px-5 py-2.5 rounded-full font-black text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 stroke-[3]" />
                        <span>Snap Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600">
                        {cameraError || 'Tap below to launch phone camera'}
                      </p>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        Launch Camera App
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Preset Photos for Testing */}
              {activeTab === 'presets' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select a workshop sample photo:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_WORKSHOP_PHOTOS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.url)}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-all cursor-pointer bg-slate-50 active:scale-95"
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="p-1.5 bg-white text-slate-800">
                          <div className="font-extrabold text-[11px] truncate">{preset.title}</div>
                          <div className="text-[9px] text-slate-500">{preset.category}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden HTML5 File Inputs */}
          {/* 1. Environment camera input for mobile smartphones */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 2. Gallery / filesystem picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!photoPreview || isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Apply Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};
