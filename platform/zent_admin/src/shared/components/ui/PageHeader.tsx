'use client';

import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  divider?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  action,
  badge,
  className,
  divider = false,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6', divider && 'pb-4 border-b border-border-light', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {badge && (
            <div className="mt-2">{badge}</div>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 mt-4 sm:mt-0">{action}</div>
        )}
      </div>
    </header>
  );
}

export interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4', className)}>
      <div>
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}