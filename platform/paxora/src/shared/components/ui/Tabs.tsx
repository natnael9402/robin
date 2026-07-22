'use client';

import { cn } from '../../lib/utils';

interface TabsProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs<T extends string>({ value, options, onChange, fullWidth, size = 'md', className }: TabsProps<T>) {
  return (
    <div className={cn('flex bg-surface rounded-[16px] p-1 overflow-x-auto hide-scrollbar border border-border-light shadow-sm', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-[12px] font-bold transition-all whitespace-nowrap',
            size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-3 py-2 text-xs md:px-6 md:text-sm',
            fullWidth && 'flex-1',
            value === opt.value ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover/50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
