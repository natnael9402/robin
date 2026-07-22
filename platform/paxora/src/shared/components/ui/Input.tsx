'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  wrapperClassName?: string;
}

export function Input({ label, hint, error, leftAdornment, rightAdornment, wrapperClassName, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 bg-background border rounded-2xl px-3.5 py-2.5 transition-all duration-200',
          error
            ? 'border-destructive/50 focus-within:border-destructive focus-within:ring-4 focus-within:ring-destructive/10'
            : 'border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15'
        )}
      >
        {leftAdornment && <span className="text-muted-foreground shrink-0">{leftAdornment}</span>}
        <input
          id={inputId}
          className={cn(
            'bg-transparent w-full focus:outline-none text-foreground text-base font-mono font-bold placeholder-muted-foreground/60',
            className
          )}
          {...rest}
        />
        {rightAdornment && <span className="text-muted-foreground shrink-0">{rightAdornment}</span>}
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
    </div>
  );
}
