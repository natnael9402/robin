'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useTradeBalances } from './hooks/useTradeBalances';
import { useToast } from '../../shared/contexts/ToastContext';
import { formatCurrency, cn } from '../../shared/lib/utils';
import { Zap, ArrowLeftRight, FileText, Eye, EyeOff, RefreshCw } from 'lucide-react';

const MODES = [
  {
    id: 'spot',
    label: 'Spot',
    desc: 'Buy or sell crypto at market price',
    href: '/trade/spot',
    icon: ArrowLeftRight,
    balKey: 'spotBalance' as const,
  },
  {
    id: 'option',
    label: 'Options',
    desc: 'Predict direction, earn 15-40% return',
    href: '/trade/option',
    icon: Zap,
    balKey: 'fastTradeBalance' as const,
  },
  {
    id: 'contract',
    label: 'Contract',
    desc: 'Up to 125x with take-profit & stop-loss',
    href: '/trade/contract',
    icon: FileText,
    balKey: 'tradingBalance' as const,
  },
];

export function TradePage() {
  useDocumentTitle('Trade · PAXORA');
  const [active, setActive] = useState('option');
  const [hidden, setHidden] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();
  const { data: bal, isLoading: balLoading } = useTradeBalances();

  const activeMode = MODES.find((m) => m.id === active)!;
  const activeBalance = bal?.[activeMode.balKey] ?? 0;
  const Icon = activeMode.icon;

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
      toast.success('Balance updated');
    } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-20 md:max-w-2xl md:mx-auto w-full">
      <div className="flex flex-col gap-6 px-4 sm:px-6 pb-28 md:pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Trade</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your trading hub</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-all hover:bg-surface/80 hover:text-foreground disabled:pointer-events-none"
          >
            <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
            <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 's' : ''}`} />
          </button>
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

        {/* Balance display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {activeMode.label} Balance
            </span>
            <button
              onClick={() => setHidden((h) => !h)}
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {balLoading ? (
            <div className="h-10 w-40 mx-auto rounded-lg bg-foreground/5 animate-pulse" />
          ) : hidden ? (
            <div className="flex items-center justify-center gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="h-3 w-3 rounded-full bg-foreground/30" />
              ))}
            </div>
          ) : (
            <p className="font-mono text-[2.8rem] font-black leading-none tracking-tight tabular-nums">
              ${formatCurrency(activeBalance)}
            </p>
          )}
        </div>

        {/* Start Trading CTA */}
        <Link
          href={activeMode.href}
          className="flex items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-base font-black text-primary-foreground shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <Icon className="h-5 w-5" strokeWidth={2.5} />
          Start {activeMode.label}
        </Link>

        {/* Mode description */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{activeMode.desc}</p>
        </div>
      </div>
    </div>
  );
}
