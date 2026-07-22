'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Clock, XCircle } from 'lucide-react';
import { formatCompact, cn } from '../../../shared/lib/utils';
import type { Trade } from '../../../shared/types';

interface Props {
  trade: Trade;
}

const TYPE_COLORS: Record<string, string> = {
  option: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  contract: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  spot: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  stock: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
};

function RecentTradeRowBase({ trade }: Props) {
  const isWin = trade.result === 'won';
  const isLoss = trade.result === 'lost';
  const isOpen = trade.status === 'open';
  const isCanceled = trade.status === 'canceled';

  const borderColor = isWin
    ? 'border-l-emerald-500'
    : isLoss
      ? 'border-l-red-500'
      : isOpen
        ? 'border-l-amber-500'
        : 'border-l-border';

  const pnlColor = isWin
    ? 'text-emerald-600 dark:text-emerald-400'
    : isLoss
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  const subtype = trade.type === 'option' && trade.option
    ? `${trade.option.duration}s`
    : trade.type === 'contract' && trade.contract
      ? `${trade.contract.leverage}x`
      : trade.type === 'spot' && trade.spot
        ? `${trade.spot.from_coin ?? ''}→${trade.spot.to_coin ?? ''}`
        : '';

  return (
    <div className={cn(
      'flex items-center gap-3 border-l-[3px] bg-surface/30 rounded-r-xl px-3.5 py-3 transition-all duration-200',
      'hover:bg-surface/60',
      borderColor,
    )}>
      {/* Symbol + direction */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-foreground truncate">{trade.symbol.replace('USDT', '/USDT')}</span>
          <span className={cn('rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider', TYPE_COLORS[trade.type] ?? 'bg-foreground/10 text-muted-foreground')}>
            {trade.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={cn(
            'flex items-center gap-0.5 text-[11px] font-bold',
            trade.direction === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
          )}>
            {trade.direction === 'buy' ? <TrendingUp className="h-3 w-3" strokeWidth={3} /> : <TrendingDown className="h-3 w-3" strokeWidth={3} />}
            {trade.direction === 'buy' ? 'LONG' : 'SHORT'}
          </span>
          {subtype && (
            <>
              <span className="h-3 w-px bg-border" />
              <span className="text-[10px] font-medium text-muted-foreground">{subtype}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <span className="text-xs font-bold text-muted-foreground font-mono">${formatCompact(trade.amount)}</span>
      </div>

      {/* P&L / Status */}
      <div className="shrink-0 w-20 text-right">
        {isOpen ? (
          <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Open
          </span>
        ) : isCanceled ? (
          <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-muted-foreground">
            <XCircle className="h-3 w-3" />
            Canceled
          </span>
        ) : (
          <span className={cn('font-mono text-sm font-black', pnlColor)}>
            {isWin ? '+' : isLoss ? '-' : ''}${formatCompact(Math.abs(trade.pnl))}
          </span>
        )}
      </div>
    </div>
  );
}

export const RecentTradeRow = memo(RecentTradeRowBase);
