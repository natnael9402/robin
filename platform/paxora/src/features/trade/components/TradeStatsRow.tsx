'use client';

import { memo } from 'react';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import { formatCurrency, formatCompact, cn } from '../../../shared/lib/utils';
import type { TradeStats } from '../../../shared/types';

interface Props {
  stats: TradeStats | null | undefined;
  loading?: boolean;
}

function StatCard({ label, value, sub, icon: Icon, color, loading }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-4 transition-all duration-300 hover:border-white/20">
      <div className={cn('pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-[30px] opacity-40', color)} />
      <div className="relative z-10">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mb-2.5', color.replace('bg-', 'bg-').replace('/20', '/15'))}>
          <Icon className="w-3.5 h-3.5 text-foreground/70" strokeWidth={2.5} />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-16 rounded bg-foreground/5 animate-pulse" />
        ) : (
          <p className="font-mono text-xl font-black text-foreground tabular-nums leading-tight">{value}</p>
        )}
        {sub && !loading && (
          <p className="text-[10px] font-medium text-muted-foreground mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}

function TradeStatsRowBase({ stats, loading }: Props) {
  const o = stats?.overview;
  const pnl = o?.total_pnl ?? 0;
  const winRate = o?.win_rate ?? 0;
  const totalTrades = o?.total_trades ?? 0;
  const closedTrades = o?.closed_trades ?? 0;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        label="Total P&L"
        value={`${pnl >= 0 ? '+' : ''}$${formatCompact(Math.abs(pnl))}`}
        sub={o ? `$${formatCompact(o.total_invested)} invested` : undefined}
        icon={TrendingUp}
        color={pnl >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}
        loading={loading}
      />
      <StatCard
        label="Trades"
        value={String(totalTrades)}
        sub={closedTrades > 0 ? `${closedTrades} closed` : o?.open_trades ? `${o.open_trades} open` : undefined}
        icon={BarChart3}
        color="bg-blue-500/20"
        loading={loading}
      />
      <StatCard
        label="Win Rate"
        value={`${formatCompact(winRate)}%`}
        sub={o ? `${o.won_trades ?? 0}W / ${o.lost_trades ?? 0}L` : undefined}
        icon={Target}
        color={winRate >= 50 ? 'bg-emerald-500/20' : 'bg-red-500/20'}
        loading={loading}
      />
    </div>
  );
}

export const TradeStatsRow = memo(TradeStatsRowBase);
