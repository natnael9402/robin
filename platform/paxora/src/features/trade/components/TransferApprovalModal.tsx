'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Banknote, Loader2, Wallet, X } from 'lucide-react';
import { walletApi } from '../../../shared/api';
import { formatCurrency, safeNumber } from '../../../shared/lib/utils';
import { useToast } from '../../../shared/contexts/ToastContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onApproved: () => void;
  onDeposit?: (shortfall: number) => void;
  currentBalance: number;
  requiredAmount: number;
  targetAccount: string;
}

const ACCOUNT_LABELS: Record<string, string> = {
  trading: 'Trading',
  spot: 'Spot',
  fast_trade: 'Binary Option',
};

function getSourceAccount(target: string, balances?: { spot: number; trading: number; fast_trade: number; total: number }): string {
  if (target === 'fast_trade') {
    const spotBal = balances?.spot ?? 0;
    const tradingBal = balances?.trading ?? 0;
    return spotBal >= tradingBal ? 'spot' : 'trading';
  }
  return 'fast_trade';
}

export function TransferApprovalModal({ open, onClose, onApproved, onDeposit, currentBalance, requiredAmount, targetAccount }: Props) {
  const { data: balances } = useQuery({
    queryKey: ['trades', 'balances'],
    queryFn: () => walletApi.getBalances(),
    staleTime: 30_000,
    enabled: open,
  });
  const sourceAccount = getSourceAccount(targetAccount, balances);
  const sourceBalance = safeNumber(balances?.[sourceAccount as keyof typeof balances] ?? 0);
  const shortfall = Math.max(0, requiredAmount - currentBalance);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    setLoading(true);
    try {
      if (targetAccount === 'fast_trade') {
        await walletApi.transferToMain(sourceAccount as 'spot' | 'trading' | 'fast_trade', shortfall);
      } else {
        await walletApi.loadFromMain(targetAccount, shortfall);
      }
      queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(`$${formatCurrency(shortfall)} transferred to ${ACCOUNT_LABELS[targetAccount] || targetAccount}`);
      onApproved();
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-auto sm:min-w-[380px] bg-background border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="relative px-6 pt-5 pb-2">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">Insufficient Balance</h2>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    Your {ACCOUNT_LABELS[targetAccount]} account needs funds
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-2 space-y-3">
              <div className="bg-surface/40 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Balance</span>
                  <span className="text-xs font-black text-destructive font-mono">${formatCurrency(currentBalance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Required</span>
                  <span className="text-xs font-black text-foreground font-mono">${formatCurrency(requiredAmount)}</span>
                </div>
                <div className="h-px bg-white/5 my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shortfall</span>
                  <span className="text-sm font-black text-destructive font-mono">-${formatCurrency(shortfall)}</span>
                </div>
              </div>

              <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-foreground">{ACCOUNT_LABELS[sourceAccount] || sourceAccount}</span>
                  <span className="text-xs font-black text-primary font-mono">${formatCurrency(sourceBalance)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-medium">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Transfer <span className="font-bold text-foreground">${formatCurrency(shortfall)}</span> to {ACCOUNT_LABELS[targetAccount]}</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-1 space-y-2">
              {sourceBalance >= shortfall ? (
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-primary to-primary-hover text-black text-sm font-black tracking-wide active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={4} />
                  ) : (
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  )}
                  {loading ? 'Transferring...' : `Approve & Transfer $${formatCurrency(shortfall)}`}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-destructive font-bold text-center">
                    {ACCOUNT_LABELS[sourceAccount]} account only has ${formatCurrency(sourceBalance)} — ${formatCurrency(shortfall - sourceBalance)} short
                  </p>
                  <button
                    onClick={() => { onDeposit?.(shortfall); onClose(); }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-b from-primary to-primary-hover text-black text-sm font-black tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                  >
                    <Banknote className="h-4 w-4" strokeWidth={3} />
                    Deposit ${formatCurrency(shortfall)}
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
