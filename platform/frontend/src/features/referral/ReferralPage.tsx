'use client';

import { useEffect, useState, useCallback } from 'react';
import { Gift, Copy, Check, RefreshCw, Users, DollarSign, Clock, CheckCircle2, AlertTriangle, Share2, Loader2 } from 'lucide-react';
import { referralApi, type ReferralInfo } from '../../shared/api/referral.api';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { cn } from '../../shared/lib/utils';

export function ReferralPage() {
  useDocumentTitle('Referral · Paxora Capital');

  const [data, setData] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const info = await referralApi.getMyInfo();
      setData(info);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyCode = async () => {
    if (!data?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(data.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const generateNewCode = async () => {
    setGenerating(true);
    try {
      const result = await referralApi.generateCode();
      setData((prev) => prev ? { ...prev, inviteCode: result.inviteCode } : prev);
      showToast('success', 'New referral code generated');
    } catch {
      showToast('error', 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const formatMoney = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen pb-28">
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(1rem) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          style={{ animation: 'toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={cn(
            'flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-xl',
            toast.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'
          )}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-lg px-4 pt-16 md:max-w-2xl md:px-8 lg:max-w-4xl">
        {loading && !data ? (
          <div className="space-y-5">
            <div className="h-52 animate-pulse rounded-3xl bg-surface-hover" />
            <div className="flex gap-3">
              <div className="h-20 flex-1 animate-pulse rounded-2xl bg-surface-hover" />
              <div className="h-20 flex-1 animate-pulse rounded-2xl bg-surface-hover" />
            </div>
            <div className="h-40 animate-pulse rounded-2xl bg-surface-hover" />
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-light py-24 text-center">
            <Gift size={48} className="mb-4 text-subtle-foreground opacity-30" />
            <p className="text-lg font-bold text-foreground">No referral data</p>
            <p className="mt-1 text-sm text-muted-foreground">Sign up and start referring friends</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#E5C158] via-[#D4AF37] to-[#B8860B] p-[2px] shadow-lg">
              <div className="relative z-10 rounded-[calc(1.5rem-2px)] bg-background px-6 pb-6 pt-7">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Gift size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Referral Program</span>
                  </div>
                  {data.referredBy && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      Invited by {data.referredBy.name}
                    </span>
                  )}
                </div>

                <p className="mb-5 text-center text-sm text-muted-foreground">
                  Earn <span className="font-bold text-primary">10%</span> commission on every deposit
                </p>

                {data.inviteCode ? (
                  <div className="mb-4 text-center">
                    <div className="mb-3 inline-block rounded-2xl bg-gradient-to-br from-[#E5C158]/20 via-[#D4AF37]/15 to-[#B8860B]/20 px-8 py-4 ring-1 ring-[#D4AF37]/20">
                      <code className="select-all text-3xl font-black tracking-[0.15em] text-foreground md:text-4xl">
                        {data.inviteCode}
                      </code>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={copyCode}
                        className={cn(
                          'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95',
                          copied
                            ? 'bg-success/10 text-success ring-1 ring-success/30'
                            : 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/25'
                        )}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                      </button>
                      <button
                        onClick={generateNewCode}
                        disabled={generating}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all',
                          generating
                            ? 'cursor-not-allowed text-muted-foreground'
                            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                        )}
                      >
                        {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {generating ? 'Generating...' : 'New Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center">
                    <p className="text-sm text-muted-foreground">No invite code yet</p>
                    <button
                      onClick={generateNewCode}
                      disabled={generating}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                    >
                      {generating ? <Loader2 size={16} className="animate-spin" /> : null}
                      {generating ? 'Generating...' : 'Generate Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rule */}
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-primary/10 bg-primary/[0.04] px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-xs font-black text-primary">$</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Referrals must deposit a total of <span className="font-bold text-foreground">$5,000+</span> before you earn <span className="font-bold text-primary">10%</span> commission
              </p>
            </div>

            {/* Stats */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/5 bg-surface p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Referrals</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{data.referralCount}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-surface p-4">
                <div className="mb-1 flex items-center gap-2">
                  <DollarSign size={14} className="text-success" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Earnings</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{formatMoney(data.totalCommissionsEarned)}</p>
              </div>
            </div>

            {/* Commission History */}
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Clock size={14} className="text-muted-foreground" />
                History
                {data.commissions.length > 0 && (
                  <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {data.commissions.length}
                  </span>
                )}
              </h2>

              {data.commissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-light py-14 text-center">
                  <Share2 size={32} className="mb-3 text-subtle-foreground opacity-30" />
                  <p className="font-bold text-foreground">No commissions yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Share your code — earn 10% on $5k+ deposits
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.commissions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface px-4 py-3.5 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          c.status === 'paid' ? 'bg-success/10' : 'bg-warning/10'
                        )}>
                          <DollarSign size={15} className={c.status === 'paid' ? 'text-success' : 'text-warning'} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">+{formatMoney(c.commissionAmount)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            from {formatMoney(c.depositAmount)} deposit &middot; {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                        c.status === 'paid'
                          ? 'bg-success/10 text-success ring-1 ring-success/20'
                          : 'bg-warning/10 text-warning ring-1 ring-warning/20'
                      )}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
