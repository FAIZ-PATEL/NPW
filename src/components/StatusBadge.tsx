import React from 'react';
import { JobStatus } from '../types';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  let bgClass = 'bg-orange-500 text-white';
  let dotClass = 'bg-white';
  let label = status;

  switch (status) {
    case 'Received':
      bgClass = 'bg-orange-500 text-white shadow-sm shadow-orange-200';
      dotClass = 'bg-white animate-pulse';
      break;
    case 'Pending':
      bgClass = 'bg-red-500 text-white shadow-sm shadow-red-200';
      dotClass = 'bg-white';
      break;
    case 'Checking':
      bgClass = 'bg-amber-600 text-white shadow-sm shadow-amber-200';
      dotClass = 'bg-amber-200';
      break;
    case 'Repairing':
      bgClass = 'bg-indigo-600 text-white shadow-sm shadow-indigo-200';
      dotClass = 'bg-indigo-200 animate-pulse';
      break;
    case 'Repaired':
      bgClass = 'bg-green-600 text-white shadow-sm shadow-green-200';
      dotClass = 'bg-white';
      break;
    case 'Dispatched':
      bgClass = 'bg-blue-600 text-white shadow-sm shadow-blue-200';
      dotClass = 'bg-white';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold rounded-md',
    md: 'text-xs px-2.5 py-1 font-bold rounded-full',
    lg: 'text-sm px-3.5 py-1.5 font-bold rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase tracking-wide font-mono ${sizeClasses[size]} ${bgClass}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {label}
    </span>
  );
};
