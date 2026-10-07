import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { X, Printer, Share2, Check, Zap, Phone, MapPin, Shield, QrCode, MessageSquare } from 'lucide-react';
import { generateJobQRCodeDataUrl, getJobSummaryUrl } from '../utils/qrUtils';
import { NWLogo } from './NWLogo';
import { openJobWhatsApp } from '../utils/whatsappHelper';

interface InvoicePrintModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (job) {
      generateJobQRCodeDataUrl(job.jobNumber, { width: 140, margin: 1 }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    openJobWhatsApp(job);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-slate-300">Job Slip / Gate Pass Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Send WhatsApp Update to Customer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-white text-slate-900 text-xs font-sans space-y-4 print:p-0">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4">
            <NWLogo variant="receipt" className="mb-2" />
            <p className="text-[11px] text-slate-600 font-semibold mt-1">
              National Welding Machine & Industrial Power Tool Service Center
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 mt-1">
              <span>Mob: 9876543210</span>
              <span>•</span>
              <span>Shop No. 4, Industrial Area</span>
            </div>
          </div>

          {/* Job Card Badge */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">JOB NUMBER</span>
              <span className="font-mono font-black text-base text-blue-900">{job.jobNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">STATUS</span>
              <span className="font-black text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-white">
                {job.status}
              </span>
            </div>
          </div>

          {/* Customer & Machine Details Grid */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{job.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Mobile:</span>
              <span className="font-mono font-bold text-slate-900">{job.mobileNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Machine:</span>
              <span className="font-bold text-slate-900">{job.machineBrand} {job.machineModel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Type:</span>
              <span className="font-medium text-slate-700">{job.machineType}</span>
            </div>
            {job.serialNumber && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Serial No:</span>
                <span className="font-mono text-slate-700">{job.serialNumber}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Received Date:</span>
              <span className="font-mono text-slate-700">{job.receivedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Technician:</span>
              <span className="text-slate-800 font-medium">{job.technician}</span>
            </div>
          </div>

          {/* Complaint */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
              Reported Complaint:
            </span>
            <p className="text-xs text-slate-700 font-medium italic">{job.complaint}</p>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2 font-medium text-slate-600">Total Repair Cost</td>
                  <td className="p-2 text-right font-bold text-slate-900 font-mono">
                    ₹{job.repairCost.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-medium text-emerald-700">Advance Paid</td>
                  <td className="p-2 text-right font-bold text-emerald-700 font-mono">
                    ₹{job.advancePaid.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-blue-50/50">
                  <td className="p-2 font-black text-slate-900 text-sm">Balance Due</td>
                  <td
                    className={`p-2 text-right font-black font-mono text-sm ${
                      job.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{job.balanceAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Machine QR Code for Staff & Customer */}
          {qrDataUrl && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-blue-900 uppercase flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-blue-700" />
                  Digital Job Summary QR
                </span>
                <p className="text-[10px] text-slate-500">
                  Scan with any smartphone camera to view live repair status, machine details & gate pass.
                </p>
              </div>
              <img
                src={qrDataUrl}
                alt="Job QR"
                className="w-16 h-16 object-contain bg-white p-0.5 rounded-lg border border-slate-200 shrink-0 ml-2"
              />
            </div>
          )}

          {/* Terms & Warranty */}
          <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-dashed border-slate-300">
            <p>1. 30 days testing warranty on replaced electronic components / IGBT.</p>
            <p>2. Please bring this slip during machine collection / delivery.</p>
            <p>3. Machines not collected within 60 days are subject to workshop storage rules.</p>
          </div>

          {/* Signature Signoff */}
          <div className="pt-6 flex justify-between items-end text-[11px] text-slate-600">
            <div className="text-center">
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span>Customer Sign</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span className="font-bold">NW Service Center</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
