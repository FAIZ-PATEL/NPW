import React, { useState } from 'react';
import { Job, PaymentMode } from '../types';
import { X, IndianRupee, Check, CreditCard, Banknote, QrCode } from 'lucide-react';

interface AddPaymentModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, mode: PaymentMode, notes: string) => Promise<void>;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !job) return null;

  const [amount, setAmount] = useState<number>(job.balanceAmount > 0 ? job.balanceAmount : 0);
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    try {
      setIsSubmitting(true);
      await onConfirm(amount, mode, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base">Collect Payment</h3>
            <p className="text-xs text-blue-100 font-mono">{job.jobNumber} • {job.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Repair Cost:</span>
              <span className="font-bold text-slate-800">₹{job.repairCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Already Paid:</span>
              <span className="font-bold text-emerald-700">₹{job.advancePaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>Current Due Balance:</span>
              <span className="text-red-600 font-mono">₹{job.balanceAmount.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={job.balanceAmount || 100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2.5 text-lg font-black font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
            {job.balanceAmount > 0 && amount !== job.balanceAmount && (
              <button
                type="button"
                onClick={() => setAmount(job.balanceAmount)}
                className="text-xs text-blue-600 font-bold mt-1 inline-block hover:underline"
              >
                Set full remaining balance (₹{job.balanceAmount})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('Cash')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  mode === 'Cash'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setMode('UPI')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  mode === 'UPI'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                UPI / GPay
              </button>

              <button
                type="button"
                onClick={() => setMode('Card')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  mode === 'Card'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                Card / POS
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via GPay / Final cash settlement"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : `Record ₹${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
