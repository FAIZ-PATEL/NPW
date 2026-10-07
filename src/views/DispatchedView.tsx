import React from 'react';
import { Job } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Truck, Calendar, IndianRupee, CheckCircle2, Printer, ArrowRight } from 'lucide-react';

interface DispatchedViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenInvoice: (job: Job) => void;
}

export const DispatchedView: React.FC<DispatchedViewProps> = ({
  jobs,
  onSelectJob,
  onOpenInvoice,
}) => {
  const dispatchedJobs = jobs.filter((j) => j.status === 'Dispatched');

  return (
    <div className="space-y-3 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Header Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-blue-950">Dispatched & Delivered</h3>
            <p className="text-xs text-blue-700 font-medium">Completed machine repair history</p>
          </div>
        </div>
        <span className="font-mono font-black text-xl text-blue-800 bg-white px-2.5 py-1 rounded-xl border border-blue-200">
          {dispatchedJobs.length}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {dispatchedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <p className="text-sm font-bold text-slate-800">No Dispatched Jobs Yet</p>
            <p className="text-xs text-slate-400 mt-1">Repaired jobs will appear here once delivered.</p>
          </div>
        ) : (
          dispatchedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
            >
              {/* Header: Job Number & Status Badge (Blue) */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {job.jobNumber}
                </span>
                <StatusBadge status="Dispatched" size="sm" />
              </div>

              {/* Customer */}
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="font-extrabold text-slate-900">{job.customerName}</div>
                <div className="text-xs font-mono text-slate-500">{job.mobileNumber}</div>
              </div>

              {/* Machine */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-2.5">
                <div className="font-extrabold text-slate-900 text-xs">
                  {job.machineBrand} {job.machineModel}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{job.machineType}</div>
                {job.deliveryRemark && (
                  <div className="text-[11px] text-slate-600 mt-1 italic">
                    Delivery Note: "{job.deliveryRemark}"
                  </div>
                )}
              </div>

              {/* Cost & Payment Status & Dispatch Date */}
              <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Total Repair Cost
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ₹{job.repairCost.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Payment Status
                  </span>
                  <span
                    className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded-md ${
                      job.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 mt-1 border-t border-slate-100 text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Dispatch Date: {job.dispatchedDate || 'Completed'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInvoice(job);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 p-1 rounded-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Gate Pass
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
