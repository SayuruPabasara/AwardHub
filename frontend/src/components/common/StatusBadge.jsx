import React from 'react';
import { getStatusStyle } from '../../utils/formatters';

export default function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${sizeClasses} ${getStatusStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
