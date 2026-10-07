import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Job, Customer, Payment, Technician, InventoryItem, JobStatus, PaymentMode, UsedSpareItem, StockHistoryEntry, RepairApprovalStatus } from '../types';
import { PRE_ADDED_SPARES } from '../data/initialSpares';

const INITIAL_TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'Irfan (Lead Welder Tech)', specialization: 'Inverter ARC & TIG PCB', phone: '9876543211', active: true, completedJobsCount: 42 },
  { id: 'tech-2', name: 'Rashid (PCB & Electronics)', specialization: 'IGBT & Mosfet Circuits', phone: '9876543212', active: true, completedJobsCount: 38 },
  { id: 'tech-3', name: 'Salim (Power Tool Armature)', specialization: 'Armature & Field Coils', phone: '9876543213', active: true, completedJobsCount: 51 },
  { id: 'tech-4', name: 'Vikram (MIG / Wire Feeder)', specialization: 'Heavy Duty Welding Machines', phone: '9876543214', active: true, completedJobsCount: 29 },
];

const INITIAL_INVENTORY: InventoryItem[] = PRE_ADDED_SPARES;

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Irfan Shaikh',
    mobileNumber: '9876543210',
    totalJobs: 3,
    totalSpent: 3550,
    pendingBalance: 500,
    address: 'Plot 42, Industrial Area Phase 2',
    createdAt: '2026-09-10',
    lastJobDate: '2026-09-28',
  },
  {
    id: 'cust-2',
    name: 'Rajesh Verma Fabtech',
    mobileNumber: '9822334455',
    totalJobs: 4,
    totalSpent: 6200,
    pendingBalance: 0,
    address: 'Near Old Toll Gate, MIDC',
    createdAt: '2026-08-15',
    lastJobDate: '2026-09-29',
  },
  {
    id: 'cust-3',
    name: 'Amit Patel Engineering',
    mobileNumber: '9711223344',
    totalJobs: 2,
    totalSpent: 2800,
    pendingBalance: 700,
    address: 'Shree Krishna Steel Works',
    createdAt: '2026-09-01',
    lastJobDate: '2026-09-27',
  },
  {
    id: 'cust-4',
    name: 'Mohammed Aslam',
    mobileNumber: '9988776655',
    totalJobs: 1,
    totalSpent: 1850,
    pendingBalance: 0,
    address: 'GIDC Sector 3',
    createdAt: '2026-09-20',
    lastJobDate: '2026-09-25',
  },
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    jobNumber: 'NW-0001',
    customerId: 'cust-1',
    customerName: 'Irfan Shaikh',
    mobileNumber: '9876543210',
    machineBrand: 'Bosch',
    machineModel: 'GBH 2-26 DRE',
    machineType: 'Rotary Hammer Drill',
    serialNumber: 'BSH-883921',
    complaint: 'Heavy sparking from motor, hammering function slipping under load',
    receivedDate: '2026-09-28',
    expectedDeliveryDate: '2026-09-30',
    status: 'Pending',
    approvalStatus: 'Customer Approved',
    repairCost: 1200,
    advancePaid: 500,
    balanceAmount: 700,
    paymentStatus: 'Partial',
    technician: 'Salim (Power Tool Armature)',
    technicianRemark: 'Armature commutator worn out. Carbon brush replacement needed.',
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-09-28T14:15:00Z',
  },
  {
    id: 'job-2',
    jobNumber: 'NW-0002',
    customerId: 'cust-2',
    customerName: 'Rajesh Verma Fabtech',
    mobileNumber: '9822334455',
    machineBrand: 'ESAB',
    machineModel: 'Buddy ARC 400i',
    machineType: 'Inverter ARC Welder',
    serialNumber: 'ESB-400-9921',
    complaint: 'O.C. (Over Current) error light continuous on, no welding spark output',
    receivedDate: '2026-09-27',
    expectedDeliveryDate: '2026-09-29',
    repairedDate: '2026-09-29',
    status: 'Repaired',
    approvalStatus: 'Customer Approved',
    repairCost: 2400,
    advancePaid: 1000,
    balanceAmount: 1400,
    paymentStatus: 'Partial',
    technician: 'Rashid (PCB & Electronics)',
    technicianRemark: 'Replaced 2x IGBT 40N60 modules and gate drive resistors. Tested at 220A load.',
    createdAt: '2026-09-27T11:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'job-3',
    jobNumber: 'NW-0003',
    customerId: 'cust-3',
    customerName: 'Amit Patel Engineering',
    mobileNumber: '9711223344',
    machineBrand: 'Ador Welding',
    machineModel: 'Champ T400',
    machineType: 'TIG / MMA Welding Machine',
    serialNumber: 'ADR-90214',
    complaint: 'Machine dead, display not powering on after high voltage surge',
    receivedDate: '2026-09-29',
    expectedDeliveryDate: '2026-10-02',
    status: 'Received',
    approvalStatus: 'Quotation Sent',
    repairCost: 2800,
    advancePaid: 800,
    balanceAmount: 2000,
    paymentStatus: 'Partial',
    technician: 'Irfan (Lead Welder Tech)',
    technicianRemark: 'Checking primary SMPS auxiliary power supply card.',
    createdAt: '2026-09-29T08:45:00Z',
    updatedAt: '2026-09-29T08:45:00Z',
  },
  {
    id: 'job-4',
    jobNumber: 'NW-0004',
    customerId: 'cust-4',
    customerName: 'Mohammed Aslam',
    mobileNumber: '9988776655',
    machineBrand: 'DeWalt',
    machineModel: 'D28111 Heavy Duty',
    machineType: 'Angle Grinder 4 inch',
    serialNumber: 'DW-441092',
    complaint: 'Intermittent power supply, cut off when cord bent, switch jammed with dust',
    receivedDate: '2026-09-24',
    expectedDeliveryDate: '2026-09-25',
    repairedDate: '2026-09-25',
    dispatchedDate: '2026-09-26',
    status: 'Dispatched',
    approvalStatus: 'Customer Approved',
    repairCost: 850,
    advancePaid: 850,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    technician: 'Salim (Power Tool Armature)',
    technicianRemark: 'New power cord fitted, on/off paddle switch replaced and tested.',
    deliveryRemark: 'Delivered to customer, tested with wire cup brush in workshop.',
    createdAt: '2026-09-24T10:20:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
  },
  {
    id: 'job-5',
    jobNumber: 'NW-0005',
    customerId: 'cust-1',
    customerName: 'Irfan Shaikh',
    mobileNumber: '9876543210',
    machineBrand: 'Cruxweld',
    machineModel: 'MIG 250A',
    machineType: 'MIG/MAG Welding Machine',
    serialNumber: 'CRX-250-77',
    complaint: 'Wire feeder motor running slow, erratic wire feeding during welding',
    receivedDate: '2026-09-28',
    expectedDeliveryDate: '2026-09-30',
    status: 'Pending',
    approvalStatus: 'Waiting for Approval',
    repairCost: 1500,
    advancePaid: 1000,
    balanceAmount: 500,
    paymentStatus: 'Partial',
    technician: 'Vikram (MIG / Wire Feeder)',
    technicianRemark: 'Wire feed motor gearbox cleaned and re-greased; tension roller adjusted.',
    createdAt: '2026-09-28T14:00:00Z',
    updatedAt: '2026-09-28T16:30:00Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    jobId: 'job-1',
    jobNumber: 'NW-0001',
    customerName: 'Irfan Shaikh',
    amount: 500,
    paymentType: 'Advance',
    paymentMode: 'UPI',
    date: '2026-09-28',
    time: '09:35 AM',
    notes: 'Google Pay advance payment',
  },
  {
    id: 'pay-2',
    jobId: 'job-2',
    jobNumber: 'NW-0002',
    customerName: 'Rajesh Verma Fabtech',
    amount: 1000,
    paymentType: 'Advance',
    paymentMode: 'Cash',
    date: '2026-09-27',
    time: '11:15 AM',
    notes: 'Cash advance upon job intake',
  },
  {
    id: 'pay-3',
    jobId: 'job-3',
    jobNumber: 'NW-0003',
    customerName: 'Amit Patel Engineering',
    amount: 800,
    paymentType: 'Advance',
    paymentMode: 'UPI',
    date: '2026-09-29',
    time: '08:50 AM',
    notes: 'PhonePe advance payment',
  },
  {
    id: 'pay-4',
    jobId: 'job-4',
    jobNumber: 'NW-0004',
    customerName: 'Mohammed Aslam',
    amount: 850,
    paymentType: 'Final',
    paymentMode: 'Cash',
    date: '2026-09-26',
    time: '04:10 PM',
    notes: 'Full balance settled upon dispatch',
  },
  {
    id: 'pay-5',
    jobId: 'job-5',
    jobNumber: 'NW-0005',
    customerName: 'Irfan Shaikh',
    amount: 1000,
    paymentType: 'Advance',
    paymentMode: 'UPI',
    date: '2026-09-28',
    time: '02:15 PM',
    notes: 'Advance for MIG 250 repair',
  },
];

// In-Memory & LocalStorage cache
const LOCAL_STORAGE_KEYS = {
  JOBS: 'nw_service_jobs_v1',
  CUSTOMERS: 'nw_service_customers_v1',
  PAYMENTS: 'nw_service_payments_v1',
  TECHNICIANS: 'nw_service_techs_v1',
  INVENTORY: 'nw_service_inv_v1',
};

function getLocalData<T>(key: string, defaultData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

export function getLocalInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.INVENTORY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(PRE_ADDED_SPARES));
      return PRE_ADDED_SPARES;
    }
    const parsed: InventoryItem[] = JSON.parse(raw);
    const existingNames = new Set(parsed.map((p) => p.partName.toLowerCase().trim()));
    const missing = PRE_ADDED_SPARES.filter(
      (s) => !existingNames.has(s.partName.toLowerCase().trim())
    );
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return PRE_ADDED_SPARES;
  }
}

function setLocalData<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

export class DataService {
  private static seeded = false;

  // Real-time subscribers
  static subscribeJobs(callback: (jobs: Job[]) => void): () => void {
    // Immediate callback with local data to ensure zero wait
    const local = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    callback(local);

    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty && !this.seeded) {
            this.seedInitialData();
            return;
          }
          const jobs: Job[] = [];
          snapshot.forEach((docSnap) => {
            jobs.push(docSnap.data() as Job);
          });
          if (jobs.length > 0) {
            setLocalData(LOCAL_STORAGE_KEYS.JOBS, jobs);
            callback(jobs);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'jobs');
          // Fallback to local data
          callback(getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Using local job storage:', err);
      return () => {};
    }
  }

  static subscribeCustomers(callback: (customers: Customer[]) => void): () => void {
    const local = getLocalData<Customer>(LOCAL_STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    callback(local);

    try {
      const q = query(collection(db, 'customers'), orderBy('totalJobs', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty && !this.seeded) {
            this.seedInitialData();
            return;
          }
          const customers: Customer[] = [];
          snapshot.forEach((docSnap) => {
            customers.push(docSnap.data() as Customer);
          });
          if (customers.length > 0) {
            setLocalData(LOCAL_STORAGE_KEYS.CUSTOMERS, customers);
            callback(customers);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'customers');
          callback(getLocalData<Customer>(LOCAL_STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Using local customer storage:', err);
      return () => {};
    }
  }

  static subscribePayments(callback: (payments: Payment[]) => void): () => void {
    const local = getLocalData<Payment>(LOCAL_STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    callback(local);

    try {
      const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const payments: Payment[] = [];
          snapshot.forEach((docSnap) => {
            payments.push(docSnap.data() as Payment);
          });
          if (payments.length > 0) {
            setLocalData(LOCAL_STORAGE_KEYS.PAYMENTS, payments);
            callback(payments);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'payments');
          callback(getLocalData<Payment>(LOCAL_STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS));
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Using local payment storage:', err);
      return () => {};
    }
  }

  static subscribeTechnicians(callback: (techs: Technician[]) => void): () => void {
    const local = getLocalData<Technician>(LOCAL_STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
    callback(local);

    try {
      const unsubscribe = onSnapshot(
        collection(db, 'technicians'),
        (snapshot) => {
          const techs: Technician[] = [];
          snapshot.forEach((docSnap) => {
            techs.push(docSnap.data() as Technician);
          });
          if (techs.length > 0) {
            setLocalData(LOCAL_STORAGE_KEYS.TECHNICIANS, techs);
            callback(techs);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'technicians');
          callback(getLocalData<Technician>(LOCAL_STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS));
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  static subscribeInventory(callback: (items: InventoryItem[]) => void): () => void {
    const local = getLocalInventory();
    callback(local);

    try {
      const unsubscribe = onSnapshot(
        collection(db, 'inventory'),
        (snapshot) => {
          const items: InventoryItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as InventoryItem);
          });
          if (items.length > 0) {
            const existingNames = new Set(items.map((p) => p.partName.toLowerCase().trim()));
            const missing = PRE_ADDED_SPARES.filter(
              (s) => !existingNames.has(s.partName.toLowerCase().trim())
            );
            const finalItems = missing.length > 0 ? [...items, ...missing] : items;
            setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, finalItems);
            callback(finalItems);
          } else {
            callback(getLocalInventory());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'inventory');
          callback(getLocalInventory());
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  // Generate next sequential Job Number: NW-0001, NW-0002...
  static getNextJobNumber(existingJobs: Job[]): string {
    let maxNum = 0;
    for (const job of existingJobs) {
      const match = job.jobNumber.match(/NW-(\d+)/i);
      if (match && match[1]) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    const next = maxNum + 1;
    return `NW-${String(next).padStart(4, '0')}`;
  }

  // Create new job card
  static async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'balanceAmount' | 'paymentStatus'>): Promise<Job> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const repairCost = Number(jobData.repairCost) || 0;
    const advancePaid = Number(jobData.advancePaid) || 0;
    const balanceAmount = Math.max(0, repairCost - advancePaid);
    
    let paymentStatus: Job['paymentStatus'] = 'Pending';
    if (balanceAmount === 0 && repairCost > 0) {
      paymentStatus = 'Paid';
    } else if (advancePaid > 0) {
      paymentStatus = 'Partial';
    }

    const now = new Date().toISOString();
    const newJob: Job = {
      ...jobData,
      id,
      repairCost,
      advancePaid,
      balanceAmount,
      paymentStatus,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Update local cache immediately
    const existing = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const updated = [newJob, ...existing];
    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updated);

    // 2. Customer record handling
    await this.updateOrCreateCustomerForJob(newJob);

    // 3. If advance amount was paid, create a payment record
    if (advancePaid > 0) {
      await this.recordPayment({
        jobId: newJob.id,
        jobNumber: newJob.jobNumber,
        customerName: newJob.customerName,
        amount: advancePaid,
        paymentType: 'Advance',
        paymentMode: 'Cash',
        date: newJob.receivedDate || new Date().toISOString().split('T')[0],
        notes: `Advance for ${newJob.machineBrand} ${newJob.machineModel}`,
      });
    }

    // 4. Save to Firestore
    try {
      await setDoc(doc(db, 'jobs', id), newJob);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `jobs/${id}`);
    }

    return newJob;
  }

  // Update Status
  static async updateJobStatus(jobId: string, newStatus: JobStatus, remark?: string): Promise<void> {
    const existing = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const nowStr = new Date().toISOString().split('T')[0];
    const updated = existing.map((j) => {
      if (j.id === jobId) {
        const patch: Partial<Job> = {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (newStatus === 'Repaired' && !j.repairedDate) {
          patch.repairedDate = nowStr;
        }
        if (newStatus === 'Dispatched') {
          patch.dispatchedDate = nowStr;
          if (remark) patch.deliveryRemark = remark;
        }
        if (remark && newStatus !== 'Dispatched') {
          patch.technicianRemark = remark;
        }
        return { ...j, ...patch };
      }
      return j;
    });

    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updated);

    try {
      const target = updated.find((j) => j.id === jobId);
      if (target) {
        await updateDoc(doc(db, 'jobs', jobId), {
          status: target.status,
          updatedAt: target.updatedAt,
          ...(target.repairedDate ? { repairedDate: target.repairedDate } : {}),
          ...(target.dispatchedDate ? { dispatchedDate: target.dispatchedDate } : {}),
          ...(target.deliveryRemark ? { deliveryRemark: target.deliveryRemark } : {}),
          ...(target.technicianRemark ? { technicianRemark: target.technicianRemark } : {}),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  }

  // Update Customer Repair Approval Status
  static async updateJobApprovalStatus(
    jobId: string,
    approvalStatus: RepairApprovalStatus,
    autoAdvanceStatus = true
  ): Promise<void> {
    const existing = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    let targetJob: Job | undefined;

    const updated = existing.map((j) => {
      if (j.id === jobId) {
        const patch: Partial<Job> = {
          approvalStatus,
          updatedAt: new Date().toISOString(),
        };

        if (autoAdvanceStatus) {
          if (approvalStatus === 'Customer Approved') {
            if (j.status === 'Received' || j.status === 'Checking' || j.status === 'Pending') {
              patch.status = 'Repairing';
            }
          } else if (approvalStatus === 'Quotation Sent') {
            if (j.status === 'Received') {
              patch.status = 'Checking';
            }
          }
        }

        targetJob = { ...j, ...patch };
        return targetJob;
      }
      return j;
    });

    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updated);

    if (targetJob) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          approvalStatus: targetJob.approvalStatus,
          status: targetJob.status,
          updatedAt: targetJob.updatedAt,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
      }
    }
  }

  // Update Job Quotation details (Labour charges, completion date, notes, total cost)
  static async updateJobQuotation(
    jobId: string,
    quotationData: {
      labourCharges?: number;
      expectedCompletionDate?: string;
      expectedDeliveryDate?: string;
      quotationNotes?: string;
      repairCost?: number;
    }
  ): Promise<void> {
    const existing = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    let targetJob: Job | undefined;

    const updated = existing.map((j) => {
      if (j.id === jobId) {
        const repairCost = quotationData.repairCost !== undefined ? quotationData.repairCost : j.repairCost;
        const advancePaid = j.advancePaid || 0;
        const balanceAmount = Math.max(0, repairCost - advancePaid);
        let paymentStatus = j.paymentStatus;
        if (balanceAmount === 0 && repairCost > 0) paymentStatus = 'Paid';
        else if (advancePaid > 0) paymentStatus = 'Partial';

        targetJob = {
          ...j,
          ...quotationData,
          repairCost,
          balanceAmount,
          paymentStatus,
          updatedAt: new Date().toISOString(),
        };
        return targetJob;
      }
      return j;
    });

    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updated);

    if (targetJob) {
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          repairCost: targetJob.repairCost,
          balanceAmount: targetJob.balanceAmount,
          paymentStatus: targetJob.paymentStatus,
          ...(targetJob.labourCharges !== undefined ? { labourCharges: targetJob.labourCharges } : {}),
          ...(targetJob.expectedCompletionDate ? { expectedCompletionDate: targetJob.expectedCompletionDate } : {}),
          ...(targetJob.expectedDeliveryDate ? { expectedDeliveryDate: targetJob.expectedDeliveryDate } : {}),
          ...(targetJob.quotationNotes ? { quotationNotes: targetJob.quotationNotes } : {}),
          updatedAt: targetJob.updatedAt,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
      }
    }
  }

  // Update Machine Photo
  static async updateJobPhoto(jobId: string, machinePhoto: string): Promise<void> {
    const existing = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const updated = existing.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          machinePhoto,
          updatedAt: new Date().toISOString(),
        };
      }
      return j;
    });

    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updated);

    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        machinePhoto,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  }

  // Record additional payment
  static async addPaymentToJob(
    jobId: string,
    amount: number,
    paymentMode: PaymentMode,
    notes?: string
  ): Promise<void> {
    const jobs = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const newAdvance = (job.advancePaid || 0) + amount;
    const newBalance = Math.max(0, (job.repairCost || 0) - newAdvance);
    let newPayStatus: Job['paymentStatus'] = 'Pending';
    if (newBalance === 0) newPayStatus = 'Paid';
    else if (newAdvance > 0) newPayStatus = 'Partial';

    const updatedJobs = jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            advancePaid: newAdvance,
            balanceAmount: newBalance,
            paymentStatus: newPayStatus,
            updatedAt: new Date().toISOString(),
          }
        : j
    );
    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updatedJobs);

    // Record payment entry
    await this.recordPayment({
      jobId: job.id,
      jobNumber: job.jobNumber,
      customerName: job.customerName,
      amount,
      paymentType: newBalance === 0 ? 'Final' : 'Partial',
      paymentMode,
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Payment for ${job.jobNumber}`,
    });

    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        advancePaid: newAdvance,
        balanceAmount: newBalance,
        paymentStatus: newPayStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  }

  // Record payment transaction
  static async recordPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPayment: Payment = {
      ...paymentData,
      id,
      time: timeStr,
    };

    const existing = getLocalData<Payment>(LOCAL_STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setLocalData(LOCAL_STORAGE_KEYS.PAYMENTS, [newPayment, ...existing]);

    try {
      await setDoc(doc(db, 'payments', id), newPayment);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `payments/${id}`);
    }

    return newPayment;
  }

  // Update or create customer profile
  private static async updateOrCreateCustomerForJob(job: Job): Promise<void> {
    const customers = getLocalData<Customer>(LOCAL_STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const existingIndex = customers.findIndex(
      (c) => c.mobileNumber.replace(/\D/g, '') === job.mobileNumber.replace(/\D/g, '')
    );

    const today = new Date().toISOString().split('T')[0];
    let updatedCustomers: Customer[];

    if (existingIndex >= 0) {
      const current = customers[existingIndex];
      const updatedCust: Customer = {
        ...current,
        name: job.customerName || current.name,
        totalJobs: (current.totalJobs || 0) + 1,
        totalSpent: (current.totalSpent || 0) + (job.repairCost || 0),
        pendingBalance: (current.pendingBalance || 0) + (job.balanceAmount || 0),
        lastJobDate: today,
      };
      updatedCustomers = [...customers];
      updatedCustomers[existingIndex] = updatedCust;

      try {
        await updateDoc(doc(db, 'customers', current.id), updatedCust as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `customers/${current.id}`);
      }
    } else {
      const newCustId = `cust_${Date.now()}`;
      const newCust: Customer = {
        id: newCustId,
        name: job.customerName,
        mobileNumber: job.mobileNumber,
        totalJobs: 1,
        totalSpent: job.repairCost || 0,
        pendingBalance: job.balanceAmount || 0,
        createdAt: today,
        lastJobDate: today,
      };
      updatedCustomers = [newCust, ...customers];

      try {
        await setDoc(doc(db, 'customers', newCustId), newCust);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `customers/${newCustId}`);
      }
    }

    setLocalData(LOCAL_STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  }

  // Inventory Stock Adjustment
  static async updateInventoryQuantity(itemId: string, changeDelta: number): Promise<void> {
    const items = getLocalInventory();
    const updated = items.map((it) => {
      if (it.id === itemId) {
        return { ...it, quantity: Math.max(0, it.quantity + changeDelta) };
      }
      return it;
    });
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      const item = updated.find((i) => i.id === itemId);
      if (item) {
        await updateDoc(doc(db, 'inventory', itemId), { quantity: item.quantity });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${itemId}`);
    }
  }

  // Stock In (Add Stock)
  static async addStock(
    itemId: string,
    addedQty: number,
    notes?: string,
    supplier?: string
  ): Promise<void> {
    const items = getLocalInventory();
    const spare = items.find((i) => i.id === itemId);
    if (!spare) return;

    const previousQty = spare.quantity;
    const newQty = previousQty + addedQty;
    const historyEntry: StockHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'IN',
      quantity: addedQty,
      previousQty,
      newQty,
      supplier: supplier || spare.supplier,
      notes: notes || 'Stock received',
    };

    const updatedSpare: InventoryItem = {
      ...spare,
      quantity: newQty,
      supplier: supplier || spare.supplier,
      stockHistory: [historyEntry, ...(spare.stockHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    const updated = items.map((i) => (i.id === itemId ? updatedSpare : i));
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      await updateDoc(doc(db, 'inventory', itemId), {
        quantity: newQty,
        supplier: updatedSpare.supplier,
        stockHistory: updatedSpare.stockHistory,
        updatedAt: updatedSpare.updatedAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${itemId}`);
    }
  }

  // Stock Out (Manual Deduction)
  static async stockOut(
    itemId: string,
    deductedQty: number,
    notes?: string
  ): Promise<void> {
    const items = getLocalInventory();
    const spare = items.find((i) => i.id === itemId);
    if (!spare) return;

    const previousQty = spare.quantity;
    const newQty = Math.max(0, previousQty - deductedQty);
    const actualDeducted = previousQty - newQty;

    const historyEntry: StockHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'OUT',
      quantity: actualDeducted,
      previousQty,
      newQty,
      notes: notes || 'Manual stock out / testing / defect',
    };

    const updatedSpare: InventoryItem = {
      ...spare,
      quantity: newQty,
      stockHistory: [historyEntry, ...(spare.stockHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    const updated = items.map((i) => (i.id === itemId ? updatedSpare : i));
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      await updateDoc(doc(db, 'inventory', itemId), {
        quantity: newQty,
        stockHistory: updatedSpare.stockHistory,
        updatedAt: updatedSpare.updatedAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${itemId}`);
    }
  }

  // Add New Spare / Part (including Custom / Other Spares)
  static async addInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const id = `inv_${Date.now()}`;
    const initialQty = Number(itemData.quantity) || 0;
    const historyEntry: StockHistoryEntry = {
      id: `hist_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'IN',
      quantity: initialQty,
      previousQty: 0,
      newQty: initialQty,
      supplier: itemData.supplier,
      notes: 'Initial component registration',
    };

    const newItem: InventoryItem = {
      ...itemData,
      id,
      purchasePrice: itemData.purchasePrice ?? itemData.unitPrice,
      sellingPrice: itemData.sellingPrice ?? itemData.unitPrice,
      minStockLevel: itemData.minStockLevel ?? itemData.minThreshold ?? 5,
      minThreshold: itemData.minStockLevel ?? itemData.minThreshold ?? 5,
      stockHistory: initialQty > 0 ? [historyEntry] : [],
      updatedAt: new Date().toISOString(),
    };

    const items = getLocalInventory();
    const updated = [newItem, ...items];
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      await setDoc(doc(db, 'inventory', id), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inventory/${id}`);
    }
    return newItem;
  }

  // Edit Existing Spare
  static async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    const items = getLocalInventory();
    const updated = items.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          ...updates,
          minThreshold: updates.minStockLevel ?? updates.minThreshold ?? i.minThreshold,
          minStockLevel: updates.minStockLevel ?? updates.minThreshold ?? i.minStockLevel,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      await updateDoc(doc(db, 'inventory', itemId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inventory/${itemId}`);
    }
  }

  // Delete Spare
  static async deleteInventoryItem(itemId: string): Promise<void> {
    const items = getLocalInventory();
    const updated = items.filter((i) => i.id !== itemId);
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updated);

    try {
      await deleteDoc(doc(db, 'inventory', itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inventory/${itemId}`);
    }
  }

  // Automatic Stock Deduction when Spare used in Job
  static async useSpareInJob(
    jobId: string,
    spareId: string,
    quantity: number
  ): Promise<{ success: boolean; remainingQty: number; isLowStock: boolean; partName: string; error?: string }> {
    const jobs = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) {
      return { success: false, remainingQty: 0, isLowStock: false, partName: '', error: 'Job Card not found' };
    }

    const inventory = getLocalInventory();
    const spare = inventory.find((i) => i.id === spareId);
    if (!spare) {
      return { success: false, remainingQty: 0, isLowStock: false, partName: '', error: 'Spare component not found' };
    }

    if (spare.quantity < quantity) {
      return {
        success: false,
        remainingQty: spare.quantity,
        isLowStock: true,
        partName: spare.partName,
        error: `Insufficient stock! Only ${spare.quantity} available in workshop.`,
      };
    }

    const previousQty = spare.quantity;
    const newQty = previousQty - quantity;
    const historyEntry: StockHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'JOB_USE',
      quantity,
      previousQty,
      newQty,
      referenceJobNumber: targetJob.jobNumber,
      referenceCustomerName: targetJob.customerName,
      notes: `Used in Job ${targetJob.jobNumber} (${targetJob.machineBrand} ${targetJob.machineModel})`,
    };

    const updatedSpare: InventoryItem = {
      ...spare,
      quantity: newQty,
      stockHistory: [historyEntry, ...(spare.stockHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    const updatedInventory = inventory.map((i) => (i.id === spareId ? updatedSpare : i));
    setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updatedInventory);

    // Add spare to targetJob.sparesUsed
    const existingSpares = targetJob.sparesUsed || [];
    const unitPrice = spare.sellingPrice || spare.unitPrice || 0;
    const usedSpareItem: UsedSpareItem = {
      spareId: spare.id,
      partName: spare.partName,
      partNumber: spare.partNumber,
      category: spare.category,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      deductedAt: new Date().toISOString(),
    };

    const updatedJob: Job = {
      ...targetJob,
      sparesUsed: [...existingSpares, usedSpareItem],
      updatedAt: new Date().toISOString(),
    };

    const updatedJobs = jobs.map((j) => (j.id === jobId ? updatedJob : j));
    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updatedJobs);

    // Firestore sync
    try {
      await updateDoc(doc(db, 'inventory', spareId), {
        quantity: newQty,
        stockHistory: updatedSpare.stockHistory,
        updatedAt: updatedSpare.updatedAt,
      });
      await updateDoc(doc(db, 'jobs', jobId), {
        sparesUsed: updatedJob.sparesUsed,
        updatedAt: updatedJob.updatedAt,
      });
    } catch (err) {
      console.warn('Firestore update for spare deduction:', err);
    }

    const minLevel = spare.minStockLevel ?? spare.minThreshold ?? 5;
    return {
      success: true,
      remainingQty: newQty,
      isLowStock: newQty <= minLevel,
      partName: spare.partName,
    };
  }

  // Remove Spare from Job (Restock back to inventory)
  static async removeSpareFromJob(
    jobId: string,
    spareId: string,
    spareIndex?: number
  ): Promise<void> {
    const jobs = getLocalData<Job>(LOCAL_STORAGE_KEYS.JOBS, INITIAL_JOBS);
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob || !targetJob.sparesUsed) return;

    let removedItem: UsedSpareItem | undefined;
    let newSparesList: UsedSpareItem[] = [];

    if (spareIndex !== undefined && spareIndex >= 0) {
      removedItem = targetJob.sparesUsed[spareIndex];
      newSparesList = targetJob.sparesUsed.filter((_, idx) => idx !== spareIndex);
    } else {
      const idx = targetJob.sparesUsed.findIndex((s) => s.spareId === spareId);
      if (idx >= 0) {
        removedItem = targetJob.sparesUsed[idx];
        newSparesList = targetJob.sparesUsed.filter((_, i) => i !== idx);
      }
    }

    if (!removedItem) return;

    // Restock the spare
    const inventory = getLocalInventory();
    const spare = inventory.find((i) => i.id === removedItem!.spareId);

    if (spare) {
      const prevQty = spare.quantity;
      const newQty = prevQty + removedItem.quantity;
      const historyEntry: StockHistoryEntry = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'IN',
        quantity: removedItem.quantity,
        previousQty: prevQty,
        newQty,
        referenceJobNumber: targetJob.jobNumber,
        notes: `Restocked/Removed from Job ${targetJob.jobNumber}`,
      };
      const updatedSpare: InventoryItem = {
        ...spare,
        quantity: newQty,
        stockHistory: [historyEntry, ...(spare.stockHistory || [])],
        updatedAt: new Date().toISOString(),
      };
      const updatedInventory = inventory.map((i) => (i.id === spare.id ? updatedSpare : i));
      setLocalData(LOCAL_STORAGE_KEYS.INVENTORY, updatedInventory);

      try {
        await updateDoc(doc(db, 'inventory', spare.id), {
          quantity: newQty,
          stockHistory: updatedSpare.stockHistory,
          updatedAt: updatedSpare.updatedAt,
        });
      } catch (err) {}
    }

    const updatedJob: Job = {
      ...targetJob,
      sparesUsed: newSparesList,
      updatedAt: new Date().toISOString(),
    };
    const updatedJobs = jobs.map((j) => (j.id === jobId ? updatedJob : j));
    setLocalData(LOCAL_STORAGE_KEYS.JOBS, updatedJobs);

    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        sparesUsed: newSparesList,
        updatedAt: updatedJob.updatedAt,
      });
    } catch (err) {}
  }

  // Seed initial data if Firestore is empty
  static async seedInitialData(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;

    try {
      // Check if jobs exist
      const existingSnap = await getDocs(collection(db, 'jobs'));
      if (!existingSnap.empty) {
        return;
      }

      console.log('Seeding initial National Welding Service Center data...');

      for (const tech of INITIAL_TECHNICIANS) {
        await setDoc(doc(db, 'technicians', tech.id), tech);
      }
      for (const cust of INITIAL_CUSTOMERS) {
        await setDoc(doc(db, 'customers', cust.id), cust);
      }
      for (const job of INITIAL_JOBS) {
        await setDoc(doc(db, 'jobs', job.id), job);
      }
      for (const pay of INITIAL_PAYMENTS) {
        await setDoc(doc(db, 'payments', pay.id), pay);
      }
      for (const inv of INITIAL_INVENTORY) {
        await setDoc(doc(db, 'inventory', inv.id), inv);
      }

      console.log('National Welding Service Center data successfully seeded.');
    } catch (e) {
      console.warn('Initial Firestore seed bypass (using robust local offline fallback):', e);
    }
  }
}
