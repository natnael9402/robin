'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, children, hover, glow, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl',
        hover && 'hover:border-border-hover transition-all cursor-pointer active:scale-[0.98]',
        glow && 'primary-glow',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4 border-b border-border-light', className)} {...rest}>{children}</div>;
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...rest}>{children}</div>;
}
