'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  name?: string;
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Option[];
  iconComponent?: React.ComponentType<{ country: string; flags?: any }>;
  flags?: any;
  tabIndex?: number;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, options, iconComponent: Icon, flags }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const filtered = useMemo(
    () =>
      options?.filter(
        (o) =>
          o.label.replace(/\s\+\d[\d\s-]*$/, '').toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase()),
      ) ?? [],
    [options, search],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center gap-0.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        {Icon && value && <Icon country={value} flags={flags} />}
        <ChevronDown className={`h-2.5 w-2.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 z-50 w-[280px] bg-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full text-xs font-medium text-foreground outline-none placeholder-muted-foreground/60"
                placeholder="Search country..."
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground font-medium">No countries found</div>
              ) : (
                filtered.map((opt, i) => (
                  <button
                    key={opt.value || i}
                    type="button"
                    onClick={() => { onChange?.(opt.value); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/5 ${
                      opt.value === value ? 'bg-primary/10' : ''
                    }`}
                  >
                    {Icon && <Icon country={opt.value} flags={flags} />}
                    <span className="text-xs font-semibold text-foreground flex-1 text-left">{opt.label.replace(/\s\+\d[\d\s-]*$/, '')}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
