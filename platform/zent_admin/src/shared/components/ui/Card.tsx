'use client';

import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  bordered = true,
  elevated = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl shadow-glass',
        bordered ? 'border border-glass-border' : 'border-0',
        elevated && 'shadow-glass-lg',
        hover && 'transition-all duration-300 ease-out hover:shadow-glass-lg hover:-translate-y-1 cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: ReactNode;
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h3 className="font-bold text-lg text-foreground">{children}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border-light flex items-center gap-2', className)}>
      {children}
    </div>
  );
}