'use client';

import { useEffect, useState, useCallback } from 'react';
import { Gift, Copy, Check, RefreshCw, Users, DollarSign, ArrowRight } from 'lucide-react';
import { referralApi, type ReferralInfo } from '../../../shared/api/referral.api';

export function ReferralSection() {
  const [data, setData] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const formatMoney = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="mt-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-surface-hover mb-4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface-hover" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Gift className="text-primary" size={22} />
          Referral Program
        </h2>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <RefreshCw size={14} />
          Reload
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface border border-white/5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-extrabold text-foreground">{data.referralCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface border border-white/5 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-extrabold text-foreground">{formatMoney(data.totalCommissionsEarned)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface border border-white/5 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Your Invite Code</p>
          {data.inviteCode ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl bg-surface-hover px-3 py-2 font-mono text-lg font-bold tracking-wider text-foreground">
                {data.inviteCode}
              </code>
              <button
                onClick={copyCode}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No code yet</p>
          )}
        </div>
      </div>

      {data.referredBy && (
        <p className="mt-3 text-xs text-muted-foreground">
          Referred by <span className="font-semibold text-foreground">{data.referredBy.name}</span>
        </p>
      )}

      {data.commissions.length > 0 && (
        <div className="mt-4 rounded-2xl bg-surface border border-white/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission History</p>
          </div>
          <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
            {data.commissions.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-success" />
                  <span className="font-bold text-foreground">{formatMoney(c.commissionAmount)}</span>
                  <span className="text-muted-foreground">from {formatMoney(c.depositAmount)} deposit</span>
                </div>
                <span className={`text-xs font-semibold ${c.status === 'paid' ? 'text-success' : 'text-warning'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
