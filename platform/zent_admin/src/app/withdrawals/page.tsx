'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPendingWithdrawals, getWithdrawalsByStatus, approveWithdrawal, rejectWithdrawal } from '@/lib/api';
import { Check, X, ArrowUpRight, Copy, CheckCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ActionButtons } from '@/shared/components/ui/ActionButtons';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { cn, formatDateTime } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;

interface Withdrawal {
  id: number;
  amount: string;
  fee?: string;
  status: string;
  network?: string;
  wallet_address?: string;
  walletAddress?: string;
  currency?: string;
  rejection_reason?: string;
  rejectionReason?: string;
  createdAt: string;
  created_at?: string;
  user: { email: string; name: string };
}

interface WithdrawalCardProps {
  wd: Withdrawal;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  showActions?: boolean;
}

function WithdrawalCard({ wd, onApprove, onReject, showActions = true }: WithdrawalCardProps) {
  const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'processing'> = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  };

  const date = wd.createdAt || wd.created_at || '';
  const walletAddr = wd.walletAddress || wd.wallet_address || '';
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <Card padding="lg" className="shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-foreground">{wd.user?.name || 'User'}</h3>
          <p className="text-xs text-muted-foreground">{wd.user?.email}</p>
        </div>
        <span className="text-xs text-muted-foreground bg-surface-hover px-2 py-1 rounded">
          {formatDateTime(date)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-destructive-muted text-destructive">
          <ArrowUpRight size={20} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-medium">Withdrawal Request</p>
          <p className="text-xl font-bold text-foreground">${Number(wd.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-surface-hover p-3 rounded-lg text-sm border border-border-light space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge status={statusMap[wd.status] || 'pending'} size="xs" />
        </div>
        {wd.currency && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium">{wd.currency}</span>
          </div>
        )}
        {wd.network && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">{wd.network}</span>
          </div>
        )}
        {wd.fee && Number(wd.fee) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-medium">${Number(wd.fee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {walletAddr && (
          <div className="pt-2 border-t border-border-light mt-1">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Wallet Address</p>
            <div className="flex items-center gap-2 rounded-lg border border-border-light bg-surface px-3 py-2">
              <span className="flex-1 font-mono text-xs break-all text-zinc-700 dark:text-zinc-300 select-all">{walletAddr}</span>
              <button
                onClick={copyAddress}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground active:scale-95"
                title="Copy address"
              >
                {copied ? <CheckCheck size={16} className="text-success" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {(wd.rejectionReason || wd.rejection_reason) && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-[10px] font-bold uppercase text-destructive mb-0.5">Rejection Reason</p>
          <p className="text-xs text-foreground">{wd.rejectionReason || wd.rejection_reason}</p>
        </div>
      )}

      {showActions && (
        <ActionButtons
          onApprove={() => onApprove(wd.id)}
          onReject={() => onReject(wd.id)}
          approveIcon={<Check size={16} />}
          rejectIcon={<X size={16} />}
        />
      )}
    </Card>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="col-span-full py-12 text-center text-muted-foreground">No {tab} withdrawals</div>
  );
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const notify = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchWithdrawals = useCallback((status: string) => {
    setLoading(true);
    getWithdrawalsByStatus(status)
      .then((data) => setWithdrawals(data.sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime())))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWithdrawals(tab);
  }, [tab, fetchWithdrawals]);

  const handleApprove = async (id: number) => {
    try {
      await approveWithdrawal(id);
      notify('success', 'Withdrawal approved');
      fetchWithdrawals(tab);
    } catch (error) {
      notify('error', 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectWithdrawal(id);
      notify('success', 'Withdrawal rejected');
      fetchWithdrawals(tab);
    } catch (error) {
      notify('error', 'Failed to reject withdrawal');
    }
  };

  return (
    <div className="min-h-screen">
      {toast && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-[600] -translate-x-1/2">
          <div className={cn('glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glass-lg',
            toast.type === 'success' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive')}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}
      <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
        <PageHeader
          title="Withdrawals"
          subtitle="Review and approve pending withdrawal requests."
        />

        <div className="mb-6 flex gap-1 rounded-2xl border border-glass-border bg-glass-bg p-1 shadow-glass w-fit">
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all',
                tab === t ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t} {!loading && tab === t && <span className="ml-1 opacity-60">{withdrawals.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : withdrawals.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {withdrawals.map((w) => (
              <WithdrawalCard
                key={w.id}
                wd={w}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={tab === 'pending'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
