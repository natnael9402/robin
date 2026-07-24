'use client';

import { memo, useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, RefreshCw, Repeat, Eye, EyeOff, Clock, ExternalLink, Zap } from 'lucide-react';
import { formatCurrency, cn } from '../../../shared/lib/utils';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';

interface Props {
  balance: number;
  balances?: { spot: number; trading: number; fast_trade: number; total?: number };
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer?: () => void;
  onRefresh?: () => Promise<unknown>;
  pendingWithdrawal?: boolean;
}

function formatCompact(n: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  });
  return formatter.format(n);
}

const accountCards = [
  { key: 'spot' as const, label: 'Spot' },
  { key: 'trading' as const, label: 'Trading' },
  { key: 'fast_trade' as const, label: 'Options' },
];

function BalanceHeaderBase({ balance, balances, onDeposit, onWithdraw, onTransfer, onRefresh, pendingWithdrawal }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalances, setHideBalances] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('hide_wallet_balances');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hide_wallet_balances', String(hideBalances));
  }, [hideBalances]);

  const masked = hideBalances ? '••••' : null;
  const showFull = balance >= 1_000_000;

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try { await onRefresh(); } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-[28px] border border-glass-border/50 bg-gradient-to-br from-primary to-primary-hover shadow-[0_20px_40px_-12px_var(--primary-glow)]">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
      
      <div className="relative z-10 px-6 pt-6 pb-7">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-[10px] font-bold uppercase tracking-[0.15em]">
            <Wallet className="w-3.5 h-3.5" />
            Total Balance
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHideBalances((v) => !v)}
              aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-primary-foreground/50 transition-all hover:bg-white/10 hover:text-primary-foreground"
            >
              {hideBalances ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh balance"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-primary-foreground/50 transition-all hover:bg-white/10 hover:text-primary-foreground disabled:pointer-events-none"
            >
              <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
              <RefreshCw className={`h-3.5 w-3.5 transition-transform ${refreshing ? 's' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-0.5 mb-5">
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-primary-foreground leading-none break-all">
            {hideBalances ? masked : `$${showFull ? formatCompact(balance) : formatCurrency(balance)}`}
          </div>
          {showFull && !hideBalances && (
            <div className="text-sm font-mono text-primary-foreground/50 tracking-tight mt-1">
              ${formatCurrency(balance)}
            </div>
          )}
        </div>

        {/* Per-account balances */}
        {balances && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {accountCards.map(({ key, label }) => (
              <div key={key} className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-primary-foreground/60 uppercase tracking-wider">{label}</span>
                </div>
                <div className="text-sm font-black font-mono text-primary-foreground tracking-tight">
                  {hideBalances ? masked : `$${formatCompact(balances[key])}`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              onClick={onDeposit}
              className="flex items-center justify-center gap-2 py-2.5 sm:py-2.5 rounded-xl bg-white text-primary font-black tracking-wide text-sm transition-all active:scale-[0.98] shadow-lg hover:bg-white/90"
            >
              <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              disabled={pendingWithdrawal}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-2.5 rounded-xl font-bold border backdrop-blur-md text-sm transition-all active:scale-[0.98] ${
                pendingWithdrawal
                  ? 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              {pendingWithdrawal ? 'Withdraw (Pending)' : 'Withdraw'}
            </button>
          </div>
          <button
            onClick={onTransfer}
            className="flex items-center justify-center gap-2 py-2.5 sm:py-2.5 rounded-xl bg-white/10 text-white font-bold border border-white/20 backdrop-blur-md text-sm transition-all active:scale-[0.98] hover:bg-white/20"
          >
            <ArrowLeftRight className="w-4 h-4" strokeWidth={2.5} />
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

export const BalanceHeader = memo(BalanceHeaderBase);

interface TxRowProps {
  tx: import('../../../shared/types').Transaction;
  onClick: (tx: import('../../../shared/types').Transaction) => void;
}

function TransactionRowBase({ tx, onClick }: TxRowProps) {
  const isDeposit = tx.type === 'deposit';
  const isTransfer = tx.type === 'transfer';

  const icon = isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : isTransfer ? <Repeat className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />;
  const iconBg = isDeposit ? 'bg-success/10 text-success ring-success/20' : isTransfer ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-surface-hover text-foreground ring-border/50';

  return (
    <button
      onClick={() => onClick(tx)}
      className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-surface-hover transition-colors rounded-2xl active:scale-[0.99] text-left"
    >
      <div className="flex items-center gap-4">
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center ring-1 shadow-sm', iconBg)}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-foreground text-[15px] capitalize tracking-tight">{tx.type}</div>
          <div className="text-[12px] font-medium text-muted-foreground mt-0.5">
            {new Date(tx.created_at ?? tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {tx.network ?? (isTransfer ? 'Internal Transfer' : 'Transfer')}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <div className="font-mono font-bold text-foreground text-[15px]">${formatCurrency(tx.amount)}</div>
          <div className="mt-1 flex justify-end">
            <StatusBadge status={tx.status} />
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
      </div>
    </button>
  );
}

export const TransactionRow = memo(TransactionRowBase);

interface PendingWithdrawalCardProps {
  tx: import('../../../shared/types').Transaction;
  onClick?: (tx: import('../../../shared/types').Transaction) => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function PendingWithdrawalCardBase({ tx, onClick }: PendingWithdrawalCardProps) {
  const [elapsed, setElapsed] = useState(() => timeAgo(tx.created_at ?? tx.createdAt));

  useEffect(() => {
    const interval = setInterval(() => setElapsed(timeAgo(tx.created_at ?? tx.createdAt)), 30000);
    return () => clearInterval(interval);
  }, [tx.created_at, tx.createdAt]);

  return (
    <button
      onClick={() => onClick?.(tx)}
      className="w-full relative overflow-hidden rounded-[22px] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 backdrop-blur-xl p-4 text-left transition-all active:scale-[0.99] group"
    >
      {/* Animated glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-amber-400/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-orange-400/10 blur-2xl" />

      <div className="relative z-10">
        {/* Top row: icon + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20">
              <ArrowUpRight className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[13px] font-black text-foreground tracking-tight">Pending Withdrawal</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Processing</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-500/40 group-hover:text-amber-500/70 transition-colors" />
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Amount</div>
            <div className="text-2xl font-black font-mono text-foreground tracking-tight">
              ${formatCurrency(tx.amount)}
            </div>
          </div>
          <div className="text-right">
            {tx.network && (
              <div className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 mb-1">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] font-bold text-muted-foreground">{tx.network}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[11px] font-medium">{elapsed}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export const PendingWithdrawalCard = memo(PendingWithdrawalCardBase);
