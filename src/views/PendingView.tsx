import React from 'react';
import { Job } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Phone, Calendar, Wrench, IndianRupee, AlertCircle, Edit, ArrowRight } from 'lucide-react';

interface PendingViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onUpdateJobStatus: (job: Job) => void;
  onCallCustomer: (phone: string) => void;
}

export const PendingView: React.FC<PendingViewProps> = ({
  jobs,
  onSelectJob,
  onUpdateJobStatus,
  onCallCustomer,
}) => {
  // Show only machines that are not yet repaired (Received, Pending, Checking, Repairing)
  const pendingJobs = jobs.filter(
    (j) => j.status !== 'Repaired' && j.status !== 'Dispatched'
  );

  return (
    <div className="space-y-3 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Header Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-red-900">Pending Machines in Workshop</h3>
            <p className="text-xs text-red-700 font-medium">
              Awaiting parts, checking, or active repair
            </p>
          </div>
        </div>
        <span className="font-mono font-black text-xl text-red-800 bg-white px-2.5 py-1 rounded-xl border border-red-200">
          {pendingJobs.length}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {pendingJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <p className="text-sm font-bold text-slate-800">No Pending Machines</p>
            <p className="text-xs text-slate-400 mt-1">All workshop machines are repaired or dispatched.</p>
          </div>
        ) : (
          pendingJobs.map((job) => {
            const cleanPhone = job.mobileNumber.replace(/\D/g, '');

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-red-300 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    {job.jobNumber}
                  </span>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                {/* Customer & Machine */}
                <div className="mb-2">
                  <div className="font-extrabold text-slate-900 text-sm">{job.customerName}</div>
                  <div className="text-xs text-slate-500 font-medium">{job.mobileNumber}</div>
                </div>

                {/* Machine Details */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-2 flex items-start gap-2.5">
                  {job.machinePhoto && (
                    <img
                      src={job.machinePhoto}
                      alt={`${job.machineBrand} ${job.machineModel}`}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs">
                      {job.machineBrand} {job.machineModel} • <span className="font-normal text-slate-600">{job.machineType}</span>
                    </div>
                    <div className="text-[11px] text-rose-700 font-medium mt-1">
                      Problem: {job.complaint}
                    </div>
                  </div>
                </div>

                {/* Received Date & Expected Cost */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Received: {job.receivedDate}
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                    Expected: ₹{job.repairCost.toLocaleString()}
                  </span>
                </div>

                {/* Required Buttons: Call Customer & Update Status */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallCustomer(cleanPhone);
                    }}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Call Customer
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateJobStatus(job);
                    }}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Update Status
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
