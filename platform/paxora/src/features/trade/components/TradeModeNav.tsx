'use client';

import Link from 'next/link';
import { cn } from '../../../shared/lib/utils';

type Mode = 'option' | 'spot' | 'contract';

const labels: Record<Mode, string> = {
  option: 'Options',
  spot: 'Spot',
  contract: 'Contract',
};

interface Props {
  active: Mode;
}

export function TradeModeNav({ active }: Props) {
  return (
    <div className="flex gap-1 bg-surface/60 p-1 rounded-[12px] border border-white/5 w-full max-w-sm mx-auto">
      {(Object.keys(labels) as Mode[]).map((m) => (
        <Link
          key={m}
          href={`/trade/${m === 'option' ? 'option' : m}`}
          className={cn(
            'flex-1 py-1.5 rounded-[10px] text-[10px] font-black transition-all duration-300 text-center uppercase tracking-wider',
            active === m
              ? 'bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
          )}
        >
          {labels[m]}
        </Link>
      ))}
    </div>
  );
}
