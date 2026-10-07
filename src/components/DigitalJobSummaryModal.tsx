import React, { useState } from 'react';
import { Job, JobStatus, RepairApprovalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalBadge } from './ApprovalBadge';
import { MachineCard } from './MachineCard';
import { PaymentSummary } from './PaymentSummary';
import { WhatsAppQuotationCard } from './WhatsAppQuotationCard';
import {
  X,
  Phone,
  MessageSquare,
  Printer,
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
  Zap,
  User,
  ShieldCheck,
  QrCode,
  Share2,
  ExternalLink,
  Edit,
} from 'lucide-react';

interface DigitalJobSummaryModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (jobId: string, newStatus: JobStatus, remark?: string) => Promise<void>;
  onUpdateApprovalStatus?: (jobId: string, status: RepairApprovalStatus) => Promise<void>;
  onUpdateQuotation?: (
    jobId: string,
    quotationData: {
      labourCharges?: number;
      expectedCompletionDate?: string;
      expectedDeliveryDate?: string;
      quotationNotes?: string;
      repairCost?: number;
    }
  ) => Promise<void>;
  onOpenAddPayment?: (job: Job) => void;
  onOpenInvoice?: (job: Job) => void;
  onOpenQRTag?: (job: Job) => void;
}

const TIMELINE_STEPS: JobStatus[] = ['Received', 'Checking', 'Repairing', 'Repaired', 'Dispatched'];

export const DigitalJobSummaryModal: React.FC<DigitalJobSummaryModalProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateApprovalStatus,
  onUpdateQuotation,
  onOpenAddPayment,
  onOpenInvoice,
  onOpenQRTag,
}) => {
  if (!isOpen || !job) return null;

  const cleanPhone = job.mobileNumber.replace(/\D/g, '');
  const currentStepIndex = TIMELINE_STEPS.indexOf(job.status);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Job Summary: ${job.jobNumber}`,
          text: `National Welding Service Center - Job ${job.jobNumber} (${job.machineBrand} ${job.machineModel}) - Status: ${job.status}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job summary link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Digital Summary Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-4 sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white text-blue-800 flex items-center justify-center font-black text-sm shadow-md">
                NW
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg tracking-tight">
                    {job.jobNumber}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full uppercase">
                    Digital Card
                  </span>
                  {job.approvalStatus && <ApprovalBadge status={job.approvalStatus} size="sm" />}
                </div>
                <p className="text-[11px] text-blue-200">National Welding Machine Service Center</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Share Digital Card"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {onOpenQRTag && (
                <button
                  type="button"
                  onClick={() => onOpenQRTag(job)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  title="View QR Sticker"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Summary Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Status Header Banner */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Repair Status Timeline
              </span>
              <StatusBadge status={job.status} size="md" />
            </div>

            {/* Visual Step Timeline */}
            <div className="grid grid-cols-5 gap-1 text-center relative mb-2">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = job.status === step;

                let iconColor = 'bg-slate-200 text-slate-500';
                if (isCurrent) {
                  iconColor =
                    step === 'Repaired'
                      ? 'bg-green-600 text-white ring-4 ring-green-100'
                      : step === 'Dispatched'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-amber-500 text-white ring-4 ring-amber-100';
                } else if (isPassed) {
                  iconColor = 'bg-blue-600 text-white';
                }

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${iconColor}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 tracking-tight leading-tight line-clamp-1 ${
                        isCurrent ? 'font-black text-slate-900' : 'font-medium text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dates Bar */}
            <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/80 font-medium">
              <span>Received: <strong className="font-mono text-slate-800">{job.receivedDate}</strong></span>
              {job.expectedDeliveryDate && (
                <span>Est. Delivery: <strong className="font-mono text-slate-800">{job.expectedDeliveryDate}</strong></span>
              )}
            </div>
          </div>

          {/* Machine Information Card */}
          <MachineCard
            brand={job.machineBrand}
            model={job.machineModel}
            type={job.machineType}
            serialNumber={job.serialNumber}
            complaint={job.complaint}
            photoUrl={job.machinePhoto}
          />

          {/* Customer Contacts Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Customer Contact
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{job.customerName}</h4>
                <p className="text-xs font-mono text-slate-500 font-medium">{job.mobileNumber}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${cleanPhone}`}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                    job.customerName
                  )},%20update%20on%20your%20machine%20${encodeURIComponent(
                    job.machineBrand + ' ' + job.machineModel
                  )}%20Job%20No%20${job.jobNumber}:%20Status%20is%20${job.status}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <PaymentSummary
            repairCost={job.repairCost}
            advancePaid={job.advancePaid}
            balanceAmount={job.balanceAmount}
            paymentStatus={job.paymentStatus}
            onAddPayment={onOpenAddPayment ? () => onOpenAddPayment(job) : undefined}
          />

          {/* Technician Diagnosis & Work Done */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500 uppercase">Assigned Technician:</span>
              <span className="font-extrabold text-blue-900">{job.technician || 'Workshop Team'}</span>
            </div>

            {job.technicianRemark && (
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-600 block mb-0.5">Technician Remarks & Work Done:</span>
                <p className="text-slate-800 bg-white p-2 rounded-xl border border-slate-200 font-medium">
                  {job.technicianRemark}
                </p>
              </div>
            )}

            {job.deliveryRemark && (
              <div className="pt-1">
                <span className="font-bold text-slate-600 block mb-0.5">Delivery Handover Note:</span>
                <p className="text-slate-800 bg-white p-2 rounded-xl border border-slate-200 font-medium">
                  {job.deliveryRemark}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          {onOpenInvoice && (
            <button
              type="button"
              onClick={() => onOpenInvoice(job)}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Job Slip</span>
            </button>
          )}

          {onOpenQRTag && (
            <button
              type="button"
              onClick={() => onOpenQRTag(job)}
              className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>QR Tag</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Close Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
