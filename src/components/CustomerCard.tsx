import React from 'react';
import { Customer } from '../types';
import { User, Phone, MessageSquare, Wrench, ChevronRight } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onSelect?: (customer: Customer) => void;
  onCreateJob?: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onSelect,
  onCreateJob,
}) => {
  const cleanPhone = customer.mobileNumber.replace(/\D/g, '');

  return (
    <div
      onClick={() => onSelect?.(customer)}
      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base leading-snug">
              {customer.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium">{customer.mobileNumber}</span>
            </div>
            {customer.address && (
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                {customer.address}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
            <Wrench className="w-3.5 h-3.5" />
            <span>{customer.totalJobs} {customer.totalJobs === 1 ? 'Job' : 'Jobs'}</span>
          </div>

          {customer.pendingBalance > 0 ? (
            <div className="text-[11px] font-bold text-red-600 mt-1">
              Due: ₹{customer.pendingBalance.toLocaleString()}
            </div>
          ) : (
            <div className="text-[11px] font-medium text-emerald-600 mt-1">
              Clear Balance
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${cleanPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Call
          </a>

          <a
            href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
              customer.name
            )},%20greeting%20from%20National%20Welding%20Service%20Center.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp
          </a>
        </div>

        {onCreateJob ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateJob(customer);
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + New Job
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-0.5 font-medium">
            View History
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
