import { Job } from '../types';

/**
 * Escapes a cell value for standard CSV format (RFC 4180).
 */
function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If the cell contains quotes, commas, or newlines, escape internal double quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Converts a list of Job records into a well-formatted CSV string and triggers a browser download.
 */
export function exportJobsToCSV(jobs: Job[], filenamePrefix = 'NW_Service_Center_Jobs'): void {
  if (!jobs || jobs.length === 0) {
    alert('No jobs to export.');
    return;
  }

  const headers = [
    'Job Number',
    'Status',
    'Customer Name',
    'Mobile Number',
    'Machine Brand',
    'Machine Model',
    'Machine Type',
    'Serial Number',
    'Problem / Complaint',
    'Received Date',
    'Expected Delivery Date',
    'Repaired Date',
    'Dispatched Date',
    'Repair Cost (INR)',
    'Advance Paid (INR)',
    'Balance Due (INR)',
    'Payment Status',
    'Assigned Technician',
    'Technician Remark',
    'Delivery Remark',
    'Created At',
  ];

  const rows = jobs.map((job) => [
    job.jobNumber,
    job.status,
    job.customerName,
    job.mobileNumber,
    job.machineBrand,
    job.machineModel,
    job.machineType,
    job.serialNumber || 'N/A',
    job.complaint,
    job.receivedDate,
    job.expectedDeliveryDate || 'N/A',
    job.repairedDate || 'N/A',
    job.dispatchedDate || 'N/A',
    job.repairCost || 0,
    job.advancePaid || 0,
    job.balanceAmount || 0,
    job.paymentStatus,
    job.technician || 'Unassigned',
    job.technicianRemark || '',
    job.deliveryRemark || '',
    job.createdAt ? job.createdAt.split('T')[0] : '',
  ]);

  // Build CSV content with UTF-8 Byte Order Mark (\uFEFF) for Excel compatibility
  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCSVCell).join(','), ...rows.map((row) => row.map(escapeCSVCell).join(','))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
