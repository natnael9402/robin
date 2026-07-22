'use client';

import { Modal } from '../../../shared/components/ui/Modal';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { formatCurrency } from '../../../shared/lib/utils';
import type { Transaction } from '../../../shared/types';
import { ArrowDownLeft, ArrowUpRight, Copy, CheckCircle2, Repeat } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../shared/lib/utils';

export function TransactionDetailsModal({
  tx,
  open,
  onClose,
}: {
  tx: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState(false);

  if (!tx) return null;

  const isDeposit = tx.type === 'deposit';
  const isTransfer = tx.type === 'transfer';

  const icon = isDeposit ? <ArrowDownLeft className="w-8 h-8" /> : isTransfer ? <Repeat className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />;
  const iconBg = isDeposit ? 'bg-success/10 text-success ring-success/5' : isTransfer ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-surface-hover text-foreground ring-border/20';
  const prefix = isDeposit ? '+' : isTransfer ? '' : '-';
  const dateStr = new Date(tx.created_at ?? tx.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(String(tx.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Transaction Details">
      <div className="flex flex-col items-center justify-center pt-4 pb-8 border-b border-border-light">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4',
            iconBg
          )}
        >
          {icon}
        </div>
        <div className="text-3xl font-black font-mono tracking-tighter text-foreground mb-2">
          {prefix}${formatCurrency(tx.amount)}
        </div>
        <StatusBadge status={tx.status} />
      </div>

      <div className="py-6 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Type</span>
          <span className="text-sm font-bold capitalize text-foreground">{tx.type}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Network / Method</span>
          <span className="text-sm font-bold text-foreground">{tx.network ?? 'Transfer'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Date</span>
          <span className="text-sm font-bold text-foreground">{dateStr}</span>
        </div>

        {tx.category && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Category</span>
            <span className="text-sm font-bold text-foreground capitalize">{tx.category}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm font-mono font-bold text-primary hover:text-primary-hover transition-colors"
          >
            #{tx.id}
            {copiedId ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
}
