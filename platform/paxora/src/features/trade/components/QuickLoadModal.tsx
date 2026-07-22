'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { walletApi } from '../../../shared/api';
import { formatCurrency } from '../../../shared/lib/utils';

const ACCOUNT_LABELS: Record<string, string> = {
  spot: 'Spot',
  trading: 'Trading',
  fast_trade: 'Binary Option',
};

const ACCOUNT_ICONS: Record<string, string> = {
  spot: 'S',
  trading: 'T',
  fast_trade: 'F',
};

interface Props {
  open: boolean;
  onClose: () => void;
  targetAccount: 'spot' | 'trading' | 'fast_trade';
  balances: { spot: number; trading: number; fast_trade: number };
  onSuccess?: () => void;
}

export function QuickLoadModal({ open, onClose, targetAccount, balances, onSuccess }: Props) {
  const accountTypes = useMemo(() => ['spot', 'trading', 'fast_trade'], []);
  const sourceAccounts = useMemo(() => {
    const accounts: string[] = [];
    accountTypes.forEach((t) => {
      if (t !== targetAccount && (balances[t as keyof typeof balances] ?? 0) > 0) {
        accounts.push(t);
      }
    });
    return accounts;
  }, [accountTypes, targetAccount, balances]);
  const [from, setFrom] = useState<string>('');
  const [fromOpen, setFromOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setAmount('');
      setFromOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && sourceAccounts.length > 0) {
      setFrom(sourceAccounts[0]);
    }
  }, [open, sourceAccounts]);

  const fromBalance = from
    ? (balances[from as keyof typeof balances] ?? 0)
    : 0;
  const numAmount = Number(amount) || 0;

  const handlePreset = (pct: number) => {
    const val = fromBalance * (pct / 100);
    setAmount(val.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!from) { toast.error('Select a source account'); return; }
    if (!numAmount || numAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (numAmount > fromBalance) { toast.error('Insufficient balance'); return; }
    setLoading(true);
    try {
      await walletApi.transfer({
        from: from as 'spot' | 'trading' | 'fast_trade',
        to: targetAccount,
        amount: numAmount,
      });
      queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
      toast.success(`$${formatCurrency(numAmount)} loaded to ${ACCOUNT_LABELS[targetAccount]}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title={`Load ${ACCOUNT_LABELS[targetAccount]}`}>
      <div className="space-y-4 px-1 pb-4">
        <div className="rounded-xl bg-background/60 border border-white/5 p-3 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Balance</div>
          <div className="text-2xl font-black text-foreground font-mono mt-1">
            ${formatCurrency(balances[targetAccount] ?? 0)}
          </div>
        </div>

        {sourceAccounts.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground font-medium">
            No other accounts with funds available.
          </div>
        ) : (
          <>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">From</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFromOpen(!fromOpen)}
                  className="w-full flex items-center justify-between bg-background/80 border border-primary/20 hover:border-primary/40 rounded-2xl px-4 py-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black text-xs font-black">
                      {ACCOUNT_ICONS[from || sourceAccounts[0]]}
                    </div>
                    <span className="text-sm font-bold text-foreground">{ACCOUNT_LABELS[from || sourceAccounts[0]]}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${fromOpen ? 'rotate-180' : ''}`} />
                </button>

                {fromOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFromOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl z-30 max-h-[220px] overflow-y-auto">
                      {sourceAccounts.map((opt) => {
                        const bal = balances[opt as keyof typeof balances] ?? 0;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setFrom(opt); setFromOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all border border-transparent hover:bg-surface-hover"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black text-xs font-black">
                                {ACCOUNT_ICONS[opt]}
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-black text-foreground">{ACCOUNT_LABELS[opt]}</span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">${formatCurrency(bal)}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              {fromBalance > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
                  Available: <span className="font-bold text-foreground">${formatCurrency(fromBalance)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background/60 border border-white/5 rounded-2xl py-3 pl-8 pr-4 font-mono text-lg font-bold text-foreground outline-none focus:border-primary/30 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePreset(pct)}
                    className="flex-1 py-1.5 rounded-lg bg-background/40 text-muted-foreground hover:text-foreground text-[10px] font-black transition-all border border-white/5"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              loading={loading}
              disabled={!from || numAmount <= 0}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer ${formatCurrency(numAmount || 0)}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
