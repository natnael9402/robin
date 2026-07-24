'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { formatCurrency } from '../../../shared/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: number;
  pending?: boolean;
}

export function WalletSuccessModal({ open, onClose, type, amount, pending }: Props) {
  if (pending) {
    return (
      <Modal open={open} onClose={onClose} size="md" title="Pending Withdrawal">
        <div className="flex flex-col items-center text-center py-16 min-h-[364px] justify-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse scale-150" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/30">
              <Clock className="h-9 w-9 text-amber-500" strokeWidth={2} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
            </span>
          </div>
          <div className="text-muted-foreground text-base mb-2">Your withdrawal of</div>
          <div className="text-4xl font-black font-mono text-foreground mb-4">${formatCurrency(amount)}</div>
          <div className="text-sm text-muted-foreground max-w-sm">You already have a pending withdrawal request. Please wait for it to be processed before submitting a new one.</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title={type === 'deposit' ? 'Deposit Initiated' : 'Withdrawal Submitted'}>
      <div className="flex flex-col items-center text-center py-16 min-h-[364px] justify-center">
        <CheckCircle2 className="w-20 h-20 mb-4 text-primary" strokeWidth={1.5} />
        <div className="text-muted-foreground text-base mb-2">Your {type} of</div>
        <div className="text-4xl font-black font-mono text-foreground mb-4">${formatCurrency(amount)}</div>
        <div className="text-sm text-muted-foreground max-w-sm">It may take a few minutes for the transaction to reflect in your balance.</div>
      </div>
    </Modal>
  );
}
