'use client';

import { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, BarChart3, Filter, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useTradeHistory } from './hooks/useTradeHistory';
import { Modal } from '../../shared/components/ui/Modal';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { cn, formatCurrency, formatCompact } from '../../shared/lib/utils';
import type { Trade } from '../../shared/types';

const TYPE_TABS = [
  { key: '', label: 'All' },
  { key: 'option', label: 'Options' },
  { key: 'contract', label: 'Contracts' },
  { key: 'spot', label: 'Spot' },
  { key: 'stock', label: 'Stocks' },
] as const;

const FILTER_PILLS = [
  { key: 'status', value: '', label: 'All' },
  { key: 'status', value: 'closed', label: 'Closed' },
  { key: 'status', value: 'open', label: 'Open' },
  { key: 'status', value: 'canceled', label: 'Canceled' },
] as const;

function StatCard({ label, value, sub, positive, gold, mono, expanded, onClick }: {
  label: string; value: string; sub?: string; positive?: boolean; gold?: boolean; mono?: boolean;
  expanded?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-border bg-surface p-4 text-left transition-all duration-300 min-w-0',
        'hover:bg-surface-hover active:scale-[0.98]',
        expanded ? 'flex-[3]' : 'flex-1',
      )}
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground truncate">{label}</p>
        <div className={cn(
          'flex items-baseline gap-1.5 transition-all duration-300',
          expanded ? 'flex-col' : 'flex-row',
        )}>
          <p className={cn(
            'font-black truncate',
            expanded ? 'text-2xl' : 'text-lg',
            mono && 'font-mono',
            gold ? 'text-[#D4AF37]' : positive === true ? 'text-green-600 dark:text-green-400' : positive === false ? 'text-red-600 dark:text-red-400' : 'text-foreground',
          )}>
            {value}
          </p>
          {sub && (
            <p className={cn(
              'text-xs font-medium text-muted-foreground truncate transition-all duration-300',
              expanded ? 'opacity-100' : 'opacity-0 hidden sm:block sm:opacity-70',
            )}>
              {sub}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function TradeTypeBadge({ type }: { type: Trade['type'] }) {
  const colors: Record<string, string> = {
    option: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    contract: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
    spot: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    stock: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
  };
  return (
    <span className={cn(
      'rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
      colors[type] ?? 'bg-foreground/10 text-muted-foreground border-border',
    )}>
      {type}
    </span>
  );
}

function TradeRow({ trade, onClick }: { trade: Trade; onClick: () => void }) {
  const isWin = trade.result === 'won';
  const isLoss = trade.result === 'lost';
  const isOpen = trade.status === 'open';
  const isCanceled = trade.status === 'canceled';

  const borderColor = isWin
    ? 'border-l-green-500'
    : isLoss
      ? 'border-l-red-500'
      : isOpen
        ? 'border-l-amber-500'
        : 'border-l-border';
  const pnlColor = isWin ? 'text-green-600 dark:text-green-400' : isLoss ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground';
  const pnlSign = isWin ? '+' : isLoss ? '-' : '';

  const subtype = trade.type === 'option' && trade.option
    ? `${trade.option.duration}s`
    : trade.type === 'contract' && trade.contract
      ? `${trade.contract.leverage}x`
      : trade.type === 'spot' && trade.spot
        ? `${trade.spot.from_coin ?? ''}→${trade.spot.to_coin ?? ''}`
        : '';

  const date = new Date(trade.closed_at ?? trade.opened_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full border-l-[4px] bg-surface/40 pl-4 pr-4 py-4 rounded-r-2xl transition-all',
        'hover:bg-surface-hover active:scale-[0.99] text-left',
        'shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none',
        borderColor,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-black text-foreground truncate">{trade.symbol.replace('USDT', '/USDT')}</span>
            <TradeTypeBadge type={trade.type} />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              'flex items-center gap-1 text-xs font-bold',
              trade.direction === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            )}>
              {trade.direction === 'buy' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trade.direction === 'buy' ? 'Buy' : 'Sell'}
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground truncate">{date}</span>
            {subtype && <><span className="h-3 w-px bg-border" /><span className="text-[11px] font-medium text-muted-foreground shrink-0">{subtype}</span></>}
          </div>
        </div>

        <div className="shrink-0 text-right">
          {isOpen ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-warning">
              <Clock className="h-3.5 w-3.5" />
              Open
            </div>
          ) : isCanceled ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" />
              Canceled
            </div>
          ) : (
            <div className={cn('text-base font-black font-mono', pnlColor)}>
              {pnlSign}${formatCompact(Math.abs(trade.pnl))}
            </div>
          )}
          {!isCanceled && !isOpen && (
            <div className="mt-1.5 flex items-center justify-end gap-1">
              <StatusBadge status={trade.result === 'won' ? 'approved' : 'rejected'} />
            </div>
          )}
          {!isOpen && !isCanceled && (
            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
              ${formatCompact(trade.amount)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function formatDurationSec(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function TradeDetailModal({ trade, open, onClose }: { trade: Trade | null; open: boolean; onClose: () => void }) {
  if (!trade) return null;

  const isWin = trade.result === 'won';
  const isLoss = trade.result === 'lost';
  const isClosed = trade.status === 'closed';
  const pnlSign = isWin ? '+' : isLoss ? '-' : '';
  const pnlColor = isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-muted-foreground';
  const barColor = isWin ? 'bg-green-500' : isLoss ? 'bg-red-500' : 'bg-muted-foreground';
  const pnlNum = Number.isFinite(trade.pnl) ? trade.pnl : 0;
  const pnlPercent = trade.amount > 0 ? ((pnlNum / trade.amount) * 100) : 0;

  const opened = new Date(trade.opened_at);
  const closed = trade.closed_at ? new Date(trade.closed_at) : null;
  const durationMs = closed ? closed.getTime() - opened.getTime() : 0;
  const durationSec = Math.floor(durationMs / 1000);

  const priceChange = trade.exit_price && trade.entry_price ? trade.exit_price - trade.entry_price : null;
  const priceChangePercent = trade.exit_price && trade.entry_price ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 : null;

  const symbolLabel = trade.symbol.replace('USDT', '/USDT');

  const openedStr = opened.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const closedStr = closed?.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Modal open={open} onClose={onClose} size="md" title={symbolLabel}>
      <div className="space-y-4 p-1">
        {/* Hero section */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{ background: isWin ? '#22c55e' : isLoss ? '#ef4444' : '#64748b' }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black',
                  trade.direction === 'buy'
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400',
                )}>
                  {trade.direction === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-foreground">{symbolLabel}</span>
                    <TradeTypeBadge type={trade.type} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <span className="capitalize">{trade.direction}</span>
                    <span className="h-3 w-px bg-border" />
                    <StatusBadge status={isClosed ? (isWin ? 'approved' : 'rejected') : trade.status === 'open' ? 'pending' : 'rejected'} />
                    <span className="h-3 w-px bg-border" />
                    <span className="font-mono">${formatCompact(trade.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            {isClosed && (
              <div className="mt-4 flex items-baseline gap-3">
                <span className={cn('text-3xl font-black font-mono tracking-tight', pnlColor)}>
                  {pnlSign}${formatCompact(Math.abs(trade.pnl))}
                </span>
                <span className={cn('text-sm font-bold', pnlColor)}>
                  {pnlSign}{formatCompact(Math.abs(pnlPercent))}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PnL bar */}
        {isClosed && (
          <div className="relative h-2 overflow-hidden rounded-full bg-foreground/5">
            <div
              className={cn('absolute inset-y-0 rounded-full transition-all duration-500', barColor)}
              style={{ width: `${Math.min(Math.abs(pnlPercent) * 2, 100)}%` }}
            />
          </div>
        )}

        {/* Key columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2.5">
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Investment</p>
            <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <p className="font-mono text-sm font-black text-foreground">${formatCompact(trade.amount)}</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Fee</p>
            <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <p className="font-mono text-sm font-black text-muted-foreground">-${formatCompact(trade.fee)}</p>
            </div>
          </div>
        </div>

        {/* Price section */}
        <div>
          <p className="mb-2.5 text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Price</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Entry</p>
              <p className="mt-0.5 font-mono text-sm font-black text-foreground">${formatCurrency(trade.entry_price, 6)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Exit</p>
              <p className="mt-0.5 font-mono text-sm font-black text-foreground">
                {trade.exit_price ? `$${formatCurrency(trade.exit_price, 6)}` : '—'}
              </p>
            </div>
            {priceChange !== null && (
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Change</p>
                <p className={cn('mt-0.5 font-mono text-sm font-black', priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {priceChange >= 0 ? '+' : ''}${formatCurrency(Math.abs(priceChange), 6)}
                </p>
              </div>
            )}
            {priceChangePercent !== null && (
              <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Change %</p>
                <p className={cn('mt-0.5 font-mono text-sm font-black', priceChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                  {priceChangePercent >= 0 ? '+' : ''}{formatCompact(Math.abs(priceChangePercent))}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Type-specific details */}
        {trade.type === 'option' && trade.option && (
          <div>
            <p className="mb-2.5 text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Option Details</p>
            <div className="grid grid-cols-3 gap-2.5">
              <MiniBox label="Duration" value={formatDurationSec(trade.option.duration)} />
              <MiniBox label="Return Rate" value={`${trade.option.return_rate}%`} />
              <MiniBox label="Expected" value={`$${formatCompact(trade.option.expected_return)}`} />
            </div>
          </div>
        )}

        {trade.type === 'contract' && trade.contract && (
          <div>
            <p className="mb-2.5 text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Contract Details</p>
            <div className="grid grid-cols-3 gap-2.5">
              <MiniBox label="Leverage" value={`${trade.contract.leverage}x`} />
              <MiniBox label="Quantity" value={formatCurrency(trade.contract.quantity, 4)} />
              <MiniBox label="Liquidation" value={`$${formatCurrency(trade.contract.liquidation_price, 4)}`} />
              {trade.contract.take_profit ? <MiniBox label="Take Profit" value={`$${formatCurrency(trade.contract.take_profit, 4)}`} /> : null}
              {trade.contract.stop_loss ? <MiniBox label="Stop Loss" value={`$${formatCurrency(trade.contract.stop_loss, 4)}`} /> : null}
            </div>
          </div>
        )}

        {trade.type === 'spot' && trade.spot && (
          <div>
            <p className="mb-2.5 text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Spot Details</p>
            <div className="grid grid-cols-2 gap-2.5">
              <MiniBox label="Quantity" value={formatCurrency(trade.spot.quantity, 6)} />
              <MiniBox label="Market Price" value={`$${formatCurrency(trade.spot.market_price, 4)}`} />
              {trade.spot.from_coin && trade.spot.to_coin ? (
                <MiniBox label="Pair" value={`${trade.spot.from_coin} → ${trade.spot.to_coin}`} />
              ) : null}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h4 className="mb-3 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Timeline</h4>
          <div className="space-y-0">
            <TLDot icon={<Clock className="h-2.5 w-2.5" />} label="Opened" time={openedStr} first />
            {closedStr && (
              <TLDot
                icon={isWin ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                label={trade.status === 'canceled' ? 'Canceled' : 'Closed'}
                time={closedStr}
                color={isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-muted-foreground'}
                last
              />
            )}
            {durationSec > 0 && (
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-mono font-medium text-muted-foreground">{formatDurationSec(durationSec)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-2.5 py-2">
      <p className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-[12px] font-bold text-foreground truncate">{value}</p>
    </div>
  );
}

function TLDot({ icon, label, time, color, first, last }: {
  icon: React.ReactNode; label: string; time: string; color?: string; first?: boolean; last?: boolean;
}) {
  return (
    <div className="relative flex items-start gap-3 pb-4">
      {!last && (
        <div className="absolute left-[11px] top-5 bottom-0 w-px bg-border" />
      )}
      <div className={cn(
        'relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        color ?? 'border-border text-muted-foreground',
        first && 'border-green-500/30 bg-green-500/10 text-green-500',
      )}>
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between pt-0.5">
        <span className={cn('text-[11px] font-bold', color ?? (first ? 'text-green-600 dark:text-green-400' : 'text-foreground/70'))}>
          {label}
        </span>
        <span className="text-[10px] font-mono font-medium text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}

export function TradeHistoryPage() {
  useDocumentTitle('Trade History · Paxora Capital');
  const router = useRouter();
  const { trades, pagination, stats, isLoading, isStatsLoading, filters, setFilter, setPage } = useTradeHistory();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  const statsCards = [
    { label: 'Total Trades', value: isStatsLoading ? '...' : formatCompact(stats?.overview.total_trades ?? 0), sub: isStatsLoading ? '' : `${stats?.overview.closed_trades ?? 0} closed` },
    { label: 'ROI', value: isStatsLoading ? '...' : `${formatCompact(stats?.overview.roi ?? 0)}%`, sub: isStatsLoading ? '' : `${formatCompact(stats?.overview.win_rate ?? 0)}% win rate`, gold: true },
    { label: 'Net P&L', value: isStatsLoading ? '...' : `${(stats?.overview.total_pnl ?? 0) >= 0 ? '+' : ''}$${formatCompact(Math.abs(stats?.overview.total_pnl ?? 0))}`, sub: isStatsLoading ? '' : `${formatCompact(stats?.overview.total_invested ?? 0)} invested`, positive: (stats?.overview.total_pnl ?? 0) >= 0, mono: true },
  ];

  return (
    <div className="px-4 pt-[72px] pb-28 md:pt-20 md:max-w-3xl md:mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface transition-colors hover:bg-surface-hover"
        >
          <ArrowLeft className="h-4 w-4 text-foreground/70" />
        </button>
        <h1 className="text-lg font-black text-foreground">Trade History</h1>
      </div>

      {/* Stats row */}
      <div className="flex gap-2.5">
        {statsCards.map((card, i) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            sub={card.sub}
            gold={(card as any).gold}
            positive={(card as any).positive}
            mono={(card as any).mono}
            expanded={expandedStat === i}
            onClick={() => setExpandedStat(expandedStat === i ? null : i)}
          />
        ))}
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter('type', tab.key)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
              filters.type === tab.key
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shadow-[0_0_12px_rgba(212,175,55,0.1)]'
                : 'bg-surface text-foreground/60 border border-border hover:bg-surface-hover hover:text-foreground/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter pills row */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {FILTER_PILLS.map((pill) => (
          <button
            key={`${pill.key}-${pill.value}`}
            onClick={() => setFilter(pill.key as 'status', pill.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all',
              filters.status === pill.value
                ? 'bg-foreground/10 text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground/70',
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Trade list */}
      <div className="space-y-2.5">
        {isLoading ? (
          <SkeletonList rows={5} />
        ) : trades.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-8 w-8" />}
            title="No trades yet"
            description="Your trade history will appear here once you start trading."
          />
        ) : (
          trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} onClick={() => setSelectedTrade(trade)} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-4 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setPage(Math.max(1, pagination.current_page - 1))}
            disabled={pagination.current_page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold text-foreground/60 transition-colors hover:bg-surface-hover disabled:opacity-30"
          >
            ‹
          </button>
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all',
                page === pagination.current_page
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'border border-border bg-surface text-foreground/60 hover:bg-surface-hover',
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(pagination.last_page, pagination.current_page + 1))}
            disabled={pagination.current_page >= pagination.last_page}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-sm font-bold text-foreground/60 transition-colors hover:bg-surface-hover disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}

      <TradeDetailModal trade={selectedTrade} open={!!selectedTrade} onClose={() => setSelectedTrade(null)} />
    </div>
  );
}
