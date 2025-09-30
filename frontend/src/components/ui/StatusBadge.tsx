import React from 'react';

interface StatusBadgeProps {
  status: 'ativa' | 'expirada' | string;
  className?: string;
}

const COLORS: Record<string, string> = {
  ativa: 'text-green-600 bg-green-50',
  expirada: 'text-red-600 bg-red-50',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();
  const color = COLORS[normalized] || 'text-gray-600 bg-gray-100';
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center ${color} ${className}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  );
};

export default StatusBadge;
