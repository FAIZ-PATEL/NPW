import React from 'react';
import { RepairApprovalStatus } from '../types';
import { Clock, Send, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalBadgeProps {
  status?: RepairApprovalStatus;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onSelect?: (status: RepairApprovalStatus) => void;
}

export const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({
  status = 'Waiting for Approval',
  size = 'md',
  interactive = false,
  onSelect,
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Customer Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-100',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          text: 'Approved by Customer',
          shortText: 'Approved',
        };
      case 'Customer Not Approved':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-100',
          dot: 'bg-rose-500',
          icon: XCircle,
          text: 'Not Approved',
          shortText: 'Rejected',
        };
      case 'Quotation Sent':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300 ring-sky-100',
          dot: 'bg-sky-500',
          icon: Send,
          text: 'Quotation Sent',
          shortText: 'Quote Sent',
        };
      case 'Waiting for Approval':
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-100',
          dot: 'bg-amber-500',
          icon: Clock,
          text: 'Waiting for Approval',
          shortText: 'Waiting',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs transition-all ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{size === 'sm' ? config.shortText : config.text}</span>
    </span>
  );
};
