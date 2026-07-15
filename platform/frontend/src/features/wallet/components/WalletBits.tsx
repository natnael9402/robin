'use client';

import { memo, useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, RefreshCw, Repeat, Eye, EyeOff } from 'lucide-react';
import { formatCurrency, cn } from '../../../shared/lib/utils';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';

interface Props {
  balance: number;
  balances?: { spot: number; trading: number; fast_trade: number; total?: number };
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer?: () => void;
  onRefresh?: () => Promise<unknown>;
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

function BalanceHeaderBase({ balance, balances, onDeposit, onWithdraw, onTransfer, onRefresh }: Props) {
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
              className="flex items-center justify-center gap-2 py-2.5 sm:py-2.5 rounded-xl bg-white/10 text-white font-bold border border-white/20 backdrop-blur-md text-sm transition-all active:scale-[0.98] hover:bg-white/20"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              Withdraw
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
