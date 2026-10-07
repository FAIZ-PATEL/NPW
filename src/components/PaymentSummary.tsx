import React from 'react';
import { PaymentStatus } from '../types';
import { IndianRupee, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PaymentSummaryProps {
  repairCost: number;
  advancePaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  onAddPayment?: () => void;
  compact?: boolean;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  repairCost,
  advancePaid,
  balanceAmount,
  paymentStatus,
  onAddPayment,
  compact = false,
}) => {
  const getBadge = () => {
    switch (paymentStatus) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Partial
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[11px]">Repair Cost</span>
          <span className="font-bold text-slate-800 text-sm">₹{repairCost.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[11px]">Balance</span>
          <span className={`font-bold text-sm ${balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ₹{balanceAmount.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 p-3.5 rounded-2xl border border-blue-100 shadow-xs">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-blue-100/80">
        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-blue-600" />
          Financial Breakdown
        </span>
        {getBadge()}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Cost</div>
          <div className="text-base font-extrabold text-slate-900 mt-0.5">
            ₹{repairCost.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Advance Paid</div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            ₹{advancePaid.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Balance Due</div>
          <div
            className={`text-base font-extrabold mt-0.5 ${
              balanceAmount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            ₹{balanceAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {balanceAmount > 0 && onAddPayment && (
        <button
          onClick={onAddPayment}
          className="mt-3 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <IndianRupee className="w-3.5 h-3.5" />
          Collect Balance / Add Payment
        </button>
      )}
    </div>
  );
};
