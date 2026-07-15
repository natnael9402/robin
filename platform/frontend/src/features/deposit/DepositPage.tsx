'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { X, ArrowDownLeft, Copy, Check, Loader2, ShieldAlert, ChevronDown, CheckCircle2, ArrowRight, Gift } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { DepositMotionGraphic } from './components/DepositMotionGraphic';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { CameraUpload } from '../../shared/components/ui/CameraUpload';
import { useToast } from '../../shared/contexts/ToastContext';
import { depositApi, walletApi, ApiError, type DepositAddress } from '../../shared/api';

const keyOf = (a: DepositAddress) => `${a.currency}-${a.network}`;
const labelOf = (a: DepositAddress) => `${a.currency} · ${a.network}`;

function useDepositMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, network, proofImage }: { amount: number; network: string; proofImage?: File }) =>
      walletApi.deposit(amount, network, proofImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function DepositPage() {
  useDocumentTitle('Make a Deposit · Paxora');
  const router = useRouter();
  const toast = useToast();

  const [amount, setAmount] = useState('0.00');
  const [selectedKey, setSelectedKey] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [successAmount, setSuccessAmount] = useState<number | null>(null);

  const deposit = useDepositMutation();

  const addressesQuery = useQuery({
    queryKey: ['deposit', 'addresses'],
    queryFn: () => depositApi.getAddresses(),
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
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleGoHome = () => {
    router.push('/home');
  };

  // Auto-redirect after deposit success
  useEffect(() => {
    if (successAmount !== null) {
      const timer = setTimeout(() => router.push('/home'), 3000);
      return () => clearTimeout(timer);
    }
  }, [successAmount, router]);

  // ——— SUCCESS VIEW ———
  if (successAmount !== null) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-3 sm:px-4 py-3">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-black/95 border border-primary/20 p-5 sm:p-6 shadow-[0_15px_40px_-15px_var(--primary-glow)] text-center">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10 flex justify-center mb-2">
              <DepositMotionGraphic />
            </div>

            <div className="relative z-10">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_var(--primary-glow)]">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-black text-white mb-0.5 tracking-tight">Deposit Initiated</h2>
              <p className="text-2xl font-black text-primary mb-1 tracking-tight drop-shadow-[0_0_10px_var(--primary-glow)]">
                ${successAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-white/60 mb-4 max-w-[260px] mx-auto leading-relaxed">
                Your deposit is being processed. It may take a few minutes to appear in your Fast Trade balance.
              </p>
              <Button variant="primary" size="md" fullWidth onClick={handleGoHome} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ——— MAIN VIEW ———
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-3 sm:px-4 py-3 relative">
      {/* X button */}
      <button
        onClick={handleGoHome}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all z-10"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-black/95 border border-primary/20 p-4 sm:p-6 shadow-[0_15px_40px_-15px_var(--primary-glow)]">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

          {/* Motion graphic */}
          <div className="relative z-10 flex justify-center">
            <DepositMotionGraphic />
          </div>

          {/* Loading */}
          {addressesQuery.isLoading ? (
            <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-xs">Loading deposit addresses...</p>
            </div>
          ) : kycBlocked ? (
            <div className="relative z-10 flex flex-col items-center gap-2 py-4 text-center">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <p className="text-sm font-bold text-white">Verification required</p>
              <p className="max-w-xs text-[11px] text-white/60">
                Your KYC must be approved before you can deposit.
              </p>
              <Button variant="primary" size="sm" onClick={handleGoHome} className="mt-1">
                Back to Home
              </Button>
            </div>
          ) : addresses.length === 0 ? (
            <div className="relative z-10 py-6 text-center text-xs text-white/60">
              No deposit addresses are available right now. Please check back soon.
            </div>
          ) : (
            /* ——— Deposit form ——— */
            <div className="relative z-10 space-y-3">
              <div className="text-center mb-0.5">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Make a Deposit</h2>
                <p className="text-[11px] text-white/60">Fund your Fast Trade balance to start trading options</p>
              </div>

              {/* Network selector */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Network</label>

                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/10 hover:border-primary/30 hover:bg-white/[0.06] rounded-2xl px-3.5 py-2.5 transition-all relative z-20 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_10px_var(--primary-glow)] overflow-hidden">
                      {selected?.currency ? (
                        <img
                          src={`/icons/crypto/${selected.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`}
                          alt={selected.currency}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                        />
                      ) : null}
                      <span className={`text-[9px] font-black text-primary ${selected?.currency ? 'hidden' : ''}`}>{selected?.currency?.charAt(0) || 'N'}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{selected ? labelOf(selected) : 'Select Network'}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-black/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[220px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
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
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'border-transparent hover:bg-white/[0.05] hover:border-white/10'}`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border overflow-hidden ${isSelected ? 'bg-gradient-to-br from-primary to-primary-hover text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                                <img
                                  src={`/icons/crypto/${a.currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`}
                                  alt={a.currency}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                                />
                                <span className="text-[10px] font-black hidden">{a.currency.charAt(0)}</span>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-white'}`}>{a.currency}</span>
                                <span className="text-[9px] font-medium text-white/40 uppercase tracking-wider">{a.network}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-auto drop-shadow-[0_0_5px_var(--primary-glow)]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

              {/* QR + address */}
              {selected && (
                <div className="relative flex flex-col items-center gap-2 rounded-[20px] bg-white/[0.03] border border-white/10 p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent pointer-events-none" />
                  <div className="relative rounded-xl bg-white p-1.5 shadow-[0_0_20px_var(--primary-glow)]">
                    <QRCode value={selected.address} size={80} />
                  </div>
                  <p className="text-[10px] text-white/60">
                    Scan to deposit <span className="font-bold text-primary">{selected.currency}</span> on{' '}
                    <span className="font-bold text-primary">{selected.network}</span>
                  </p>
                  <button
                    onClick={copyAddress}
                    className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    <span className="break-all font-mono text-[10px] text-white/80 truncate">{selected.address}</span>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary drop-shadow-[0_0_5px_var(--primary-glow)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    )}
                  </button>
                </div>
              )}

              {/* Amount */}
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
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E5C158] via-[#D4AF37] to-[#B8860B] p-[2px] shadow-[0_0_40px_-4px_var(--primary-glow)]">
                      <div className="rounded-[calc(1rem-2px)] bg-gradient-to-br from-[#D4AF37]/[0.15] via-[#E5C158]/[0.08] to-[#B8860B]/[0.15] px-4 py-3.5 ring-1 ring-inset ring-[#D4AF37]/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#E5C158]/20 ring-1 ring-[#D4AF37]/40 shadow-[0_0_12px_var(--primary-glow)]">
                            <Gift size={18} className="text-primary drop-shadow-[0_0_8px_var(--primary-glow)]" />
                          </div>
                          <div>
                            <p className="text-base font-black text-foreground drop-shadow-[0_0_12px_var(--primary-glow)]">+${bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} bonus</p>
                            <p className="text-[11px] font-semibold text-[#D4AF37]">10% on your deposit — on us</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (num > 0) {
                  const needed = 5000 - num;
                  return (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/[0.05] to-transparent px-4 py-2.5">
                      <Gift size={14} className="shrink-0 text-[#D4AF37]/60" />
                      <p className="text-[11px] font-medium text-[#D4AF37]/70">Add ${needed.toLocaleString('en-US', { minimumFractionDigits: 2 })} more to unlock 10% bonus</p>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/[0.05] to-transparent px-4 py-2.5">
                    <Gift size={14} className="shrink-0 text-[#D4AF37]/60" />
                    <p className="text-[11px] font-medium text-[#D4AF37]/70">Drop $5k+ · Get 10% back</p>
                  </div>
                );
              })()}

              {/* Proof upload */}
              <CameraUpload label="Proof of Deposit" value={proofImage} onChange={setProofImage} facingMode="environment" />

              {/* Submit */}
              <div>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleSubmit}
                  loading={deposit.isPending}
                  className="shadow-[0_0_20px_var(--primary-glow)]"
                >
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Confirm Deposit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
