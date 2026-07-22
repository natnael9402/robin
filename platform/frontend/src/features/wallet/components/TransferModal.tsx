'use client';

import { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Check, Loader2, RefreshCw } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { useTransfer, useWalletData } from '../hooks/useWallet';
import { formatCurrency } from '../../../shared/lib/utils';
import type { BalancesResponse } from '../hooks/useWallet';

const ACCOUNT_LABELS: Record<string, string> = {
  spot: 'Spot',
  trading: 'Trading',
  fast_trade: 'Fast Trade',
};

const ACCOUNT_ICONS: Record<string, string> = {
  spot: 'S',
  trading: 'T',
  fast_trade: 'F',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferModal({ open, onClose, onSuccess }: Props) {
  const [from, setFrom] = useState<string>('spot');
  const [to, setTo] = useState<string>('trading');
  const [amount, setAmount] = useState('0.00');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const transfer = useTransfer();
  const toast = useToast();
  const { data, refetch, isRefetching } = useWalletData();

  const balances = data?.balances ?? { spot: 0, trading: 0, fast_trade: 0, total: 0 };
  const fromBalance = balances[from as keyof typeof balances] ?? 0;
  const fromAccountTypes = ['spot', 'trading', 'fast_trade'];
  const toAccountTypes = ['spot', 'trading', 'fast_trade'];

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('Enter a valid amount');
    if (num > fromBalance) return toast.error('Insufficient balance');
    try {
      if (from === to) return toast.error('Cannot transfer to the same account');
      await transfer.mutateAsync({ from: from as 'spot' | 'trading' | 'fast_trade', to: to as 'spot' | 'trading' | 'fast_trade', amount: num });
      setAmount('0.00');
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const renderDropdown = (
    value: string,
    onChange: (v: string) => void,
    open: boolean,
    setOpen: (v: boolean) => void,
    exclude?: string,
    options?: string[],
  ) => {
    const opts = options ?? fromAccountTypes;
    const available = opts.filter((t) => t !== exclude);
    return (
      <div className="space-y-2 relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-background/80 border border-primary/20 hover:border-primary/40 hover:bg-background/90 rounded-2xl px-4 py-3.5 transition-all shadow-inner relative z-20 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black text-xs font-black shadow-[0_0_10px_var(--primary-glow)]">
              {ACCOUNT_ICONS[value]}
            </div>
            <span className="text-sm font-bold text-foreground">{ACCOUNT_LABELS[value]}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[220px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
              {available.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'border-transparent hover:bg-surface-hover hover:border-border-light'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black text-xs font-black shadow-[0_0_10px_var(--primary-glow)]">
                        {ACCOUNT_ICONS[opt]}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-foreground'}`}>
                          {ACCOUNT_LABELS[opt]}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {formatCurrency(balances[opt as keyof typeof balances] ?? 0)}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary ml-auto drop-shadow-[0_0_5px_var(--primary-glow)]" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title="Transfer Between Accounts">
      <div className="space-y-5 px-1 pb-4">
        <div className="flex items-center justify-end -mt-2 mb-1">
          <button
            onClick={async () => {
              await refetch();
              toast.success('Everything up to date');
            }}
            disabled={isRefetching}
            className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">From</label>
          {renderDropdown(from, setFrom, fromOpen, setFromOpen, undefined, fromAccountTypes)}
          {fromBalance !== undefined && (
            <p className="text-[11px] text-muted-foreground mt-1.5 px-2">
              Available: <span className="font-bold text-foreground">{formatCurrency(fromBalance)}</span>
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-[0_0_15px_var(--primary-glow)]">
            <ArrowLeftRight className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">To</label>
          {renderDropdown(to, setTo, toOpen, setToOpen, from, toAccountTypes)}
        </div>

        <Input
          label="Amount"
          type="number"
          value={amount}
          leftAdornment={<span className="font-mono font-bold text-primary">$</span>}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="pt-2">
          <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={transfer.isPending} className="shadow-[0_0_20px_var(--primary-glow)]">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
