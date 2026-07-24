'use client';

import { Clock, ArrowUpRight, Zap } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { formatCurrency } from '../../../shared/lib/utils';
import type { Transaction } from '../../../shared/types';

interface Props {
  open: boolean;
  onClose: () => void;
  tx: Transaction | null;
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

export function PendingWithdrawalModal({ open, onClose, tx }: Props) {
  if (!tx) return null;

  return (
    <Modal open={open} onClose={onClose} size="md" title="Pending Withdrawal">
      <div className="flex flex-col items-center text-center py-10 min-h-[364px] justify-center">
        {/* Animated pending icon */}
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse scale-150" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/30">
            <ArrowUpRight className="h-9 w-9 text-amber-500" strokeWidth={2} />
          </div>
          {/* Pulsing dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
          </span>
        </div>

        <div className="text-muted-foreground text-base mb-2">Your withdrawal of</div>
        <div className="text-4xl font-black font-mono text-foreground mb-4">
          ${formatCurrency(tx.amount)}
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
          {tx.network && (
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span className="font-medium">{tx.network}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{timeAgo(tx.created_at ?? tx.createdAt)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-4 max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Processing</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your withdrawal request is being processed. Please wait for it to complete before submitting a new one.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full max-w-sm rounded-xl bg-foreground/5 border border-border py-3 text-sm font-bold text-foreground hover:bg-foreground/10 transition-all active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}
