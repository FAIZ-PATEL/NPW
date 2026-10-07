import React, { useState } from 'react';
import { Job, Customer, Payment, Technician, JobStatus } from '../types';
import {
  FileBarChart,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck,
  Users,
  Printer,
  TrendingUp,
  Award,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { exportJobsToCSV } from '../utils/csvExporter';

interface ReportsViewProps {
  jobs: Job[];
  customers: Customer[];
  payments: Payment[];
  technicians: Technician[];
  onSelectJob: (job: Job) => void;
  onNavigateTab: (tab: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  jobs,
  customers,
  payments,
  technicians,
  onSelectJob,
  onNavigateTab,
}) => {
  const [selectedSubView, setSelectedSubView] = useState<
    'summary' | 'pending' | 'repaired' | 'dispatched' | 'today' | 'monthly'
  >('summary');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // 1. Today's Jobs
  const todayJobs = jobs.filter((j) => j.receivedDate === todayStr);

  // 2. Today's Collection
  const todayPayments = payments.filter((p) => p.date === todayStr);
  const todayCollection = todayPayments.reduce((s, p) => s + (p.amount || 0), 0);

  // 3. Pending Jobs
  const pendingJobs = jobs.filter(
    (j) => j.status === 'Pending' || j.status === 'Checking' || j.status === 'Repairing' || j.status === 'Received'
  );

  // 4. Repaired Jobs
  const repairedJobs = jobs.filter((j) => j.status === 'Repaired');

  // 5. Dispatched Jobs
  const dispatchedJobs = jobs.filter((j) => j.status === 'Dispatched');

  // 6. Monthly Collection
  const monthlyPayments = payments.filter((p) => p.date && p.date.startsWith(currentMonthStr));
  const monthlyCollection = monthlyPayments.reduce((s, p) => s + (p.amount || 0), 0);

  // Total Lifetime Collection
  const totalLifetimeCollection = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportActiveSubViewCSV = () => {
    switch (selectedSubView) {
      case 'today':
        exportJobsToCSV(todayJobs, 'NW_Today_Jobs');
        break;
      case 'pending':
        exportJobsToCSV(pendingJobs, 'NW_Pending_Jobs');
        break;
      case 'repaired':
        exportJobsToCSV(repairedJobs, 'NW_Repaired_Jobs');
        break;
      case 'dispatched':
        exportJobsToCSV(dispatchedJobs, 'NW_Dispatched_Jobs');
        break;
      case 'summary':
      case 'monthly':
      default:
        exportJobsToCSV(jobs, 'NW_All_Jobs_Summary');
        break;
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
            Performance Analytics
          </span>
          <h3 className="text-lg font-black mt-0.5">Workshop Reports</h3>
          <p className="text-xs text-blue-100">National Welding Service Center</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportActiveSubViewCSV}
            className="bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-900 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            title="Download CSV Summary"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs px-2.5 py-2 rounded-xl flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Reports Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none text-xs font-bold">
        {[
          { id: 'summary', label: 'All Summary' },
          { id: 'today', label: `Today's Jobs (${todayJobs.length})` },
          { id: 'monthly', label: 'Monthly' },
          { id: 'pending', label: `Pending (${pendingJobs.length})` },
          { id: 'repaired', label: `Repaired (${repairedJobs.length})` },
          { id: 'dispatched', label: `Dispatched (${dispatchedJobs.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedSubView(t.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedSubView === t.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {selectedSubView === 'summary' && (
        <div className="space-y-3">
          {/* Collection Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <IndianRupee className="w-4 h-4" />
                Today's Collection
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900 font-mono">
                ₹{todayCollection.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {todayPayments.length} transactions today
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <TrendingUp className="w-4 h-4" />
                Monthly Collection
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900 font-mono">
                ₹{monthlyCollection.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Current billing cycle</div>
            </div>
          </div>

          {/* Machine Status Breakdown List */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Machine Breakdown
            </span>

            <div
              onClick={() => setSelectedSubView('today')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Today's Jobs Received</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-slate-900">
                {todayJobs.length}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setSelectedSubView('pending')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-slate-800">Pending Machines</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-red-600">
                {pendingJobs.length}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setSelectedSubView('repaired')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-slate-800">Repaired Ready Machines</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-green-700">
                {repairedJobs.length}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div
              onClick={() => setSelectedSubView('dispatched')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Dispatched & Delivered</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-blue-700">
                {dispatchedJobs.length}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* CSV Download & Export Center */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 rounded-3xl p-4 border border-emerald-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Download CSV Job Summaries
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Excel Compatible
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Export jobs, customer contacts, technician remarks, machine serials, repair charges, and pending balances directly to CSV.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => exportJobsToCSV(jobs, 'NW_All_Jobs_Summary')}
                className="py-2.5 px-3 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Jobs ({jobs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => exportJobsToCSV(pendingJobs, 'NW_Pending_Jobs')}
                className="py-2.5 px-3 bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-900 font-bold text-xs rounded-xl border border-rose-300 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>Pending ({pendingJobs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => exportJobsToCSV(repairedJobs, 'NW_Repaired_Jobs')}
                className="py-2.5 px-3 bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Repaired ({repairedJobs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => exportJobsToCSV(todayJobs, 'NW_Today_Jobs')}
                className="py-2.5 px-3 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl border border-blue-300 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Today's ({todayJobs.length})</span>
              </button>
            </div>
          </div>

          {/* Technicians Performance */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Technician Workshop Activity
              </span>
            </div>

            <div className="space-y-2">
              {technicians.map((t) => {
                const techJobs = jobs.filter((j) => j.technician?.includes(t.name.split(' ')[0]));
                const techCompleted = techJobs.filter(
                  (j) => j.status === 'Repaired' || j.status === 'Dispatched'
                ).length;

                return (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.specialization}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-800">
                        {techJobs.length} assigned
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-semibold">
                        {techCompleted} completed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-view: Today's Jobs */}
      {selectedSubView === 'today' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold">Today's Jobs ({todayStr}) • {todayJobs.length} jobs</span>
            {todayJobs.length > 0 && (
              <button
                type="button"
                onClick={() => exportJobsToCSV(todayJobs, 'NW_Today_Jobs')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Export CSV
              </button>
            )}
          </div>
          {todayJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs border border-slate-200">
              No new jobs registered today yet.
            </div>
          ) : (
            todayJobs.map((j) => (
              <div
                key={j.id}
                onClick={() => onSelectJob(j)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-400"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-blue-900 text-xs">{j.jobNumber}</span>
                  <span className="text-xs font-mono font-bold text-slate-900">₹{j.repairCost}</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">{j.customerName}</div>
                <div className="text-xs text-slate-500">{j.machineBrand} {j.machineModel}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-view: Monthly Collection Details */}
      {selectedSubView === 'monthly' && (
        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 block uppercase font-bold">Month Total</span>
            <div className="text-2xl font-black text-emerald-800 font-mono mt-0.5">
              ₹{monthlyCollection.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            {monthlyPayments.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="font-extrabold text-slate-900">{p.customerName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{p.jobNumber} • {p.date} ({p.paymentMode})</div>
                </div>
                <div className="font-mono font-black text-emerald-700 text-sm">
                  +₹{p.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view: Pending Jobs list */}
      {selectedSubView === 'pending' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold">Pending Machines ({pendingJobs.length})</span>
            {pendingJobs.length > 0 && (
              <button
                type="button"
                onClick={() => exportJobsToCSV(pendingJobs, 'NW_Pending_Jobs')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                Export CSV
              </button>
            )}
          </div>
          {pendingJobs.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-red-300"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-blue-900 text-xs">{j.jobNumber}</span>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  {j.status}
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">{j.customerName}</div>
              <div className="text-xs text-slate-600">{j.machineBrand} {j.machineModel}</div>
              <div className="text-[11px] text-rose-700 mt-1">Problem: {j.complaint}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-view: Repaired Jobs list */}
      {selectedSubView === 'repaired' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold">Repaired Machines ({repairedJobs.length})</span>
            {repairedJobs.length > 0 && (
              <button
                type="button"
                onClick={() => exportJobsToCSV(repairedJobs, 'NW_Repaired_Jobs')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Export CSV
              </button>
            )}
          </div>
          {repairedJobs.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-green-300"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-blue-900 text-xs">{j.jobNumber}</span>
                <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  Repaired
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">{j.customerName}</div>
              <div className="text-xs text-slate-600">{j.machineBrand} {j.machineModel}</div>
              <div className="text-[11px] text-slate-500 mt-1">Due: ₹{j.balanceAmount}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-view: Dispatched Jobs list */}
      {selectedSubView === 'dispatched' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-bold">Dispatched Machines ({dispatchedJobs.length})</span>
            {dispatchedJobs.length > 0 && (
              <button
                type="button"
                onClick={() => exportJobsToCSV(dispatchedJobs, 'NW_Dispatched_Jobs')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export CSV
              </button>
            )}
          </div>
          {dispatchedJobs.map((j) => (
            <div
              key={j.id}
              onClick={() => onSelectJob(j)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-blue-300"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-blue-900 text-xs">{j.jobNumber}</span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Dispatched
                </span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">{j.customerName}</div>
              <div className="text-xs text-slate-600">{j.machineBrand} {j.machineModel}</div>
              <div className="text-[11px] text-slate-500 mt-1">Delivered: {j.dispatchedDate}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
