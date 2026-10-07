import React, { useState, useEffect, useRef } from 'react';
import { Customer, Job, Technician } from '../types';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import {
  X,
  Camera,
  Check,
  User,
  Phone,
  Wrench,
  Calendar,
  IndianRupee,
  FileText,
  Sparkles,
  Upload,
  AlertCircle,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: any) => Promise<void>;
  existingJobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  initialCustomer?: Customer | null;
  nextJobNumber: string;
}

const COMMON_BRANDS = [
  'ESAB',
  'Ador Welding',
  'Bosch',
  'DeWalt',
  'Makita',
  'Cruxweld',
  'Ralli Wolf',
  'Dongcheng',
  'Stanley',
  'Hitachi / Hikoki',
  'KPT',
];

const COMMON_MACHINE_TYPES = [
  'Inverter ARC Welding Machine',
  'TIG Welding Machine (AC/DC)',
  'MIG / MAG Welding Machine',
  'Submerged ARC Welder',
  'Plasma Cutting Machine (Cut 40/60)',
  'Angle Grinder 4" / 5" / 7"',
  'Rotary Hammer Drill (GBH 2-26 type)',
  'Demolition Hammer 11E / 16Kg',
  'Metal Cut-Off Chop Saw 14"',
  'Die Grinder / Marble Cutter',
];

const COMMON_PROBLEMS = [
  'No Power / Machine Dead',
  'O.C. (Over Current) Red Light On',
  'Low Welding Spark / Current Drop',
  'Mosfet / IGBT Blown Out',
  'Heavy Sparking from Motor / Armature',
  'Hammering Slipping under Load',
  'Switch / Wire Cord Faulty',
  'Wire Feeder Motor Jammed',
  'Gas Solenoid Valve Leakage',
  'Display / Potentiometer Faulty',
];

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingJobs,
  customers,
  technicians,
  initialCustomer,
  nextJobNumber,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [machineBrand, setMachineBrand] = useState('ESAB');
  const [customBrand, setCustomBrand] = useState('');
  const [machineModel, setMachineModel] = useState('');
  const [machineType, setMachineType] = useState('Inverter ARC Welding Machine');
  const [customType, setCustomType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [complaint, setComplaint] = useState('');
  const [machinePhoto, setMachinePhoto] = useState<string>('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [expectedRepairCost, setExpectedRepairCost] = useState<number | ''>(1500);
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(500);
  const [technician, setTechnician] = useState('');
  const [technicianRemark, setTechnicianRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill if an initial customer is provided
  useEffect(() => {
    if (initialCustomer) {
      setCustomerName(initialCustomer.name);
      setMobileNumber(initialCustomer.mobileNumber);
    } else {
      setCustomerName('');
      setMobileNumber('');
    }
  }, [initialCustomer, isOpen]);

  // Set default technician
  useEffect(() => {
    if (technicians.length > 0 && !technician) {
      setTechnician(technicians[0].name);
    }
  }, [technicians, technician]);

  if (!isOpen) return null;

  // Auto calculate balance
  const numCost = Number(expectedRepairCost) || 0;
  const numAdvance = Number(advanceAmount) || 0;
  const balance = Math.max(0, numCost - numAdvance);

  // When customer name or phone is typed, allow quick selection from existing customers
  const filteredCustomerSuggestions =
    customerName.trim().length > 1
      ? customers.filter(
          (c) =>
            c.name.toLowerCase().includes(customerName.toLowerCase()) ||
            c.mobileNumber.includes(customerName)
        )
      : [];

  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setMobileNumber(c.mobileNumber);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMachinePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter Customer Name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.trim().length < 8) {
      setFormError('Please enter a valid Mobile Number (at least 8 digits).');
      return;
    }
    const finalBrand = machineBrand === 'Other' ? customBrand.trim() : machineBrand;
    if (!finalBrand) {
      setFormError('Please select or specify Machine Brand.');
      return;
    }
    if (!machineModel.trim()) {
      setFormError('Please enter Machine Model (e.g. ARC 200, GBH 2-26).');
      return;
    }
    if (numAdvance > numCost && numCost > 0) {
      setFormError('Advance amount cannot be greater than Expected Repair Cost.');
      return;
    }

    try {
      setIsSubmitting(true);
      const finalType = machineType === 'Other' ? customType.trim() : machineType;

      await onSave({
        jobNumber: nextJobNumber,
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        machineBrand: finalBrand,
        machineModel: machineModel.trim(),
        machineType: finalType || 'Welding / Power Tool',
        serialNumber: serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        complaint: complaint.trim() || 'General maintenance & repair checkup',
        machinePhoto: machinePhoto || undefined,
        receivedDate,
        expectedDeliveryDate,
        status: 'Received',
        repairCost: numCost,
        advancePaid: numAdvance,
        technician: technician || 'Irfan (Lead Welder Tech)',
        technicianRemark: technicianRemark.trim(),
      });

      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save Job Card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">New Job Card</h3>
                <span className="font-mono text-xs font-black bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md">
                  {nextJobNumber}
                </span>
              </div>
              <p className="text-xs text-blue-100">National Welding Machine Service Center</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Customer Information
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Irfan Shaikh / Rajesh Verma"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                required
              />

              {/* Suggestions */}
              {filteredCustomerSuggestions.length > 0 && customerName.length > 2 && (
                <div className="mt-1 bg-white border border-blue-200 rounded-xl p-1.5 shadow-md">
                  <div className="text-[10px] text-blue-600 font-bold px-2 py-0.5">
                    Matching existing customer:
                  </div>
                  {filteredCustomerSuggestions.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="text-slate-500 font-mono">{c.mobileNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                  +91
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Machine Details */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              Machine & Power Tool Details
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
                <select
                  value={machineBrand}
                  onChange={(e) => setMachineBrand(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Other">Other / Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Machine Model *
                </label>
                <input
                  type="text"
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                  placeholder="e.g. ARC 200 / GBH 2-26"
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {machineBrand === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specify Brand Name *
                </label>
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Brand name"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Machine Type *</label>
              <select
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {COMMON_MACHINE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other Tool / Equipment</option>
              </select>
            </div>

            {machineType === 'Other' && (
              <div>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Custom tool type"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Serial Number (S/N)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Optional or on machine plate"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Problem / Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Problem / Complaint *
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe fault (e.g. Sparking, dead power, OC error, motor burnt)..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_PROBLEMS.slice(0, 6).map((prob) => (
                  <button
                    key={prob}
                    type="button"
                    onClick={() => setComplaint((prev) => (prev ? `${prev}, ${prob}` : prob))}
                    className="text-[10px] font-semibold bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
                  >
                    + {prob}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine Photo Section */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Machine Photo (Camera / Gallery)
                </label>
                {machinePhoto && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Photo Added
                  </span>
                )}
              </div>

              {machinePhoto ? (
                <div className="flex items-center gap-3">
                  <img
                    src={machinePhoto}
                    alt="Machine"
                    className="w-20 h-20 object-cover rounded-xl border-2 border-blue-500 shadow-xs"
                  />
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMachinePhoto('')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>+ Add Machine Photo (Camera / Gallery)</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Capture machine nameplate, external body or internal PCB fault
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Timeline & Dates */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Received Date</label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 4: Financials */}
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              Repair Cost & Advance
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Repair Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={expectedRepairCost}
                  onChange={(e) =>
                    setExpectedRepairCost(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm font-extrabold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={advanceAmount}
                  onChange={(e) =>
                    setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm font-extrabold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-emerald-700"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Calculated Balance Preview */}
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-200">
              <span className="text-xs font-semibold text-slate-600">Calculated Balance Due:</span>
              <span
                className={`font-black text-sm font-mono ${
                  balance > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                ₹{balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section 5: Technician Assignment */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign Technician
              </label>
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} • {t.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Remark (Initial diagnosis)
              </label>
              <input
                type="text"
                value={technicianRemark}
                onChange={(e) => setTechnicianRemark(e.target.value)}
                placeholder="e.g. Check IGBT section and 24V supply card"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Default Status Note */}
          <div className="text-center text-[11px] font-semibold text-slate-500 py-1">
            Default initial status will be set to{' '}
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
              Received
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {isSubmitting ? 'Saving...' : 'Save Job Card'}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        initialPhotoUrl={machinePhoto}
        onSavePhoto={(photoUrl) => {
          setMachinePhoto(photoUrl);
          setIsPhotoModalOpen(false);
        }}
        title="Capture / Attach Machine Photo"
      />
    </div>
  );
};
