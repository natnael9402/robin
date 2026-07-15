'use client';

import { cn } from '../../lib/utils';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectGridProps<T extends string> {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  className?: string;
}

export function SelectGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
  className,
}: SelectGridProps<T>) {
  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
          {label}
        </label>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'py-2.5 rounded-xl text-sm font-bold border transition-all',
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface text-muted-foreground border-border hover:border-surface-hover'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
