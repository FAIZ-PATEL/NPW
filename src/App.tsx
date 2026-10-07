/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './views/DashboardView';
import { JobsView } from './views/JobsView';
import { PendingView } from './views/PendingView';
import { RepairedView } from './views/RepairedView';
import { DispatchedView } from './views/DispatchedView';
import { CustomersView } from './views/CustomersView';
import { InventoryView } from './views/InventoryView';
import { ReportsView } from './views/ReportsView';
import { NewJobModal } from './components/NewJobModal';
import { JobDetailsModal } from './components/JobDetailsModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { JobQRCodeModal } from './components/JobQRCodeModal';
import { DigitalJobSummaryModal } from './components/DigitalJobSummaryModal';
import { QRScannerModal } from './components/QRScannerModal';
import { DataService } from './services/dataService';
import { Job, Customer, Payment, Technician, InventoryItem, JobStatus, PaymentMode } from './types';
import { Check, X, PhoneCall, AlertCircle, Sparkles, QrCode } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [jobsFilter, setJobsFilter] = useState<JobStatus | 'All'>('All');

  // Modals state
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<Job | null>(null);
  const [selectedJobForInvoice, setSelectedJobForInvoice] = useState<Job | null>(null);
  const [selectedJobForQRTag, setSelectedJobForQRTag] = useState<Job | null>(null);
  const [digitalSummaryJob, setDigitalSummaryJob] = useState<Job | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [customerForNewJob, setCustomerForNewJob] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Status Update Modal
  const [statusModalJob, setStatusModalJob] = useState<Job | null>(null);

  // Check URL on load for ?job=NW-XXXX parameter (e.g. when someone scans QR code with phone camera)
  useEffect(() => {
    if (jobs.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const jobQuery = params.get('job');
      if (jobQuery) {
        const cleanJob = jobQuery.toUpperCase().trim();
        const matched = jobs.find(
          (j) => j.jobNumber.toUpperCase() === cleanJob || j.id === jobQuery
        );
        if (matched && !digitalSummaryJob) {
          setDigitalSummaryJob(matched);
        }
      }
    }
  }, [jobs]);

  // Subscribe to real-time Firestore / local storage data
  useEffect(() => {
    const unsubJobs = DataService.subscribeJobs((data) => setJobs(data));
    const unsubCust = DataService.subscribeCustomers((data) => setCustomers(data));
    const unsubPay = DataService.subscribePayments((data) => setPayments(data));
    const unsubTech = DataService.subscribeTechnicians((data) => setTechnicians(data));
    const unsubInv = DataService.subscribeInventory((data) => setInventory(data));

    return () => {
      unsubJobs();
      unsubCust();
      unsubPay();
      unsubTech();
      unsubInv();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Next Job Number calculation: NW-0001, NW-0002...
  const nextJobNumber = DataService.getNextJobNumber(jobs);

  // Handle Save New Job
  const handleSaveJob = async (jobData: any) => {
    try {
      const created = await DataService.createJob(jobData);
      showToast(`Job Card ${created.jobNumber} created successfully!`);
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('Error saving job card. Check connection.');
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (jobId: string, newStatus: JobStatus, remark?: string) => {
    await DataService.updateJobStatus(jobId, newStatus, remark);
    showToast(`Status updated to ${newStatus}`);
    
    // Update local modal if open
    if (selectedJobForDetails && selectedJobForDetails.id === jobId) {
      setSelectedJobForDetails((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              technicianRemark: remark || prev.technicianRemark,
            }
          : null
      );
    }
  };

  // Handle Photo Update
  const handleUpdatePhoto = async (jobId: string, photoUrl: string) => {
    await DataService.updateJobPhoto(jobId, photoUrl);
    showToast('Machine photo updated successfully!');
    if (selectedJobForDetails && selectedJobForDetails.id === jobId) {
      setSelectedJobForDetails((prev) => (prev ? { ...prev, machinePhoto: photoUrl } : null));
    }
  };

  // Handle Add Payment
  const handleConfirmPayment = async (amount: number, mode: PaymentMode, notes: string) => {
    if (!selectedJobForPayment) return;
    await DataService.addPaymentToJob(selectedJobForPayment.id, amount, mode, notes);
    showToast(`₹${amount.toLocaleString()} payment recorded (${mode})`);
    
    // Refresh detailed job if open
    if (selectedJobForDetails && selectedJobForDetails.id === selectedJobForPayment.id) {
      const newAdvance = (selectedJobForDetails.advancePaid || 0) + amount;
      const newBal = Math.max(0, (selectedJobForDetails.repairCost || 0) - newAdvance);
      setSelectedJobForDetails({
        ...selectedJobForDetails,
        advancePaid: newAdvance,
        balanceAmount: newBal,
        paymentStatus: newBal === 0 ? 'Paid' : 'Partial',
      });
    }
  };

  // Handle Phone Call
  const handleCallCustomer = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.location.href = `tel:${clean}`;
  };

  // Quick Action from Customer tab to create job
  const handleCreateJobForCustomer = (cust: Customer) => {
    setCustomerForNewJob(cust);
    setIsNewJobOpen(true);
  };

  const pendingCount = jobs.filter(
    (j) => j.status === 'Pending' || j.status === 'Checking' || j.status === 'Repairing' || j.status === 'Received'
  ).length;

  const repairedCount = jobs.filter((j) => j.status === 'Repaired').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Mobile Frame Container (Responsive for all screens, optimized for Android Phone viewport) */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-100 flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* App Header with NW Logo & Live Status */}
        <Header
          onOpenNewJob={() => {
            setCustomerForNewJob(null);
            setIsNewJobOpen(true);
          }}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
        />

        {/* Floating Quick Action Toast */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-top duration-200">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content Rendering */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'home' && (
            <DashboardView
              jobs={jobs}
              customers={customers}
              payments={payments}
              onOpenNewJob={() => {
                setCustomerForNewJob(null);
                setIsNewJobOpen(true);
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onUpdateJobStatus={(j) => setStatusModalJob(j)}
              onCallCustomer={handleCallCustomer}
              onSelectStatusFilter={(f) => setJobsFilter(f)}
            />
          )}

          {currentTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              initialFilter={jobsFilter}
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onUpdateJobStatus={(j) => setStatusModalJob(j)}
              onCallCustomer={handleCallCustomer}
              onOpenNewJob={() => {
                setCustomerForNewJob(null);
                setIsNewJobOpen(true);
              }}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              jobs={jobs}
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onCreateJobForCustomer={handleCreateJobForCustomer}
              onCallCustomer={handleCallCustomer}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              items={inventory}
              onUpdateStock={(id, delta) => DataService.updateInventoryQuantity(id, delta)}
              onAddItem={async (item) => {
                await DataService.addInventoryItem(item);
              }}
            />
          )}

          {currentTab === 'more' && (
            <ReportsView
              jobs={jobs}
              customers={customers}
              payments={payments}
              technicians={technicians}
              onSelectJob={(j) => setSelectedJobForDetails(j)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}
        </main>

        {/* Bottom Android Navigation */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          pendingCount={pendingCount}
          repairedCount={repairedCount}
        />
      </div>

      {/* MODALS */}
      {/* 1. New Job Card Modal */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        onSave={handleSaveJob}
        existingJobs={jobs}
        customers={customers}
        technicians={technicians}
        initialCustomer={customerForNewJob}
        nextJobNumber={nextJobNumber}
      />

      {/* 2. Job Details Modal */}
      <JobDetailsModal
        job={selectedJobForDetails}
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePhoto={handleUpdatePhoto}
        onOpenAddPayment={(j) => setSelectedJobForPayment(j)}
        onOpenInvoice={(j) => setSelectedJobForInvoice(j)}
        onOpenQRTag={(j) => setSelectedJobForQRTag(j)}
      />

      {/* 3. Add Payment Modal */}
      <AddPaymentModal
        job={selectedJobForPayment}
        isOpen={!!selectedJobForPayment}
        onClose={() => setSelectedJobForPayment(null)}
        onConfirm={handleConfirmPayment}
      />

      {/* 4. Invoice Slip / Gate Pass Modal */}
      <InvoicePrintModal
        job={selectedJobForInvoice}
        isOpen={!!selectedJobForInvoice}
        onClose={() => setSelectedJobForInvoice(null)}
      />

      {/* 5. Machine QR Code Tag & Sticker Modal */}
      <JobQRCodeModal
        job={selectedJobForQRTag}
        isOpen={!!selectedJobForQRTag}
        onClose={() => setSelectedJobForQRTag(null)}
        onOpenDigitalSummary={(j) => {
          setSelectedJobForQRTag(null);
          setDigitalSummaryJob(j);
        }}
      />

      {/* 6. Digital Job Summary Page / Modal (Opens upon QR scan or URL link) */}
      <DigitalJobSummaryModal
        job={digitalSummaryJob}
        isOpen={!!digitalSummaryJob}
        onClose={() => setDigitalSummaryJob(null)}
        onUpdateStatus={handleUpdateStatus}
        onOpenAddPayment={(j) => setSelectedJobForPayment(j)}
        onOpenInvoice={(j) => setSelectedJobForInvoice(j)}
        onOpenQRTag={(j) => setSelectedJobForQRTag(j)}
      />

      {/* 7. Live QR Camera Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        jobs={jobs}
        onScanSuccess={(scannedJobNumber) => {
          const matched = jobs.find(
            (j) => j.jobNumber.toUpperCase() === scannedJobNumber.toUpperCase()
          );
          if (matched) {
            setDigitalSummaryJob(matched);
            showToast(`Scanned Job: ${matched.jobNumber}`);
          }
        }}
      />

      {/* 8. Quick Status Update Dialog */}
      {statusModalJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Update Status</h4>
                <p className="text-xs font-mono text-slate-500">{statusModalJob.jobNumber} • {statusModalJob.customerName}</p>
              </div>
              <button
                onClick={() => setStatusModalJob(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {(['Received', 'Checking', 'Repairing', 'Repaired', 'Dispatched'] as JobStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={async () => {
                    await handleUpdateStatus(statusModalJob.id, st);
                    setStatusModalJob(null);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors ${
                    statusModalJob.status === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{st}</span>
                  {statusModalJob.status === st && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
