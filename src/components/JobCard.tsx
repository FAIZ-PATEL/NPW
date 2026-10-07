import React from 'react';
import { Job, RepairApprovalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalBadge } from './ApprovalBadge';
import {
  Phone,
  Calendar,
  ArrowRight,
  User,
  Wrench,
  IndianRupee,
  MessageSquare,
  Cpu,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  openJobWhatsApp,
  openJobQuotationWhatsApp,
  openJobRepairUpdateWhatsApp,
} from '../utils/whatsappHelper';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onUpdateStatus?: (job: Job) => void;
  onCallCustomer?: (phone: string) => void;
  onUpdateApprovalStatus?: (jobId: string, status: RepairApprovalStatus) => void;
  showActions?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  onUpdateStatus,
  onCallCustomer,
  onUpdateApprovalStatus,
  showActions = true,
}) => {
  const cleanPhone = job.mobileNumber.replace(/\D/g, '');

  const handleSendQuotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    openJobQuotationWhatsApp(job);
    if (job.approvalStatus === 'Waiting for Approval' && onUpdateApprovalStatus) {
      onUpdateApprovalStatus(job.id, 'Quotation Sent');
    }
  };

  const handleSendRepairUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    openJobRepairUpdateWhatsApp(job);
  };

  const sparesCount = job.sparesUsed?.reduce((sum, s) => sum + (s.quantity || 1), 0) || 0;

  return (
    <div
      onClick={() => onSelect(job)}
      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
    >
      {/* Top Bar: Job Number, Approval Status & Repair Status */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {job.jobNumber}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {job.receivedDate}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {job.approvalStatus && <ApprovalBadge status={job.approvalStatus} size="sm" />}
          <StatusBadge status={job.status} size="sm" />
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex items-center justify-between text-sm mb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <User className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate max-w-[170px]">{job.customerName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${cleanPhone}`}
            onClick={(e) => {
              e.stopPropagation();
              onCallCustomer?.(cleanPhone);
            }}
            className="inline-flex items-center justify-center p-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
            title="Call Customer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-700" />
          </a>
        </div>
      </div>

      {/* Machine Details */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-3">
        <div className="flex items-start gap-2.5">
          {job.machinePhoto ? (
            <img
              src={job.machinePhoto}
              alt={`${job.machineBrand} ${job.machineModel}`}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-slate-900 text-sm truncate">
              {job.machineBrand} {job.machineModel}
            </div>
            <div className="text-xs text-slate-500 font-medium truncate">
              {job.machineType}
            </div>
            {job.complaint && (
              <div className="text-[11px] text-rose-700 line-clamp-1 mt-1 font-medium bg-rose-50/60 px-1.5 py-0.5 rounded border border-rose-100/60">
                Problem: {job.complaint}
              </div>
            )}
            {sparesCount > 0 && (
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 w-fit">
                <Cpu className="w-3 h-3 text-indigo-600" />
                <span>{sparesCount} spare{sparesCount > 1 ? 's' : ''} used in repair</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Quick Action Buttons Bar */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={handleSendQuotation}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
          title="Send Itemized Quotation on WhatsApp to Customer"
        >
          <span className="text-sm">📲</span>
          <span className="truncate">Send Quotation</span>
        </button>

        <button
          type="button"
          onClick={handleSendRepairUpdate}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-800 border border-sky-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Send Repair Status Update on WhatsApp"
        >
          <Wrench className="w-3.5 h-3.5 text-sky-600" />
          <span className="truncate">Repair Update</span>
        </button>
      </div>

      {/* Bottom Financial & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Cost</span>
            <span className="font-extrabold text-slate-800 text-sm">
              ₹{job.repairCost.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Balance</span>
            <span
              className={`font-extrabold text-sm ${
                job.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              ₹{job.balanceAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {showActions && onUpdateStatus && job.status !== 'Dispatched' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(job);
              }}
              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              Status
            </button>
          )}

          <button
            onClick={() => onSelect(job)}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


