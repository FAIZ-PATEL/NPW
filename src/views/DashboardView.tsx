import React from 'react';
import { Job, Customer, Payment, JobStatus } from '../types';
import { JobCard } from '../components/JobCard';
import { NWLogo } from '../components/NWLogo';
import {
  Plus,
  Users,
  Wrench,
  Clock,
  CheckCircle,
  Truck,
  FileBarChart,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  jobs: Job[];
  customers: Customer[];
  payments: Payment[];
  onOpenNewJob: () => void;
  onNavigateTab: (tab: any) => void;
  onSelectJob: (job: Job) => void;
  onUpdateJobStatus: (job: Job) => void;
  onCallCustomer: (phone: string) => void;
  onSelectStatusFilter?: (status: JobStatus | 'All') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  customers,
  payments,
  onOpenNewJob,
  onNavigateTab,
  onSelectJob,
  onUpdateJobStatus,
  onCallCustomer,
  onSelectStatusFilter,
}) => {
  // Counts by status
  const receivedCount = jobs.filter((j) => j.status === 'Received').length;
  const pendingCount = jobs.filter(
    (j) => j.status === 'Pending' || j.status === 'Checking' || j.status === 'Repairing'
  ).length;
  const repairedCount = jobs.filter((j) => j.status === 'Repaired').length;
  const dispatchedCount = jobs.filter((j) => j.status === 'Dispatched').length;

  // Financial aggregates
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollection = payments
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPendingAmount = jobs
    .filter((j) => j.status !== 'Dispatched' || j.balanceAmount > 0)
    .reduce((sum, j) => sum + (j.balanceAmount || 0), 0);

  // Recent jobs (sorted by updatedAt/createdAt)
  const recentJobs = [...jobs].slice(0, 6);

  const handleQuickFilter = (status: JobStatus | 'All') => {
    if (onSelectStatusFilter) {
      onSelectStatusFilter(status);
    }
    onNavigateTab('jobs');
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto px-3.5 pt-3">
      {/* Workshop Hero Welcome Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-950 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <NWLogo variant="dashboard" />
            <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/20 text-blue-100 shrink-0">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Active Machine Jobs in Workshop</div>
              <div className="text-2xl font-black tracking-tight">{jobs.length} Machines</div>
            </div>

            <button
              onClick={onOpenNewJob}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-lg shadow-amber-950/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Job Card
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Metrics Grid: Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Machine Status Summary
          </span>
          <span className="text-xs font-medium text-slate-400">Live Workshop Flow</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Received Machines (Orange) */}
          <div
            onClick={() => handleQuickFilter('Received')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-orange-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Received</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-300" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono">{receivedCount}</span>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                Orange
              </span>
            </div>
          </div>

          {/* Pending Machines (Red) */}
          <div
            onClick={() => handleQuickFilter('Pending')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Pending</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-300 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</span>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                Red
              </span>
            </div>
          </div>

          {/* Repaired Machines (Green) */}
          <div
            onClick={() => handleQuickFilter('Repaired')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-green-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Repaired</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-sm shadow-green-300" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono">{repairedCount}</span>
              <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                Green
              </span>
            </div>
          </div>

          {/* Dispatched Machines (Blue) */}
          <div
            onClick={() => handleQuickFilter('Dispatched')}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Dispatched</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-300" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono">{dispatchedCount}</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Blue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Counters: Today's Collection & Total Pending */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            Today's Repair Collection
          </div>
          <div className="mt-2 text-xl font-black text-emerald-900 font-mono">
            ₹{todayCollection.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Cash & UPI Receipts
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Total Pending Amount
          </div>
          <div className="mt-2 text-xl font-black text-rose-900 font-mono">
            ₹{totalPendingAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">
            Pending from Customers
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid (Required in User Brief) */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
          Quick Access
        </span>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={onOpenNewJob}
            className="bg-blue-600 text-white p-2.5 rounded-2xl font-extrabold shadow-sm flex flex-col items-center justify-center gap-1 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[11px] leading-tight">+ New Job</span>
          </button>

          <button
            onClick={() => onNavigateTab('customers')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all cursor-pointer"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-[11px] leading-tight">Customers</span>
          </button>

          <button
            onClick={() => handleQuickFilter('All')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all cursor-pointer"
          >
            <Wrench className="w-5 h-5 text-indigo-600" />
            <span className="text-[11px] leading-tight">All Jobs</span>
          </button>

          <button
            onClick={() => handleQuickFilter('Pending')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-5 h-5 text-red-600" />
            <span className="text-[11px] leading-tight">Pending</span>
          </button>

          <button
            onClick={() => handleQuickFilter('Repaired')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-[11px] leading-tight">Repaired</span>
          </button>

          <button
            onClick={() => handleQuickFilter('Dispatched')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all cursor-pointer"
          >
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="text-[11px] leading-tight">Dispatched</span>
          </button>

          <button
            onClick={() => onNavigateTab('more')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all cursor-pointer"
          >
            <FileBarChart className="w-5 h-5 text-amber-600" />
            <span className="text-[11px] leading-tight">Reports</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-white text-slate-800 border border-slate-200 p-2.5 rounded-2xl font-bold shadow-2xs flex flex-col items-center justify-center gap-1 hover:bg-purple-50 hover:border-purple-300 active:scale-95 transition-all cursor-pointer"
          >
            <Wrench className="w-5 h-5 text-purple-600" />
            <span className="text-[11px] leading-tight">Spares</span>
          </button>
        </div>
      </div>

      {/* Recent Job Cards List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Job Cards
          </span>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            View All ({jobs.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentJobs.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-400">
              No repair jobs yet. Tap "+ New Job Card" to create one.
            </div>
          ) : (
            recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={onSelectJob}
                onUpdateStatus={onUpdateJobStatus}
                onCallCustomer={onCallCustomer}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
