'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { ArrowDownLeft, Copy, Check, Loader2, ShieldAlert, ChevronDown, Gift } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { SelectGrid } from '../../../shared/components/ui/SelectGrid';
import { FileUpload } from '../../../shared/components/ui/FileUpload';
import { useToast } from '../../../shared/contexts/ToastContext';
import { depositApi, ApiError, type DepositAddress } from '../../../shared/api';
import { useDeposit } from '../hooks/useWallet';

const keyOf = (a: DepositAddress) => `${a.currency}-${a.network}`;
const labelOf = (a: DepositAddress) => `${a.currency} · ${a.network}`;

export function DepositModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('0.00');
  const [selectedKey, setSelectedKey] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const deposit = useDeposit();
  const toast = useToast();

  const addressesQuery = useQuery({
    queryKey: ['deposit', 'addresses'],
    queryFn: () => depositApi.getAddresses(),
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const addresses = addressesQuery.data ?? [];
  const kycBlocked = (addressesQuery.error as ApiError | undefined)?.status === 403;

  // Default to the first available address once loaded.
  useEffect(() => {
    if (addresses.length && !addresses.some((a) => keyOf(a) === selectedKey)) {
      setSelectedKey(keyOf(addresses[0]));
    }
  }, [addresses, selectedKey]);

  const selected = useMemo(
    () => addresses.find((a) => keyOf(a) === selectedKey),
    [addresses, selectedKey],
  );

  const copyAddress = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy address');
    }
  };

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('Enter a valid amount');
    if (!selected) return toast.error('Select a network');
    if (!proofImage) return toast.error('Please upload proof of deposit');
    try {
      await deposit.mutateAsync({ amount: num, network: labelOf(selected), proofImage });
      setProofImage(null);
      if (onSuccess) onSuccess(num);
      else onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title="Deposit to Fast Trade">
      {addressesQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading deposit addresses…</p>
        </div>
      ) : kycBlocked ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-10 w-10 text-primary" />
          <p className="text-base font-bold text-foreground">Verification required</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Your KYC must be approved before you can view deposit addresses.
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No deposit addresses are available right now. Please check back soon.
        </div>
      ) : (
        <div className="space-y-4 px-1 pb-4">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Select Network</label>
            
            {/* Custom Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between bg-background/80 border border-primary/20 hover:border-primary/40 hover:bg-background/90 rounded-2xl px-4 py-3.5 transition-all shadow-inner relative z-20 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_10px_var(--primary-glow)] overflow-hidden">
                  {selected?.currency ? (
                    <img 
                      src={`/icons/crypto/${selected.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                      alt={selected.currency}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <span className={`text-[10px] font-black text-primary ${selected?.currency ? 'hidden' : ''}`}>{selected?.currency.charAt(0) || 'N'}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{selected ? labelOf(selected) : 'Select Network'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[220px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                  {addresses.map((a) => {
                    const isSelected = selectedKey === keyOf(a);
                    return (
                      <button
                        key={keyOf(a)}
                        type="button"
                        onClick={() => {
                          setSelectedKey(keyOf(a));
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'border-transparent hover:bg-surface-hover hover:border-border-light'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${isSelected ? 'bg-gradient-to-br from-primary to-primary-hover text-black border-primary' : 'bg-surface border-border text-muted-foreground'}`}>
                          <img 
                            src={`/icons/crypto/${a.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                            alt={a.currency}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                          />
                          <span className="text-xs font-black hidden">{a.currency.charAt(0)}</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-foreground'}`}>{a.currency}</span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{a.network}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary ml-auto drop-shadow-[0_0_5px_var(--primary-glow)]" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {selected && (
            <div className="relative flex flex-col items-center gap-3 rounded-[24px] bg-background/80 border border-border/20 p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <div className="relative rounded-2xl bg-white p-2 shadow-[0_0_20px_var(--primary-glow)]">
                <QRCode value={selected.address} size={110} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Scan to deposit <span className="font-bold text-primary">{selected.currency}</span> on{' '}
                <span className="font-bold text-primary">{selected.network}</span>
              </p>
              <button
                onClick={copyAddress}
                className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface border border-border/20 px-3 py-2 text-left transition-colors hover:bg-surface-hover active:scale-[0.98]"
              >
                <span className="break-all font-mono text-xs text-foreground truncate">{selected.address}</span>
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-primary drop-shadow-[0_0_5px_var(--primary-glow)]" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            </div>
          )}

          <Input
            label="Amount"
            type="number"
            value={amount}
            leftAdornment={<span className="font-mono font-bold text-primary">$</span>}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Bonus banner */}
          {(() => {
            const num = Number(amount);
            if (num >= 5000) {
              const bonus = num * 0.1;
              return (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB] p-[2px] shadow-[0_0_40px_-4px_var(--primary-glow)]">
                  <div className="rounded-[calc(1rem-2px)] bg-gradient-to-br from-[#3B82F6]/[0.15] via-[#60A5FA]/[0.08] to-[#2563EB]/[0.15] px-4 py-3.5 ring-1 ring-inset ring-[#3B82F6]/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/30 to-[#60A5FA]/20 ring-1 ring-[#3B82F6]/40 shadow-[0_0_12px_var(--primary-glow)]">
                        <Gift size={18} className="text-primary drop-shadow-[0_0_8px_var(--primary-glow)]" />
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground drop-shadow-[0_0_12px_var(--primary-glow)]">+${bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bonus</p>
                        <p className="text-[11px] font-semibold text-[#3B82F6]">10% on your deposit — on us</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (num > 0) {
              const needed = 5000 - num;
              return (
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#3B82F6]/30 bg-gradient-to-r from-[#3B82F6]/[0.05] to-transparent px-4 py-2.5">
                  <Gift size={14} className="shrink-0 text-[#3B82F6]/60" />
                  <p className="text-[11px] font-medium text-[#3B82F6]/70">Add ${needed.toLocaleString('en-US', { minimumFractionDigits: 2 })} more to unlock 10% bonus</p>
                </div>
              );
            }
            return (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#3B82F6]/30 bg-gradient-to-r from-[#3B82F6]/[0.05] to-transparent px-4 py-2.5">
                <Gift size={14} className="shrink-0 text-[#3B82F6]/60" />
                <p className="text-[11px] font-medium text-[#3B82F6]/70">Drop $5k+ · Get 10% back</p>
              </div>
            );
          })()}

          <FileUpload label="Proof of Deposit" value={proofImage} onChange={setProofImage} />
          
          <div className="pt-2">
            <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} loading={deposit.isPending} className="shadow-[0_0_20px_var(--primary-glow)]">
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Confirm Deposit
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
