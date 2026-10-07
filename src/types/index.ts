export type JobStatus = 'Received' | 'Pending' | 'Checking' | 'Repairing' | 'Repaired' | 'Dispatched';

export type RepairApprovalStatus =
  | 'Waiting for Approval'
  | 'Quotation Sent'
  | 'Customer Approved'
  | 'Customer Not Approved';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export interface UsedSpareItem {
  spareId: string;
  partName: string;
  partNumber?: string;
  category?: string;
  quantity: number;
  unitPrice: number; // Selling price per unit
  totalPrice: number;
  deductedAt?: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  mobileNumber: string;
  machineBrand: string;
  machineModel: string;
  machineType: string;
  serialNumber: string;
  complaint: string;
  machinePhoto?: string;
  receivedDate: string; // YYYY-MM-DD
  expectedDeliveryDate: string; // YYYY-MM-DD
  repairedDate?: string;
  dispatchedDate?: string;
  status: JobStatus;
  repairCost: number;
  advancePaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  technician: string;
  technicianRemark?: string;
  deliveryRemark?: string;
  approvalStatus?: RepairApprovalStatus;
  labourCharges?: number;
  quotationNotes?: string;
  expectedCompletionDate?: string;
  sparesUsed?: UsedSpareItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  totalJobs: number;
  totalSpent: number;
  pendingBalance: number;
  address?: string;
  createdAt: string;
  lastJobDate?: string;
}

export interface Payment {
  id: string;
  jobId: string;
  jobNumber: string;
  customerName: string;
  amount: number;
  paymentType: 'Advance' | 'Final' | 'Partial';
  paymentMode: PaymentMode;
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  active: boolean;
  completedJobsCount?: number;
}

export interface StockHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD HH:mm:ss
  type: 'IN' | 'OUT' | 'JOB_USE' | 'ADJUSTMENT';
  quantity: number; // positive number changed
  previousQty: number;
  newQty: number;
  referenceJobNumber?: string;
  referenceCustomerName?: string;
  supplier?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  partName: string;
  partNumber: string;
  category: string;
  quantity: number;
  unitPrice: number; // Selling price
  purchasePrice?: number;
  sellingPrice?: number;
  minThreshold: number; // Minimum stock level
  minStockLevel?: number;
  supplier?: string;
  stockHistory?: StockHistoryEntry[];
  updatedAt?: string;
}

