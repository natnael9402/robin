import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, trend, className }: StatCardProps) {
  return (
    <div className={cn('p-4 rounded-2xl glass', className)}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
        {label}
      </div>
      {typeof value === 'string' ? (
        <div
          className={cn(
            'text-2xl font-black font-mono',
            trend === 'up' && 'text-primary',
            trend === 'down' && 'text-destructive',
            !trend && 'text-foreground'
          )}
        >
          {value}
        </div>
      ) : (
        value
      )}
    </div>
  );
}
