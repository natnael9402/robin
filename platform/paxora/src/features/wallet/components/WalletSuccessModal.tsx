'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { formatCurrency } from '../../../shared/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  amount: number;
}

export function WalletSuccessModal({ open, onClose, type, amount }: Props) {
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
