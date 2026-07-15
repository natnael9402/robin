'use client';

import { cn } from '@/shared/lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'button' | 'circular';
  className?: string;
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  variant = 'text',
  className,
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded';

  const variantStyles = {
    text: 'h-4',
    card: 'rounded-2xl',
    table: '',
    avatar: 'rounded-full',
    button: 'rounded-xl',
    circular: 'rounded-full',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, variantStyles.text)}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{
        width: width || (variant === 'avatar' ? '40px' : variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'avatar' ? '40px' : variant === 'circular' ? '40px' : '16px'),
        minWidth: variant === 'button' ? '80px' : undefined,
      }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border-light bg-surface p-6 space-y-4', className)}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="button" width="100px" />
        <Skeleton variant="button" width="100px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-2xl border border-border-light bg-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light">
        <Skeleton variant="text" width="30%" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-hover">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton variant="text" width="80%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-t border-border-light">
                {Array.from({ length: columns }).map((_, col) => (
                  <td key={col} className="px-6 py-3">
                    <Skeleton variant="text" width="90%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 3, rowClassName = 'h-20' }: { rows?: number; rowClassName?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn('rounded-xl', rowClassName)} />
      ))}
    </div>
  );
}