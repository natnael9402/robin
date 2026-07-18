'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { useTradeBalances } from './hooks/useTradeBalances';
import { useCryptoMarket } from '../market/hooks/useMarket';
import { TradeBalanceCards } from './components/TradeBalanceCards';
import { TradeStatsRow } from './components/TradeStatsRow';
import { RecentTradeRow } from './components/RecentTradeRow';
import { tradesApi } from '../../shared/api';
import { formatCurrency, formatCompact, formatPercent, cn } from '../../shared/lib/utils';
import { Zap, ArrowLeftRight, FileText, ArrowRight, BarChart3, RefreshCw, History } from 'lucide-react';

const MODES = [
  {
    id: 'option',
    label: 'Options',
    sub: 'Binary Option',
    desc: 'Predict direction, earn 15–40% return',
    href: '/trade/option',
    icon: Zap,
    gradient: 'from-primary to-primary-hover',
    glow: 'bg-primary/20',
    accountKey: 'fastTradeBalance' as const,
  },
  {
    id: 'spot',
    label: 'Spot',
    sub: 'Instant Swap',
    desc: 'Buy or sell crypto at market price',
    href: '/trade/spot',
    icon: ArrowLeftRight,
    gradient: 'from-blue-500 to-blue-600',
    glow: 'bg-blue-500/20',
    accountKey: 'spotBalance' as const,
  },
  {
    id: 'contract',
    label: 'Contract',
    sub: 'Leverage',
    desc: 'Up to 125x with take-profit & stop-loss',
    href: '/trade/contract',
    icon: FileText,
    gradient: 'from-purple-500 to-purple-600',
    glow: 'bg-purple-500/20',
    accountKey: 'tradingBalance' as const,
  },
];

export function TradePage() {
  useDocumentTitle('Trade · Paxora Premium');
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const balances = useTradeBalances();
  const crypto = useCryptoMarket();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['trades', 'stats'],
    queryFn: () => tradesApi.getTradeStats(),
    staleTime: 30_000,
  });

  const { data: recentTradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', 'recent-overview'],
    queryFn: () => tradesApi.getUserTrades({ per_page: 5, sort_by: 'created_at', sort_dir: 'desc' }),
    staleTime: 15_000,
  });

  const recentTrades = (recentTradesData as any)?.trades?.data ?? [];

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
      await qc.invalidateQueries({ queryKey: ['trades', 'stats'] });
      await qc.invalidateQueries({ queryKey: ['trades', 'recent-overview'] });
      toast.success('Everything up to date');
    } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  const bal = balances.data;

  return (
    <div className="flex flex-col min-h-screen bg-background pt-14 sm:pt-20 relative overflow-hidden md:max-w-[1600px] md:mx-auto w-full">
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-1/3 h-72 w-72 rounded-full bg-blue-500/8 blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-5 px-4 sm:px-6 pb-28 md:pb-12 md:px-10 xl:px-16">
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface/60 backdrop-blur-xl text-muted-foreground/60 transition-all hover:bg-surface/80 hover:text-foreground disabled:pointer-events-none"
          >
            <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
            <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 's' : ''}`} />
          </button>
        </div>

        {/* Balance Cards */}
        <TradeBalanceCards
          fastTrade={bal?.fastTradeBalance ?? 0}
          spot={bal?.spotBalance ?? 0}
          trading={bal?.tradingBalance ?? 0}
          loading={balances.isLoading}
        />

        {/* Stats Row */}
        <TradeStatsRow stats={stats} loading={statsLoading} />

        {/* Trade Mode Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Trading Modes</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const accountBal = bal?.[mode.accountKey] ?? 0;
              return (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-5 transition-all duration-300',
                    'hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:-translate-y-0.5',
                    'active:scale-[0.98]'
                  )}
                >
                  {/* Glow orb */}
                  <div className={cn('pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-500', mode.glow)} />
                  {/* Top sheen */}
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-b shadow-lg text-black shrink-0', mode.gradient)}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-foreground">{mode.label}</h2>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{mode.sub}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                      {balances.isLoading ? (
                        <div className="h-4 w-24 rounded bg-foreground/5 animate-pulse mt-1.5" />
                      ) : (
                        <p className="text-[11px] font-bold text-primary mt-1.5">
                          ${formatCurrency(accountBal)} available
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Trades */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Recent Trades</span>
            <Link
              href="/profile/trades"
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              Trade History
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl overflow-hidden divide-y divide-white/5">
            {tradesLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-foreground/5 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-foreground/5 animate-pulse" />
                    </div>
                    <div className="h-4 w-12 rounded bg-foreground/5 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentTrades.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">No trades yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Start trading to see your history here</p>
                <Link
                  href="/trade/option"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Start Trading
                </Link>
              </div>
            ) : (
              recentTrades.map((trade: any) => (
                <RecentTradeRow key={trade.id} trade={trade} />
              ))
            )}
          </div>
        </div>

        {/* Market Preview (top 6 crypto) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Markets</span>
            <Link
              href="/market"
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl overflow-hidden divide-y divide-white/5">
            {crypto.isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-foreground/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 rounded bg-foreground/5 animate-pulse" />
                      <div className="h-3 w-12 rounded bg-foreground/5 animate-pulse" />
                    </div>
                    <div className="h-4 w-16 rounded bg-foreground/5 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              (crypto.data ?? []).slice(0, 6).map((item) => {
                const change = item.changePercent;
                const positive = change >= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/market/crypto/${item.id}`)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/60 cursor-pointer"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-9 w-9 rounded-full bg-white object-contain shadow-sm ring-1 ring-border/50" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black text-primary">
                        {item.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{item.symbol}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-bold text-foreground">${formatCurrency(item.price)}</p>
                      <p className={cn(
                        'text-[11px] font-bold',
                        positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {positive ? '+' : '-'}{formatPercent(change)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
