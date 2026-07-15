'use client';

import { cn } from '../../lib/utils';

type Status = 'pending' | 'approved' | 'completed' | 'rejected' | 'repaid' | 'overdue' | 'active' | 'ended' | string;

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-primary/10 text-primary',
  completed: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  repaid: 'bg-primary/10 text-primary',
  overdue: 'bg-destructive/10 text-destructive',
  active: 'bg-primary/10 text-primary',
  paused: 'bg-warning/10 text-warning',
  ended: 'bg-surface text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const lower = (status ?? 'pending').toLowerCase();
  const style = statusStyles[lower] ?? 'bg-surface text-muted-foreground';
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
