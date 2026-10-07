import React from 'react';
import { Job } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle2, Truck, Calendar, IndianRupee, ArrowRight, User, Wrench } from 'lucide-react';

interface RepairedViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onMarkAsDispatched: (job: Job) => void;
  onOpenAddPayment?: (job: Job) => void;
}

export const RepairedView: React.FC<RepairedViewProps> = ({
  jobs,
  onSelectJob,
  onMarkAsDispatched,
  onOpenAddPayment,
}) => {
  const repairedJobs = jobs.filter((j) => j.status === 'Repaired');

  return (
    <div className="space-y-3 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Header Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-emerald-950">Repaired & Ready for Pickup</h3>
            <p className="text-xs text-emerald-700 font-medium">Ready for customer testing and dispatch</p>
          </div>
        </div>
        <span className="font-mono font-black text-xl text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
          {repairedJobs.length}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {repairedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <p className="text-sm font-bold text-slate-800">No Repaired Machines Ready</p>
            <p className="text-xs text-slate-400 mt-1">Check the Pending tab to review active workshop repairs.</p>
          </div>
        ) : (
          repairedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {job.jobNumber}
                </span>
                <StatusBadge status="Repaired" size="sm" />
              </div>

              {/* Customer */}
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="font-extrabold text-slate-900">{job.customerName}</div>
                <div className="text-xs font-mono text-slate-500">{job.mobileNumber}</div>
              </div>

              {/* Machine */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-2">
                <div className="font-extrabold text-slate-900 text-xs">
                  {job.machineBrand} {job.machineModel}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">{job.machineType}</div>
                {job.technicianRemark && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 mt-1.5 font-medium">
                    Work done: {job.technicianRemark}
                  </div>
                )}
              </div>

              {/* Financial: Cost, Advance, Balance */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs mb-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Repair Cost</span>
                  <span className="font-mono font-bold text-slate-900">₹{job.repairCost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Advance</span>
                  <span className="font-mono font-bold text-emerald-700">₹{job.advancePaid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Balance</span>
                  <span
                    className={`font-mono font-extrabold ${
                      job.balanceAmount > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{job.balanceAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Repaired Date */}
              <div className="flex items-center justify-between text-xs py-1 text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Repaired Date:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {job.repairedDate || job.updatedAt?.split('T')[0] || 'Today'}
                </span>
              </div>

              {/* Required Button: Mark as Dispatched */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex gap-2">
                {job.balanceAmount > 0 && onOpenAddPayment && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddPayment(job);
                    }}
                    className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Collect ₹{job.balanceAmount}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsDispatched(job);
                  }}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Mark as Dispatched
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
