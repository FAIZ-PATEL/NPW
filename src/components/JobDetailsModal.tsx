import React, { useState } from 'react';
import { Job, JobStatus, PaymentMode, InventoryItem, RepairApprovalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { PaymentSummary } from './PaymentSummary';
import { MachineCard } from './MachineCard';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { ApprovalBadge } from './ApprovalBadge';
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
  Send,
  AlertTriangle,
  User,
  ArrowRight,
  ShieldCheck,
  Edit2,
  IndianRupee,
  Camera,
  QrCode,
  Cpu,
  Plus,
  Trash2,
  Search,
  Package,
} from 'lucide-react';
import { openJobWhatsApp } from '../utils/whatsappHelper';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus, remark?: string) => Promise<void>;
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
  onUpdatePhoto?: (jobId: string, photoUrl: string) => Promise<void>;
  onOpenAddPayment: (job: Job) => void;
  onOpenInvoice: (job: Job) => void;
  onOpenQRTag?: (job: Job) => void;
  inventory?: InventoryItem[];
  onUseSpare?: (
    jobId: string,
    spareId: string,
    quantity: number
  ) => Promise<{ success: boolean; isLowStock: boolean; partName: string; remainingQty: number; error?: string }>;
  onRemoveSpare?: (jobId: string, spareId: string, index: number) => Promise<void>;
}

const TIMELINE_STEPS: JobStatus[] = ['Received', 'Checking', 'Repairing', 'Repaired', 'Dispatched'];

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateApprovalStatus,
  onUpdateQuotation,
  onUpdatePhoto,
  onOpenAddPayment,
  onOpenInvoice,
  onOpenQRTag,
  inventory = [],
  onUseSpare,
  onRemoveSpare,
}) => {
  if (!isOpen || !job) return null;

  const [activeStatus, setActiveStatus] = useState<JobStatus>(job.status);
  const [remarkText, setRemarkText] = useState(job.technicianRemark || '');
  const [deliveryNote, setDeliveryNote] = useState(job.deliveryRemark || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Spare selection state
  const [isAddSpareOpen, setIsAddSpareOpen] = useState(false);
  const [spareSearch, setSpareSearch] = useState('');
  const [selectedSpareId, setSelectedSpareId] = useState('');
  const [spareQuantity, setSpareQuantity] = useState(1);
  const [spareError, setSpareError] = useState<string | null>(null);
  const [isDeducting, setIsDeducting] = useState(false);

  const cleanPhone = job.mobileNumber.replace(/\D/g, '');
  const currentStepIndex = TIMELINE_STEPS.indexOf(job.status);

  const handleApplyStatusChange = async (targetStatus: JobStatus) => {
    try {
      setIsUpdatingStatus(true);
      const remarkToSave = targetStatus === 'Dispatched' ? deliveryNote : remarkText;
      await onUpdateStatus(job.id, targetStatus, remarkToSave);
      setActiveStatus(targetStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSavePhoto = async (newPhotoUrl: string) => {
    if (onUpdatePhoto) {
      await onUpdatePhoto(job.id, newPhotoUrl);
    }
  };

  const handleAddSpareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpareId || !onUseSpare) return;
    setSpareError(null);
    setIsDeducting(true);

    try {
      const res = await onUseSpare(job.id, selectedSpareId, spareQuantity);
      if (!res.success) {
        setSpareError(res.error || 'Failed to use spare');
      } else {
        setSelectedSpareId('');
        setSpareQuantity(1);
        setIsAddSpareOpen(false);
      }
    } finally {
      setIsDeducting(false);
    }
  };

  const filteredSpares = inventory.filter((s) => {
    if (!spareSearch.trim()) return true;
    const q = spareSearch.toLowerCase();
    return (
      s.partName.toLowerCase().includes(q) ||
      (s.partNumber && s.partNumber.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header Bar */}
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-mono font-black text-amber-300 border border-white/20">
              NW
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-lg tracking-tight">{job.jobNumber}</span>
                <StatusBadge status={job.status} size="sm" />
                {job.approvalStatus && <ApprovalBadge status={job.approvalStatus} size="sm" />}
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Received: {job.receivedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              title="Add or Change Photo"
            >
              <Camera className="w-4 h-4 text-amber-300" />
            </button>
            {onOpenQRTag && (
              <button
                onClick={() => onOpenQRTag(job)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                title="View & Print QR Sticker"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
              </button>
            )}
            <button
              onClick={() => onOpenInvoice(job)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              title="Print Receipt / Gate Pass"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Status Timeline */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Repair Status Timeline
              </span>
              <span className="text-xs font-extrabold text-blue-700">
                Current: {job.status}
              </span>
            </div>

            {/* Visual Step Timeline */}
            <div className="grid grid-cols-5 gap-1 text-center relative mb-4">
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
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleApplyStatusChange(step)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${iconColor}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </button>
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

            {/* Quick Status Advance Actions */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/80">
              {TIMELINE_STEPS.map((s) => (
                <button
                  key={s}
                  disabled={isUpdatingStatus || job.status === s}
                  onClick={() => handleApplyStatusChange(s)}
                  className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    job.status === s
                      ? 'bg-slate-800 text-white cursor-default'
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  Set {s}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Customer
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
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                    job.customerName
                  )},%20update%20regarding%20your%20machine%20(${encodeURIComponent(
                    job.machineBrand + ' ' + job.machineModel
                  )})%20Job%20No%20${job.jobNumber}:%20Status%20is%20${job.status}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Machine Information */}
          <MachineCard
            brand={job.machineBrand}
            model={job.machineModel}
            type={job.machineType}
            serialNumber={job.serialNumber}
            complaint={job.complaint}
            photoUrl={job.machinePhoto}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          />

          {/* Customer WhatsApp Quotation & Repair Approval Card */}
          <WhatsAppQuotationCard
            job={job}
            onUpdateApprovalStatus={onUpdateApprovalStatus}
            onUpdateQuotation={onUpdateQuotation}
          />

          {/* Spares Used in Repair & Workshop Stock Deduction */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spares Used in Repair ({job.sparesUsed?.length || 0})
                </span>
              </div>

              {onUseSpare && (
                <button
                  type="button"
                  onClick={() => setIsAddSpareOpen(!isAddSpareOpen)}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddSpareOpen ? 'Cancel' : 'Use Spare Component'}</span>
                </button>
              )}
            </div>

            {/* List of currently used spares */}
            {job.sparesUsed && job.sparesUsed.length > 0 ? (
              <div className="space-y-1.5">
                {job.sparesUsed.map((spare, index) => (
                  <div
                    key={`${spare.spareId}-${index}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-800">{spare.partName}</div>
                      <div className="text-[11px] text-slate-500">
                        Qty: <strong className="font-mono">{spare.quantity}</strong> × ₹
                        {spare.unitPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 font-mono text-xs">
                        ₹{(spare.totalPrice || spare.quantity * spare.unitPrice).toLocaleString()}
                      </span>
                      {onRemoveSpare && (
                        <button
                          type="button"
                          onClick={() => onRemoveSpare(job.id, spare.spareId, index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Restock / Remove spare from job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2.5 text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No spare parts attached yet. Components used will automatically deduct from workshop inventory and appear in the quotation.
              </div>
            )}

            {/* Use Spare Form Drawer */}
            {isAddSpareOpen && (
              <form
                onSubmit={handleAddSpareSubmit}
                className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-700" />
                    Select Component from Inventory
                  </span>
                  <span className="text-[10px] text-slate-500">Auto stock deduction</span>
                </div>

                {/* Search in Spares */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={spareSearch}
                    onChange={(e) => setSpareSearch(e.target.value)}
                    placeholder="Search PCB, IGBT, Diode, Capacitor..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Spare Select */}
                <div>
                  <select
                    value={selectedSpareId}
                    onChange={(e) => setSelectedSpareId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
                    required
                  >
                    <option value="">-- Choose Spare Component --</option>
                    {filteredSpares.map((sp) => (
                      <option
                        key={sp.id}
                        value={sp.id}
                        disabled={sp.quantity <= 0}
                      >
                        {sp.partName} [Stock: {sp.quantity}] {sp.quantity <= 0 ? '(OUT OF STOCK)' : ''} - ₹{sp.sellingPrice || sp.unitPrice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={spareQuantity}
                      onChange={(e) => setSpareQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div className="flex-1 pt-3.5">
                    <button
                      type="submit"
                      disabled={!selectedSpareId || isDeducting}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isDeducting ? 'Deducting Stock...' : 'Deduct & Attach to Job'}
                    </button>
                  </div>
                </div>

                {spareError && (
                  <div className="p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{spareError}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Financial Breakdown */}
          <PaymentSummary
            repairCost={job.repairCost}
            advancePaid={job.advancePaid}
            balanceAmount={job.balanceAmount}
            paymentStatus={job.paymentStatus}
            onAddPayment={() => onOpenAddPayment(job)}
          />

          {/* Technician & Remarks */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase">Assigned Technician</span>
              <span className="font-extrabold text-blue-800">{job.technician}</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Technician Remark & Parts Used
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="e.g. IGBT 40N60 replaced, tested at 200A load..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleApplyStatusChange(job.status)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Delivery Remark if dispatched */}
            {job.status === 'Dispatched' && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Delivery Signoff / Handover Remark
                </span>
                <p className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                  {job.deliveryRemark || 'Machine handed over to customer in working condition.'}
                </p>
                <div className="text-[10px] text-slate-400 mt-1">
                  Dispatched on: {job.dispatchedDate || 'Recent'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          {job.status !== 'Dispatched' ? (
            <button
              onClick={() => handleApplyStatusChange('Dispatched')}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Dispatched
            </button>
          ) : (
            <div className="flex-1 py-2.5 px-3 bg-blue-50 text-blue-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Job Completed & Dispatched
            </div>
          )}

          {onOpenQRTag && (
            <button
              onClick={() => onOpenQRTag(job)}
              className="py-3 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Machine QR Sticker"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>QR Tag</span>
            </button>
          )}

          <button
            onClick={() => onOpenInvoice(job)}
            className="py-3 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Slip</span>
          </button>
        </div>
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        initialPhotoUrl={job.machinePhoto}
        onSavePhoto={async (newUrl) => {
          await handleSavePhoto(newUrl);
          setIsPhotoModalOpen(false);
        }}
        title={`Machine Photo: ${job.jobNumber}`}
      />
    </div>
  );
};
