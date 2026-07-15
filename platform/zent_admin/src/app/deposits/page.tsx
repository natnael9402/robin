'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDepositsByStatus, approveTransaction, rejectTransaction } from '@/lib/api';
import { Check, X, ArrowDownLeft, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ActionButtons } from '@/shared/components/ui/ActionButtons';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { cn, formatDateTime } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;

const getImageUrl = (urlPath: string | undefined | null) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('http')) return urlPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${baseUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

interface Deposit {
  id: number;
  type: string;
  amount: string;
  status: string;
  network?: string;
  paymentMethod?: string;
  payment_method?: string;
  walletAddress?: string;
  wallet_address?: string;
  proofImage?: string;
  proof_image_url?: string;
  proof_image?: string;
  createdAt: string;
  created_at?: string;
  user: { email: string; name: string; id?: number };
}

function DepositCard({ tx, onApprove, onReject, showActions = true }: { tx: Deposit; onApprove: (id: number) => void; onReject: (id: number) => void; showActions?: boolean }) {
  const [imgOpen, setImgOpen] = useState(false);
  const proof = getImageUrl(tx.proofImage || tx.proof_image_url || tx.proof_image);
  const network = tx.network || tx.paymentMethod || tx.payment_method || '—';
  const dateVal = tx.createdAt || tx.created_at;
  const statusColor = tx.status === 'approved' ? 'text-emerald-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-amber-500';

  return (
    <Card padding="md" className="shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-500' : tx.status === 'rejected' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
          )}>
            {(tx.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{tx.user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-muted-foreground">{tx.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={tx.status === 'approved' ? 'approved' : tx.status === 'rejected' ? 'rejected' : 'pending'} size="xs" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-surface-hover px-4 py-3">
        <div className={cn('p-2 rounded-full', tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : tx.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500')}>
          <ArrowDownLeft size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Amount</p>
          <p className="text-lg font-extrabold text-foreground">
            ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Network</p>
          <p className="text-xs font-semibold text-foreground">{network}</p>
        </div>
      </div>

      {proof && (
        <a href={proof} target="_blank" rel="noreferrer"
          className="block h-24 rounded-lg overflow-hidden border border-border-light hover:border-primary transition-colors bg-zinc-100 dark:bg-zinc-900">
          <img src={proof} alt="Proof" className="w-full h-full object-cover" />
        </a>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock size={11} />
          {formatDateTime(dateVal)}
        </div>
        {tx.user?.id && (
          <a href={`/users/${tx.user.id}`} className="text-[11px] font-semibold text-primary hover:underline">View User</a>
        )}
      </div>

      {showActions && (
        <ActionButtons
          onApprove={() => onApprove(tx.id)}
          onReject={() => onReject(tx.id)}
          approveIcon={<Check size={16} />}
          rejectIcon={<X size={16} />}
        />
      )}
    </Card>
  );
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const notify = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchDeposits = useCallback((status: string) => {
    setLoading(true);
    getDepositsByStatus(status)
      .then((data) => { setDeposits(data.sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime())); setCounts((p) => ({ ...p, [status]: data.length })); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDeposits(tab); }, [tab, fetchDeposits]);

  const handleApprove = async (id: number) => {
    try { await approveTransaction(id); notify('success', 'Deposit approved'); fetchDeposits(tab); }
    catch { notify('error', 'Failed to approve deposit'); }
  };

  const handleReject = async (id: number) => {
    try { await rejectTransaction(id); notify('success', 'Deposit rejected'); fetchDeposits(tab); }
    catch { notify('error', 'Failed to reject deposit'); }
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
        <PageHeader title="Deposits" subtitle="Review and manage deposit requests." />

        <div className="mb-5 flex gap-1 rounded-2xl border border-glass-border bg-glass-bg p-1 shadow-glass w-fit">
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all',
                tab === t ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:text-foreground')}>
              {t} {!loading && tab === t && <span className="ml-1 opacity-60">{counts[t]}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : deposits.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No {tab} deposits</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deposits.map((d) => (
              <DepositCard key={d.id} tx={d} onApprove={handleApprove} onReject={handleReject} showActions={tab === 'pending'} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
