import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Share2,
  Wrench,
  Zap,
} from 'lucide-react';
import { generateJobQRCodeDataUrl, getJobSummaryUrl } from '../utils/qrUtils';

interface JobQRCodeModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDigitalSummary?: (job: Job) => void;
}

export const JobQRCodeModal: React.FC<JobQRCodeModalProps> = ({
  job,
  isOpen,
  onClose,
  onOpenDigitalSummary,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (job) {
      generateJobQRCodeDataUrl(job.jobNumber, { width: 360, margin: 2 }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const jobUrl = getJobSummaryUrl(job.jobNumber);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(jobUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintTag = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*NW SERVICE CENTER - DIGITAL JOB CARD*
Job No: ${job.jobNumber}
Customer: ${job.customerName}
Machine: ${job.machineBrand} ${job.machineModel}
Status: ${job.status}
Balance Due: Rs. ${job.balanceAmount}

Scan or open digital job summary:
${jobUrl}`;

    const cleanPhone = job.mobileNumber.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Control Bar */}
        <div className="bg-blue-700 text-white p-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-sm">Machine QR Tag & Link</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Machine Sticker Tag Card */}
        <div className="p-5 text-center space-y-3 bg-white print:p-2">
          {/* Tag Header */}
          <div className="border-b border-dashed border-slate-300 pb-2.5">
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              NW SERVICE CENTER
            </div>
            <h4 className="font-black text-xl text-slate-900 mt-1 font-mono tracking-tight">
              {job.jobNumber}
            </h4>
            <p className="text-xs font-extrabold text-slate-700">
              {job.machineBrand} {job.machineModel}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Cust: {job.customerName} • {job.mobileNumber}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-2xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${job.jobNumber}`}
                className="w-48 h-48 rounded-xl object-contain bg-white p-1 border border-slate-100"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-blue-600" />
              Scan for Digital Job Card
            </span>
          </div>

          {/* Status & Date Tag */}
          <div className="flex justify-between items-center text-[11px] font-semibold bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700">
            <span>Status: <strong className="text-blue-900 uppercase">{job.status}</strong></span>
            <span>Date: <strong className="font-mono">{job.receivedDate}</strong></span>
          </div>

          {/* Web URL details (Screen only) */}
          <div className="pt-1 print:hidden space-y-2">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono truncate">
              <span className="truncate flex-1 text-left text-[11px]">{jobUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 bg-white hover:bg-slate-100 text-blue-700 rounded-lg border border-slate-300 transition-colors"
                title="Copy Direct Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {onOpenDigitalSummary && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDigitalSummary(job);
                }}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Digital Job Summary</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrintTag}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
};
