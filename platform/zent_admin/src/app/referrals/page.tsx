'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getReferralStats, getReferralCommissions, approveCommission,
} from '@/lib/api';
import {
  DollarSign, Users, CheckCircle2, Clock, AlertTriangle,
  CheckCircle, X, RefreshCw, Handshake,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { ConfirmModal } from '@/shared/components/ui/Modal';
import { cn, formatDate } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;
type StatusFilter = '' | 'pending' | 'paid';

export default function ReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [approvingBusy, setApprovingBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchAll = useCallback(async (status?: StatusFilter) => {
    setLoading(true);
    try {
      const [statsData, commissionsData] = await Promise.all([
        getReferralStats(),
        getReferralCommissions(status || undefined),
      ]);
      setStats(statsData);
      setCommissions(commissionsData);
    } catch {
      notify('error', 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchAll(statusFilter); }, [statusFilter, fetchAll]);

  const handleApprove = async () => {
    if (!approvingId) return;
    setApprovingBusy(true);
    try {
      await approveCommission(approvingId);
      notify('success', 'Commission approved successfully');
      setApprovingId(null);
      fetchAll(statusFilter);
    } catch (err: any) {
      notify('error', err.message || 'Failed to approve commission');
    } finally {
      setApprovingBusy(false);
    }
  };

  const money = (v: any) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statsCards = stats ? [
    { label: 'Total Paid', value: money(stats.paidAmount), sub: `${stats.paidCount} commissions`, icon: CheckCircle2, tone: 'text-success', bg: 'bg-success-muted' },
    { label: 'Active Referrers', value: String(stats.totalReferrers), sub: 'users with referrals', icon: Users, tone: 'text-info', bg: 'bg-info-muted' },
    { label: 'Total All Time', value: money(stats.totalCommissionAmount), sub: 'across all statuses', icon: DollarSign, tone: 'text-primary', bg: 'bg-primary-muted' },
  ] : [];

  return (
    <div className="min-h-screen pb-20">
      {toast && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-[600] -translate-x-1/2">
          <div className={cn(
            'glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glass-lg',
            toast.type === 'success' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'
          )}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <main className="animate-rise container mx-auto p-4 lg:p-8 lg:pt-16 max-w-6xl">
        <PageHeader
          title="Referral Commissions"
          subtitle="Track referral payouts and approve pending commissions."
          action={
            <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={() => fetchAll(statusFilter)} loading={loading}>
              Reload
            </Button>
          }
        />

        {loading && !stats ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {statsCards.map((s) => (
              <Card key={s.label} padding="md" className="flex items-center gap-3 sm:gap-4">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl', s.bg, s.tone)}>
                  <s.icon size={18} className="sm:size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{s.label}</p>
                  <p className="truncate text-lg font-extrabold text-foreground sm:text-xl">{s.value}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="mt-6 mb-4 flex flex-wrap gap-1 rounded-2xl border border-glass-border bg-glass-bg p-1 shadow-glass w-fit">
          {(['', 'pending', 'paid'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                statusFilter === f ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Commissions table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-hover" />
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Handshake size={40} className="mb-3 text-subtle-foreground opacity-30" />
              <p className="text-sm font-medium text-muted-foreground">No referral commissions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Commissions appear when referred users deposit $5k+</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {commissions.map((c) => (
              <Card key={c.id} padding="md">
                {/* Mobile layout */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{c.referrer?.name || 'Unknown'}</p>
                    <StatusBadge status={c.status === 'paid' ? 'approved' : 'pending'} size="xs">
                      {c.status}
                    </StatusBadge>
                  </div>
                  {c.referredUser?.name && c.referredUser?.name !== c.referrer?.name && (
                    <p className="text-xs text-muted-foreground">Referred {c.referredUser?.name}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deposit</p>
                      <p className="font-bold text-foreground">{money(c.depositAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Commission</p>
                      <p className="font-bold text-success">{money(c.commissionAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">{formatDate(c.createdAt)}</p>
                    {c.status === 'pending' && (
                      <Button size="sm" variant="success" onClick={() => setApprovingId(c.id)}>
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
                {/* Desktop layout */}
                <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Referrer</p>
                      <p className="font-semibold text-foreground">{c.referrer?.name || 'Unknown'}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.referrer?.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Referred</p>
                      <p className="font-semibold text-foreground">{c.referredUser?.name || 'Unknown'}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.referredUser?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deposit</p>
                      <p className="font-bold text-foreground">{money(c.depositAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commission</p>
                      <p className="font-bold text-success">{money(c.commissionAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                      <StatusBadge status={c.status === 'paid' ? 'approved' : 'pending'} size="xs">
                        {c.status}
                      </StatusBadge>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>
                  {c.status === 'pending' && (
                    <Button size="sm" variant="success" leftIcon={<CheckCircle size={14} />} onClick={() => setApprovingId(c.id)}>
                      Approve
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        open={!!approvingId}
        onClose={() => setApprovingId(null)}
        onConfirm={handleApprove}
        loading={approvingBusy}
        title="Approve Commission?"
        message="This will mark the commission as paid and credit the referrer's balance if not already done."
        confirmText="Approve"
        cancelText="Cancel"
        variant="success"
      />
    </div>
  );
}
