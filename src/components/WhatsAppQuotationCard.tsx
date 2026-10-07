import React, { useState } from 'react';
import { Job, RepairApprovalStatus } from '../types';
import { ApprovalBadge } from './ApprovalBadge';
import {
  MessageSquare,
  Send,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  IndianRupee,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  openJobQuotationWhatsApp,
  openJobRepairUpdateWhatsApp,
  generateJobQuotationMessage,
  generateJobRepairUpdateMessage,
} from '../utils/whatsappHelper';

interface WhatsAppQuotationCardProps {
  job: Job;
  onUpdateApprovalStatus?: (jobId: string, status: RepairApprovalStatus) => Promise<void> | void;
  onUpdateQuotation?: (
    jobId: string,
    quotationData: {
      labourCharges?: number;
      expectedCompletionDate?: string;
      expectedDeliveryDate?: string;
      quotationNotes?: string;
      repairCost?: number;
    }
  ) => Promise<void> | void;
}

export const WhatsAppQuotationCard: React.FC<WhatsAppQuotationCardProps> = ({
  job,
  onUpdateApprovalStatus,
  onUpdateQuotation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Spares used and calculated labour charges
  const parts = job.sparesUsed && job.sparesUsed.length > 0 ? job.sparesUsed : [];
  const partsTotal = parts.reduce(
    (sum, p) => sum + (p.totalPrice || p.quantity * p.unitPrice || 0),
    0
  );

  const defaultLabour =
    job.labourCharges !== undefined
      ? job.labourCharges
      : Math.max(0, (job.repairCost || 0) - partsTotal);

  const [labourInput, setLabourInput] = useState<number>(defaultLabour);
  const [completionDateInput, setCompletionDateInput] = useState<string>(
    job.expectedCompletionDate || job.expectedDeliveryDate || ''
  );
  const [deliveryDateInput, setDeliveryDateInput] = useState<string>(
    job.expectedDeliveryDate || ''
  );
  const [notesInput, setNotesInput] = useState<string>(job.quotationNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const totalEstimatedCost = partsTotal + Number(labourInput || 0);
  const advancePaid = job.advancePaid || 0;
  const balanceDue = Math.max(0, totalEstimatedCost - advancePaid);

  const approvalOptions: Array<{
    id: RepairApprovalStatus;
    label: string;
    icon: React.ElementType;
    color: string;
    activeClass: string;
  }> = [
    {
      id: 'Waiting for Approval',
      label: 'Waiting for Approval',
      icon: Clock,
      color: 'text-amber-700',
      activeClass: 'bg-amber-500 text-white shadow-xs border-amber-600',
    },
    {
      id: 'Quotation Sent',
      label: 'Quotation Sent',
      icon: Send,
      color: 'text-sky-700',
      activeClass: 'bg-sky-600 text-white shadow-xs border-sky-700',
    },
    {
      id: 'Customer Approved',
      label: 'Customer Approved',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      activeClass: 'bg-emerald-600 text-white shadow-xs border-emerald-700',
    },
    {
      id: 'Customer Not Approved',
      label: 'Customer Not Approved',
      icon: XCircle,
      color: 'text-rose-700',
      activeClass: 'bg-rose-600 text-white shadow-xs border-rose-700',
    },
  ];

  const handleApprovalChange = async (newStatus: RepairApprovalStatus) => {
    if (onUpdateApprovalStatus) {
      await onUpdateApprovalStatus(job.id, newStatus);
    }
  };

  const handleSaveQuotationDetails = async () => {
    try {
      setIsSaving(true);
      if (onUpdateQuotation) {
        await onUpdateQuotation(job.id, {
          labourCharges: Number(labourInput) || 0,
          expectedCompletionDate: completionDateInput,
          expectedDeliveryDate: deliveryDateInput,
          quotationNotes: notesInput,
          repairCost: totalEstimatedCost,
        });
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuotationWhatsApp = () => {
    openJobQuotationWhatsApp(job, {
      labourCharges: Number(labourInput) || defaultLabour,
      expectedCompletionDate: completionDateInput || job.expectedCompletionDate,
      expectedDeliveryDate: deliveryDateInput || job.expectedDeliveryDate,
      notes: notesInput || job.quotationNotes,
    });

    if (
      (!job.approvalStatus || job.approvalStatus === 'Waiting for Approval') &&
      onUpdateApprovalStatus
    ) {
      onUpdateApprovalStatus(job.id, 'Quotation Sent');
    }
  };

  const handleSendRepairUpdateWhatsApp = () => {
    openJobRepairUpdateWhatsApp(job);
  };

  const currentApproval = job.approvalStatus || 'Waiting for Approval';
  const previewQuotationText = generateJobQuotationMessage(job, {
    labourCharges: Number(labourInput) || defaultLabour,
    expectedCompletionDate: completionDateInput || job.expectedCompletionDate,
    expectedDeliveryDate: deliveryDateInput || job.expectedDeliveryDate,
    notes: notesInput || job.quotationNotes,
  });

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-blue-50/60 rounded-3xl p-4 border border-emerald-200 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <span className="text-base">📲</span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
              Customer WhatsApp & Approval
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Quotation, Repair Updates & Customer Consent
            </p>
          </div>
        </div>
        <ApprovalBadge status={currentApproval} size="sm" />
      </div>

      {/* Main 2 WhatsApp Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleSendQuotationWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:from-emerald-800 text-white rounded-2xl text-xs font-black shadow-md transition-all transform active:scale-[0.99] cursor-pointer"
        >
          <span className="text-lg">📲</span>
          <div className="text-left leading-tight">
            <div>Send Quotation on WhatsApp</div>
            <div className="text-[10px] font-normal text-emerald-100 opacity-90">
              Includes parts, labour & balance
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSendRepairUpdateWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-white hover:bg-sky-50 active:bg-sky-100 text-sky-800 border-2 border-sky-300 rounded-2xl text-xs font-black shadow-xs transition-all transform active:scale-[0.99] cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="text-left leading-tight">
            <div>Send Repair Update</div>
            <div className="text-[10px] font-normal text-slate-500">
              Current status & completion time
            </div>
          </div>
        </button>
      </div>

      {/* Repair Approval Options */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Repair Approval Status:
          </span>
          <span className="font-extrabold text-slate-800 text-xs">{currentApproval}</span>
        </div>

        {/* 4 Interactive Approval Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          {approvalOptions.map((opt) => {
            const isSelected = currentApproval === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleApprovalChange(opt.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all border cursor-pointer ${
                  isSelected
                    ? opt.activeClass
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Itemized Quotation Breakdown Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Quotation Breakdown (Auto Calculated)
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-lg"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditing ? 'Close Edit' : 'Edit Quotation'}</span>
          </button>
        </div>

        {/* Itemized Parts List */}
        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
          <div className="text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">
            Parts & Spares:
          </div>
          {parts.length > 0 ? (
            parts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5">
                <span className="truncate max-w-[200px]">
                  • {p.partName} {p.quantity > 1 ? `(x${p.quantity})` : ''}
                </span>
                <span className="font-bold text-slate-800">
                  ₹{(p.totalPrice || p.quantity * p.unitPrice || 0).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic text-[11px]">
              No spare parts added yet (Full estimate as service charges).
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
            <span className="font-sans font-medium text-slate-700">• Service/Labour Charges</span>
            <span className="font-bold text-slate-800">
              ₹{(Number(labourInput) || defaultLabour).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Totals Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cost</span>
            <span className="font-black text-slate-900 text-sm">
              ₹{totalEstimatedCost.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Advance</span>
            <span className="font-black text-emerald-800 text-sm">
              ₹{advancePaid.toLocaleString()}
            </span>
          </div>

          <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold text-rose-600 uppercase block">Balance Due</span>
            <span className="font-black text-rose-800 text-sm">
              ₹{balanceDue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dates & Notes display */}
        <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Expected Completion:</span>
            <span className="font-bold text-slate-800">
              {completionDateInput || job.expectedCompletionDate || job.expectedDeliveryDate || 'Within 2-3 Days'}
            </span>
          </div>
          {(deliveryDateInput || job.expectedDeliveryDate) && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Expected Delivery:</span>
              <span className="font-bold text-slate-800">
                {deliveryDateInput || job.expectedDeliveryDate}
              </span>
            </div>
          )}
          {(notesInput || job.quotationNotes) && (
            <div className="pt-1 text-[11px] text-slate-600 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-800">Quotation Note: </span>
              {notesInput || job.quotationNotes}
            </div>
          )}
        </div>

        {/* Edit Quotation Drawer */}
        {isEditing && (
          <div className="pt-3 border-t border-slate-200 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              Customize Quotation Before Sending:
            </h5>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Labour / Service Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={labourInput}
                  onChange={(e) => setLabourInput(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 02 Oct 2026 / Tomorrow 4 PM"
                  value={completionDateInput}
                  onChange={(e) => setCompletionDateInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Expected Delivery / Collection Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 02 Oct 2026 (Evening)"
                  value={deliveryDateInput}
                  onChange={(e) => setDeliveryDateInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Quotation Notes / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30 days testing warranty on IGBT"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveQuotationDetails}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Job</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Live Message Preview Expander */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{isPreviewOpen ? 'Hide' : 'Preview'} Pre-Filled WhatsApp Message</span>
            {isPreviewOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isPreviewOpen && (
            <div className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-56 overflow-y-auto shadow-inner">
              {previewQuotationText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
