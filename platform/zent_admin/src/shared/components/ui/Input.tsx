'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAdornment,
      rightAdornment,
      fullWidth = false,
      className,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftAdornment && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              {leftAdornment}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'w-full rounded-xl border bg-surface text-foreground placeholder:text-subtle-foreground',
              'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              leftAdornment ? 'pl-10' : 'pl-4',
              rightAdornment ? 'pr-10' : 'pr-4',
              'py-3 text-sm',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              !error && 'border-border-medium hover:border-border-dark',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
              {rightAdornment}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';