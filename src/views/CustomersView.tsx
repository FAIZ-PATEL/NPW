import React, { useState, useMemo } from 'react';
import { Customer, Job } from '../types';
import { CustomerCard } from '../components/CustomerCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  User,
  Phone,
  MessageSquare,
  Wrench,
  Plus,
  X,
  History,
  IndianRupee,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCreateJobForCustomer: (customer: Customer) => void;
  onCallCustomer: (phone: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  jobs,
  onSelectJob,
  onCreateJobForCustomer,
  onCallCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobileNumber.includes(q)
    );
  }, [customers, searchQuery]);

  // Customer Job History
  const customerJobs = useMemo(() => {
    if (!selectedCustomer) return [];
    const cleanCustomerPhone = selectedCustomer.mobileNumber.replace(/\D/g, '');
    return jobs.filter(
      (j) =>
        j.customerId === selectedCustomer.id ||
        j.mobileNumber.replace(/\D/g, '') === cleanCustomerPhone
    );
  }, [jobs, selectedCustomer]);

  return (
    <div className="space-y-3 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* If a customer profile is selected, show profile & history view */}
      {selectedCustomer ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-right duration-150">
          {/* Back button */}
          <button
            onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers List
          </button>

          {/* Customer Profile Header Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-300">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    {selectedCustomer.name}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 font-bold mt-0.5">
                    {selectedCustomer.mobileNumber}
                  </div>
                  {selectedCustomer.address && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedCustomer.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Jobs</span>
                <span className="font-black text-slate-800 text-base">
                  {customerJobs.length || selectedCustomer.totalJobs}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Spent</span>
                <span className="font-black text-slate-800 text-base font-mono">
                  ₹{customerJobs.reduce((s, j) => s + (j.repairCost || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Due</span>
                <span className="font-black text-red-600 text-base font-mono">
                  ₹{customerJobs.reduce((s, j) => s + (j.balanceAmount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Contact & New Job Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onCallCustomer(selectedCustomer.mobileNumber.replace(/\D/g, ''))}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Call
              </button>

              <a
                href={`https://wa.me/91${selectedCustomer.mobileNumber.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(
                  selectedCustomer.name
                )},%20greeting%20from%20National%20Welding%20Service%20Center.`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>

              <button
                onClick={() => onCreateJobForCustomer(selectedCustomer)}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Job
              </button>
            </div>
          </div>

          {/* Job History List */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                Complete Repair History
              </span>
              <span className="text-xs font-bold text-slate-400">
                {customerJobs.length} {customerJobs.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            <div className="space-y-2.5">
              {customerJobs.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-400 text-xs">
                  No repair jobs recorded yet for this customer.
                </div>
              ) : (
                customerJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {job.jobNumber}
                        </span>
                        <StatusBadge status={job.status} size="sm" />
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm truncate">
                        {job.machineBrand} {job.machineModel}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {job.machineType} • {job.receivedDate}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        ₹{job.repairCost.toLocaleString()}
                      </div>
                      {job.balanceAmount > 0 ? (
                        <div className="text-[10px] font-bold text-red-600">
                          Due: ₹{job.balanceAmount}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-600">
                          Paid
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Customers List */
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer Name or Mobile..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Counts */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-semibold">
              {filteredCustomers.length} Registered Customers
            </span>
            <span className="text-slate-400">Tap to view repair history</span>
          </div>

          {/* Customer Cards */}
          <div className="space-y-2.5">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Customers Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching another name or phone number.
                </p>
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  onSelect={(c) => setSelectedCustomer(c)}
                  onCreateJob={(c) => onCreateJobForCustomer(c)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
