'use client';

import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export type StatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'ended'
  | 'paid'
  | 'verified'
  | 'admin'
  | 'user'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'info'
  | 'success'
  | 'warning';

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  children?: ReactNode;
  dot?: boolean;
}

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-warning-muted text-warning border border-warning/30',
  approved: 'bg-success-muted text-success border border-success/30',
  rejected: 'bg-destructive-muted text-destructive border border-destructive/30',
  active: 'bg-primary-muted text-primary border border-primary/30',
  ended: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-border-light',
  paid: 'bg-info-muted text-info border border-info/30',
  verified: 'bg-success-muted text-success border border-success/30',
  admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
  user: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-border-light',
  processing: 'bg-info-muted text-info border border-info/30',
  completed: 'bg-success-muted text-success border border-success/30',
  failed: 'bg-destructive-muted text-destructive border border-destructive/30',
  cancelled: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-border-light',
  info: 'bg-info-muted text-info border border-info/30',
  success: 'bg-success-muted text-success border border-success/30',
  warning: 'bg-warning-muted text-warning border border-warning/30',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[10px] gap-1',
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
};

const dotColors: Record<StatusType, string> = {
  pending: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-destructive',
  active: 'bg-primary',
  ended: 'bg-zinc-400',
  paid: 'bg-info',
  verified: 'bg-success',
  admin: 'bg-purple-500',
  user: 'bg-zinc-400',
  processing: 'bg-info',
  completed: 'bg-success',
  failed: 'bg-destructive',
  cancelled: 'bg-zinc-400',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
};

const statusLabels: Record<StatusType, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  active: 'Active',
  ended: 'Ended',
  paid: 'Paid',
  verified: 'Verified',
  admin: 'Admin',
  user: 'User',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
};

export function StatusBadge({
  status,
  size = 'sm',
  className,
  children,
  dot = false,
}: StatusBadgeProps) {
  const label = children || statusLabels[status] || capitalize(status);

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider rounded-full border',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[status])} />}
      {label}
    </span>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function StatusDot({ status, size = 'sm' }: { status: StatusType; size?: 'xs' | 'sm' | 'md' }) {
  const dotSize = { xs: 'w-1 h-1', sm: 'w-2 h-2', md: 'w-3 h-3' };
  return (
    <span
      className={cn('rounded-full', dotColors[status], dotSize[size])}
      title={statusLabels[status]}
    />
  );
}