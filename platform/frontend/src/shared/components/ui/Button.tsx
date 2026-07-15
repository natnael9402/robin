'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'lime' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-primary-foreground border-b-4 border-primary-border shadow-[0_4px_0_var(--primary-border)] active:translate-y-[4px] active:shadow-none',
  lime: 'bg-primary hover:bg-primary-hover text-primary-foreground border-b-4 border-primary-border shadow-[0_4px_0_var(--primary-border)] active:translate-y-[4px] active:shadow-none',
  danger: 'bg-destructive hover:bg-destructive-hover text-destructive-foreground border-b-4 border-destructive-border shadow-[0_4px_0_var(--destructive-border)] active:translate-y-[4px] active:shadow-none',
  secondary: 'glass text-foreground hover:border-border-hover',
  ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover',
  outline: 'bg-transparent border border-border text-foreground hover:bg-surface-hover',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg',
  md: 'h-11 px-4 text-sm rounded-xl',
  lg: 'h-13 px-5 text-base rounded-2xl',
  xl: 'h-16 px-6 text-lg rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});
