'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { useWithdraw } from '../hooks/useWallet';

const NETWORKS = ['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)'];

export function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('0.00');
  const [network, setNetwork] = useState('BTC');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');

  const toast = useToast();
  const withdraw = useWithdraw();

  useEffect(() => {
    if (!open) {
      setAmount('0.00');
      setNetwork('BTC');
      setAddress('');
      setDropdownOpen(false);
    }
  }, [open]);

  const handleSubmitWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('Enter a valid amount');
    if (!address.trim()) return toast.error('Enter wallet address');
    try {
      await withdraw.mutateAsync({ amount: num, network, walletAddress: address });
      setAddress('');
      if (onSuccess) onSuccess(num);
      else onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title="Withdraw">
      <div className="space-y-4">
        <Input
          label="Amount"
          type="number"
          value={amount}
          leftAdornment={<span className="text-foreground font-mono font-bold">$</span>}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Select Network</label>
          
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-background/80 border border-primary/20 hover:border-primary/40 hover:bg-background/90 rounded-2xl px-4 py-3.5 transition-all shadow-inner relative z-20 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_10px_var(--primary-glow)] overflow-hidden">
                <img 
                  src={`/icons/crypto/${network.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                  alt={network}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                />
                <span className="text-[10px] font-black text-primary hidden">{network.charAt(0)}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{network}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[220px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                {NETWORKS.map((n) => {
                  const isSelected = network === n;
                  const currency = n.split(' ')[0];
                  const subnetwork = n.includes('(') ? n.split('(')[1].replace(')', '') : currency;
                  
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { setNetwork(n); setDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'border-transparent hover:bg-surface-hover hover:border-border-light'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${isSelected ? 'bg-gradient-to-br from-primary to-primary-hover text-black border-primary' : 'bg-surface border-border text-muted-foreground'}`}>
                        <img 
                          src={`/icons/crypto/${currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                          alt={currency}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                        />
                        <span className="text-xs font-black hidden">{currency.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-foreground'}`}>{currency}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{subnetwork}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary ml-auto drop-shadow-[0_0_5px_var(--primary-glow)]" />}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
        <Input
          label="Wallet Address"
          placeholder="bc1q... or 0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button variant="primary" size="lg" fullWidth onClick={handleSubmitWithdraw} loading={withdraw.isPending}>
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Confirm Withdrawal
        </Button>
      </div>
    </Modal>
  );
}
