import { Job } from '../types';

/**
 * Generates the status-specific pre-filled WhatsApp message for a customer.
 */
export function generateJobWhatsAppMessage(job: Job): string {
  const customerName = job.customerName || 'Customer';
  const machineDesc = `${job.machineBrand || ''} ${job.machineModel || ''}`.trim() || 'Welding Machine';
  const machineType = job.machineType ? ` (${job.machineType})` : '';
  const complaint = job.complaint || 'General repair/servicing';
  const repairCost = job.repairCost || 0;
  const advancePaid = job.advancePaid || 0;
  const balanceDue = job.balanceAmount || 0;

  switch (job.status) {
    case 'Received':
      return `⚡ *NATIONAL WELDING SERVICE CENTER* ⚡
Dear *${customerName}*,
Your machine has been safely received and registered at our workshop.

📋 *JOB CARD DETAILS:*
• *Job No:* ${job.jobNumber}
• *Machine:* ${machineDesc}${machineType}
• *Reported Problem:* ${complaint}
• *Current Status:* 📥 *RECEIVED (In Queue for Inspection)*
• *Estimated Charges:* ₹${repairCost}
• *Advance Paid:* ₹${advancePaid}
• *Balance Due:* ₹${balanceDue}
• *Ready / Collection Status:* ⏳ Under Inspection (Est: ${job.expectedDeliveryDate || 'Soon'})

Our technician will test the machine circuits/parts and notify you with full details.
📞 NW Service Center: Shop No. 4, Industrial Area
Thank you for your business!`;

    case 'Checking':
    case 'Pending':
    case 'Repairing':
      return `⚡ *NATIONAL WELDING SERVICE CENTER* ⚡
Dear *${customerName}*,
Here is the current repair update for your machine.

📋 *WORKSHOP STATUS UPDATE:*
• *Job No:* ${job.jobNumber}
• *Machine:* ${machineDesc}${machineType}
• *Complaint:* ${complaint}
• *Repair Status:* ⚙️ *${job.status.toUpperCase()}*
${job.technicianRemark ? `• *Technician Note:* ${job.technicianRemark}\n` : ''}• *Repair Charges:* ₹${repairCost}
• *Advance Paid:* ₹${advancePaid}
• *Balance Amount:* ₹${balanceDue}
• *Ready / Collection Status:* 🛠️ Work in Progress by Technician (${job.technician || 'Workshop Team'})

We are servicing and testing components to ensure high quality performance.
📞 NW Service Center: 9876543210`;

    case 'Repaired':
      return `⚡ *NATIONAL WELDING SERVICE CENTER* ⚡
Dear *${customerName}*,
GREAT NEWS! Your machine repair & testing is COMPLETE. It is READY FOR PICKUP! 🎉

📋 *JOB CARD - READY FOR COLLECTION:*
• *Job No:* ${job.jobNumber}
• *Machine:* ${machineDesc}${machineType}
• *Fault Solved:* ${complaint}
• *Repair Status:* ✅ *REPAIRED & FULLY TESTED*
• *Total Repair Charges:* ₹${repairCost}
• *Advance Paid:* ₹${advancePaid}
• *Net Balance Due:* ₹${balanceDue}
• *Ready / Collection Status:* 🟢 *READY FOR IMMEDIATE PICKUP / DELIVERY*

👉 Please bring your Job Slip or show this message during machine collection.
🛡️ 30 Days Testing Warranty on replaced electronic components.
📍 NW Service Center - Shop No. 4, Industrial Area
Thank you!`;

    case 'Dispatched':
      return `⚡ *NATIONAL WELDING SERVICE CENTER* ⚡
Dear *${customerName}*,
Your machine has been successfully DELIVERED / DISPATCHED from our service center.

📋 *DELIVERY & DISPATCH CONFIRMATION:*
• *Job No:* ${job.jobNumber}
• *Machine:* ${machineDesc}${machineType}
• *Repair Status:* 🚚 *DISPATCHED & COMPLETED*
• *Total Charges:* ₹${repairCost}
• *Advance Paid:* ₹${advancePaid}
• *Balance Remaining:* ₹${balanceDue}
• *Ready / Collection Status:* 📦 Handed Over to Customer (${job.dispatchedDate || 'Delivered'})
${job.deliveryRemark ? `• *Delivery Note:* ${job.deliveryRemark}\n` : ''}
Thank you for trusting National Welding Machine Service Center! If you need any assistance, feel free to contact us.`;

    default:
      return `⚡ *NATIONAL WELDING SERVICE CENTER* ⚡
Dear *${customerName}*,
Update on Job *${job.jobNumber}* (${machineDesc}):
• Status: ${job.status}
• Problem: ${complaint}
• Balance: ₹${balanceDue}
• Ready Status: Under process at NW Service Center.`;
  }
}

/**
 * Formats a phone number for the WhatsApp wa.me link.
 */
export function formatWhatsAppPhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits (standard Indian mobile), prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // If already starts with 91 and length 12
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export interface QuotationOptions {
  labourCharges?: number;
  expectedCompletionDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

/**
 * Generates the WhatsApp Quotation message as specified by NW SERVICE CENTER.
 */
export function generateJobQuotationMessage(job: Job, options?: QuotationOptions): string {
  const customerName = job.customerName || 'Customer';
  const machineDesc = `${job.machineBrand || ''} ${job.machineModel || ''}`.trim() || 'Welding Machine';
  const machineType = job.machineType ? ` (${job.machineType})` : '';
  const complaint = job.complaint || 'Repair / inspection needed';

  // Calculate parts and labour
  const parts = job.sparesUsed && job.sparesUsed.length > 0 ? job.sparesUsed : [];
  const partsTotal = parts.reduce((sum, p) => sum + (p.totalPrice || p.quantity * p.unitPrice || 0), 0);
  
  let labourCharges = options?.labourCharges !== undefined ? options.labourCharges : job.labourCharges;
  if (labourCharges === undefined) {
    labourCharges = Math.max(0, (job.repairCost || 0) - partsTotal);
  }

  const totalEstimatedCost = partsTotal + labourCharges;
  const advancePaid = job.advancePaid || 0;
  const balance = Math.max(0, totalEstimatedCost - advancePaid);

  const completionDate = options?.expectedCompletionDate || job.expectedCompletionDate || job.expectedDeliveryDate || 'Within 2-3 business days';
  const deliveryDate = options?.expectedDeliveryDate || job.expectedDeliveryDate || completionDate;
  const notes = options?.notes || job.quotationNotes;

  // Build parts lines
  const partsLines: string[] = [];
  if (parts.length > 0) {
    parts.forEach((p) => {
      const price = p.totalPrice || p.quantity * p.unitPrice || 0;
      partsLines.push(`• ${p.partName}${p.quantity > 1 ? ` (${p.quantity} pcs)` : ''} - ₹${price.toLocaleString()}`);
    });
  }
  partsLines.push(`• Service/Labour Charges - ₹${labourCharges.toLocaleString()}`);

  const serialText = job.serialNumber ? `\nSerial No.: ${job.serialNumber}` : '';
  const notesText = notes ? `\n\nImportant Notes:\n• ${notes}` : '';

  return `🔧 *NW SERVICE CENTER*
National Welding Machine Service Center

Assalamualaikum *${customerName}*,

Your machine has been received for repair.

*Job No.:* ${job.jobNumber}
*Customer Mobile:* ${job.mobileNumber}
*Machine:* ${machineDesc}${machineType}${serialText}
*Received Date:* ${job.receivedDate || 'Today'}
*Complaint:* ${complaint}

*Estimated Repair:*
${partsLines.join('\n')}

*Total Estimated Cost:* ₹${totalEstimatedCost.toLocaleString()}
*Advance Paid:* ₹${advancePaid.toLocaleString()}
*Balance:* ₹${balance.toLocaleString()}

*Expected Repair Completion:*
${completionDate}

*Expected Delivery / Collection:*
${deliveryDate}
${notesText}

Please confirm if we should proceed with the repair.

Thank you,
*NW SERVICE CENTER*
Solapur`;
}

/**
 * Generates the WhatsApp Repair Update message as specified by NW SERVICE CENTER.
 */
export function generateJobRepairUpdateMessage(job: Job): string {
  const customerName = job.customerName || 'Customer';
  const machineDesc = `${job.machineBrand || ''} ${job.machineModel || ''}`.trim() || 'Welding Machine';
  const completionDate = job.expectedCompletionDate || job.expectedDeliveryDate || 'Soon';
  
  // Format human-friendly status string
  let statusText = 'Repair In Progress';
  if (job.status === 'Received') statusText = 'Received & In Queue for Inspection';
  else if (job.status === 'Checking') statusText = 'Circuit Inspection & Diagnostics';
  else if (job.status === 'Repairing') statusText = 'Repair In Progress';
  else if (job.status === 'Repaired') statusText = 'Repaired & Tested (Ready for Pickup)';
  else if (job.status === 'Dispatched') statusText = 'Dispatched / Handed Over';

  const remarkText = job.technicianRemark ? `\nTechnician Note: ${job.technicianRemark}` : '';

  return `🔧 *NW SERVICE CENTER*
National Welding Machine Service Center

Assalamualaikum *${customerName}*,

Update regarding your machine:

*Job No.:* ${job.jobNumber}
*Machine:* ${machineDesc}

*Current Status:* ${statusText}${remarkText}

*Expected Completion:* ${completionDate}

We will inform you once the machine is ready.

Thank you,
*NW SERVICE CENTER*
Solapur`;
}

/**
 * Opens WhatsApp with the customer's mobile number and pre-filled message upon user click.
 */
export function openJobWhatsApp(job: Job): void {
  const cleanPhone = formatWhatsAppPhoneNumber(job.mobileNumber);
  if (!cleanPhone) {
    alert('Customer mobile number is missing or invalid.');
    return;
  }

  const message = generateJobWhatsAppMessage(job);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/**
 * Opens WhatsApp with pre-filled Quotation message.
 */
export function openJobQuotationWhatsApp(job: Job, options?: QuotationOptions): void {
  const cleanPhone = formatWhatsAppPhoneNumber(job.mobileNumber);
  if (!cleanPhone) {
    alert('Customer mobile number is missing or invalid.');
    return;
  }

  const message = generateJobQuotationMessage(job, options);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/**
 * Opens WhatsApp with pre-filled Repair Update message.
 */
export function openJobRepairUpdateWhatsApp(job: Job): void {
  const cleanPhone = formatWhatsAppPhoneNumber(job.mobileNumber);
  if (!cleanPhone) {
    alert('Customer mobile number is missing or invalid.');
    return;
  }

  const message = generateJobRepairUpdateMessage(job);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

