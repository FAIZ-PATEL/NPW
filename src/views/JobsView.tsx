import React, { useState, useMemo } from 'react';
import { Job, JobStatus } from '../types';
import { JobCard } from '../components/JobCard';
import { Search, Filter, Plus, X, Wrench } from 'lucide-react';

interface JobsViewProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onUpdateJobStatus: (job: Job) => void;
  onCallCustomer: (phone: string) => void;
  onOpenNewJob: () => void;
  initialFilter?: JobStatus | 'All';
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onSelectJob,
  onUpdateJobStatus,
  onCallCustomer,
  onOpenNewJob,
  initialFilter = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<JobStatus | 'All'>(initialFilter);

  const filters: Array<{ id: JobStatus | 'All'; label: string; count: number; color?: string }> = [
    { id: 'All', label: 'All Jobs', count: jobs.length },
    {
      id: 'Received',
      label: 'Received',
      count: jobs.filter((j) => j.status === 'Received').length,
      color: 'text-orange-600',
    },
    {
      id: 'Pending',
      label: 'Pending',
      count: jobs.filter((j) => j.status === 'Pending' || j.status === 'Checking' || j.status === 'Repairing').length,
      color: 'text-red-600',
    },
    {
      id: 'Repaired',
      label: 'Repaired',
      count: jobs.filter((j) => j.status === 'Repaired').length,
      color: 'text-green-600',
    },
    {
      id: 'Dispatched',
      label: 'Dispatched',
      count: jobs.filter((j) => j.status === 'Dispatched').length,
      color: 'text-blue-600',
    },
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Status Filter
      if (selectedFilter !== 'All') {
        if (selectedFilter === 'Pending') {
          if (job.status !== 'Pending' && job.status !== 'Checking' && job.status !== 'Repairing') {
            return false;
          }
        } else if (job.status !== selectedFilter) {
          return false;
        }
      }

      // 2. Search Query: Job Number, Customer Name, Mobile Number, Machine Brand, Machine Model
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesJobNumber = job.jobNumber.toLowerCase().includes(q);
        const matchesCustomer = job.customerName.toLowerCase().includes(q);
        const matchesMobile = job.mobileNumber.includes(q);
        const matchesBrand = job.machineBrand.toLowerCase().includes(q);
        const matchesModel = job.machineModel.toLowerCase().includes(q);

        return (
          matchesJobNumber ||
          matchesCustomer ||
          matchesMobile ||
          matchesBrand ||
          matchesModel
        );
      }

      return true;
    });
  }, [jobs, selectedFilter, searchQuery]);

  return (
    <div className="space-y-3 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Job#, Customer, Mobile, Brand, Model..."
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

      {/* Horizontal Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {filters.map((f) => {
          const isSelected = selectedFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="font-semibold">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
        </span>
        {searchQuery && (
          <span className="text-blue-600 font-medium">Filtered by "{searchQuery}"</span>
        )}
      </div>

      {/* Job Cards List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Jobs Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? `No machine repair jobs match "${searchQuery}". Try searching another name or model.`
                : 'No jobs in this category.'}
            </p>
            <button
              onClick={onOpenNewJob}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Job Card
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
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
  );
};
