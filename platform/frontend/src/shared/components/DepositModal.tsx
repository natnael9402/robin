'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { ArrowDownLeft, Copy, Check, Loader2, ShieldAlert, ChevronDown, Gift, X, Banknote, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { depositApi, ApiError, type DepositAddress } from '../api';
import { formatCurrency } from '../lib/utils';
import { useDeposit } from '../../features/wallet/hooks/useWallet';

const keyOf = (a: DepositAddress) => `${a.currency}-${a.network}`;
const labelOf = (a: DepositAddress) => `${a.currency} · ${a.network}`;

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
  prefillAmount?: number;
}

export function DepositModal({ open, onClose, onSuccess, prefillAmount }: DepositModalProps) {
  const [amount, setAmount] = useState(prefillAmount ? String(prefillAmount) : '0.00');
  const [selectedKey, setSelectedKey] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const deposit = useDeposit();
  const toast = useToast();

  useEffect(() => {
    if (open && prefillAmount) {
      setAmount(String(prefillAmount));
    }
  }, [open, prefillAmount]);

  const addressesQuery = useQuery({
    queryKey: ['deposit', 'addresses'],
    queryFn: () => depositApi.getAddresses(),
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const addresses = addressesQuery.data ?? [];
  const kycBlocked = (addressesQuery.error as ApiError | undefined)?.status === 403;

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
      setSuccessAmount(num);
      setShowSuccess(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onSuccess) onSuccess(successAmount);
    onClose();
  };

  const numAmount = Number(amount);

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
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:w-[440px] bg-background/90 backdrop-blur-3xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-[60px]" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-[60px]" />
            </div>

            {showSuccess ? (
              <div className="relative px-6 py-10 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_var(--primary-glow)]">
                  <Check className="w-8 h-8 text-primary" strokeWidth={3} />
                </div>
                <h2 className="text-xl font-black text-foreground mb-1">Deposit Initiated</h2>
                <p className="text-3xl font-black text-primary mb-2 drop-shadow-[0_0_10px_var(--primary-glow)]">
                  ${successAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-[280px] mx-auto">
                  Your deposit is being processed. Funds will appear in your Fast Trade balance shortly.
                </p>
                <button
                  onClick={handleSuccessClose}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-primary to-primary-hover text-black text-sm font-black tracking-wide active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="relative px-5 pt-5 pb-5 max-h-[85vh] overflow-y-auto hide-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_var(--primary-glow)]">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-foreground">Deposit Funds</h2>
                      <p className="text-[10px] text-muted-foreground font-medium">Fund your Fast Trade balance to trade options</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {addressesQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Loading...</p>
                  </div>
                ) : kycBlocked ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <ShieldAlert className="h-10 w-10 text-primary" />
                    <p className="text-sm font-bold text-foreground">Verification required</p>
                    <p className="text-xs text-muted-foreground max-w-[260px]">KYC must be approved before depositing.</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No deposit addresses available right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prefillAmount && (
                      <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <span className="text-primary font-bold">${formatCurrency(prefillAmount)}</span> needed to complete your trade
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Network</label>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full flex items-center justify-between bg-surface/80 border border-white/10 hover:border-primary/30 rounded-2xl px-4 py-3 transition-all relative z-20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                            {selected?.currency ? (
                              <img
                                src={`/icons/crypto/${selected.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`}
                                alt={selected.currency}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                              />
                            ) : null}
                            <span className={`text-[10px] font-black text-primary ${selected?.currency ? 'hidden' : ''}`}>
                              {selected?.currency?.charAt(0) || 'N'}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {selected ? labelOf(selected) : 'Select Network'}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {dropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[200px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                            {addresses.map((a) => {
                              const isSelected = selectedKey === keyOf(a);
                              return (
                                <button
                                  key={keyOf(a)}
                                  type="button"
                                  onClick={() => { setSelectedKey(keyOf(a)); setDropdownOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border ${
                                    isSelected
                                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]'
                                      : 'border-transparent hover:bg-surface-hover'
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border overflow-hidden ${
                                    isSelected
                                      ? 'bg-gradient-to-br from-primary to-primary-hover border-primary'
                                      : 'bg-surface border-border text-muted-foreground'
                                  }`}>
                                    <img
                                      src={`/icons/crypto/${a.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`}
                                      alt={a.currency}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                                    />
                                    <span className="text-[10px] font-black hidden">{a.currency.charAt(0)}</span>
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                      {a.currency}
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{a.network}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {selected && (
                      <div className="relative flex flex-col items-center gap-2 rounded-2xl bg-surface/60 border border-white/10 p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                        <div className="relative rounded-xl bg-white p-2 shadow-[0_0_20px_var(--primary-glow)]">
                          <QRCode value={selected.address} size={90} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Scan to deposit <span className="font-bold text-primary">{selected.currency}</span> on{' '}
                          <span className="font-bold text-primary">{selected.network}</span>
                        </p>
                        <button
                          onClick={copyAddress}
                          className="flex w-full items-center justify-between gap-2 rounded-xl bg-surface border border-white/10 px-3 py-2 text-left transition-colors hover:bg-surface-hover active:scale-[0.98]"
                        >
                          <span className="break-all font-mono text-xs text-foreground truncate">{selected.address}</span>
                          {copied ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-primary font-mono">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-surface/60 border border-white/10 rounded-2xl py-3 pl-9 pr-4 font-mono text-base font-bold text-foreground outline-none focus:border-primary/30 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {numAmount > 0 && (
                      <>
                        {numAmount >= 5000 ? (
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E5C158] via-[#D4AF37] to-[#B8860B] p-[2px] shadow-[0_0_30px_-4px_var(--primary-glow)]">
                            <div className="rounded-[calc(1rem-2px)] bg-gradient-to-br from-[#D4AF37]/[0.12] via-[#E5C158]/[0.06] to-[#B8860B]/[0.12] px-4 py-3 ring-1 ring-inset ring-[#D4AF37]/20">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#E5C158]/20 ring-1 ring-[#D4AF37]/40 shadow-[0_0_12px_var(--primary-glow)]">
                                  <Gift size={16} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-foreground">+${formatCurrency(numAmount * 0.1)} bonus</p>
                                  <p className="text-[10px] font-semibold text-[#D4AF37]">10% on your deposit</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/[0.03] to-transparent px-4 py-2.5">
                            <Gift size={14} className="shrink-0 text-[#D4AF37]/50" />
                            <p className="text-[10px] font-medium text-[#D4AF37]/60">
                              {numAmount > 0
                                ? `Add $${formatCurrency(5000 - numAmount)} more to unlock 10% bonus`
                                : 'Drop $5k+ · Get 10% back'}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">Proof of Deposit</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => setProofImage(e.target.files?.[0] ?? null)}
                          className="hidden"
                          id="deposit-proof"
                        />
                        <label
                          htmlFor="deposit-proof"
                          className="flex items-center justify-center gap-2 w-full bg-surface/60 border border-white/10 border-dashed rounded-2xl py-3 cursor-pointer hover:bg-surface-hover hover:border-primary/30 transition-all active:scale-[0.98]"
                        >
                          {proofImage ? (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-foreground">{proofImage.name}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setProofImage(null); }}
                                className="p-0.5 rounded-full hover:bg-surface-hover text-muted-foreground"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <ArrowDownLeft className="w-3 h-3 text-primary" />
                              </div>
                              <span className="text-xs font-bold text-muted-foreground">Upload payment receipt</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={deposit.isPending || !numAmount || !selected || !proofImage}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-primary to-primary-hover text-black text-sm font-black tracking-wide active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
                    >
                      {deposit.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={4} />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" strokeWidth={3} />
                      )}
                      {deposit.isPending ? 'Processing...' : `Deposit $${formatCurrency(numAmount || 0)}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
