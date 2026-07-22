'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { tradesApi } from '../../shared/api';
import { Zap, ArrowLeftRight, FileText } from 'lucide-react';
import { cn } from '../../shared/lib/utils';

const MODES = [
  {
    id: 'spot',
    label: 'Spot',
    desc: 'Buy or sell crypto at market price',
    href: '/trade/spot',
    icon: ArrowLeftRight,
  },
  {
    id: 'option',
    label: 'Options',
    desc: 'Predict direction, earn 15-40% return',
    href: '/trade/option',
    icon: Zap,
  },
  {
    id: 'contract',
    label: 'Contract',
    desc: 'Up to 125x with take-profit & stop-loss',
    href: '/trade/contract',
    icon: FileText,
  },
];

export function TradePage() {
  useDocumentTitle('Trade · PAXORA');
  const [active, setActive] = useState('option');

  const { data: stats } = useQuery({
    queryKey: ['trades', 'stats'],
    queryFn: () => tradesApi.getTradeStats(),
    staleTime: 30_000,
  });

  const totalTrades = stats?.overview?.total_trades ?? 0;

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-20 md:max-w-2xl md:mx-auto w-full">
      <div className="flex flex-col gap-6 px-4 sm:px-6 pb-28 md:pb-12">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Trade</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your trading hub</p>
        </div>

        {/* Total trades */}
        <div className="text-center">
          <p className="text-3xl font-black text-foreground tabular-nums">{totalTrades}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mt-1">Total Trades</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActive(mode.id)}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all',
                active === mode.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground bg-surface'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Active mode card */}
        {MODES.filter((m) => m.id === active).map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.id}
              href={mode.href}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-foreground">{mode.label}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
