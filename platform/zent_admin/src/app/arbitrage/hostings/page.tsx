'use client';

import { useCallback, useEffect, useState } from 'react';
import { getArbitrageHostings, terminateHosting } from '@/lib/api';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonList } from '@/shared/components/ui/Skeleton';
import { ConfirmModal } from '@/shared/components/ui/Modal';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;

type Hosting = {
  id: number;
  planCode: string;
  amount: number;
  dailyRate: number;
  durationDays: number;
  currency: string;
  status: string;
  user: { id: number; email: string };
  createdAt: string;
};

export default function ArbitrageHostingsPage() {
  const [items, setItems] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<Hosting | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getArbitrageHostings();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onTerminate(id: number) {
    setProcessing(id);
    setTerminateTarget(null);
    try {
      await terminateHosting(id);
      notify('success', 'Hosting terminated successfully');
      await load();
    } catch {
      notify('error', 'Failed to terminate hosting');
    } finally {
      setProcessing(null);
    }
  }

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

      <ConfirmModal
        open={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        onConfirm={() => terminateTarget && onTerminate(terminateTarget.id)}
        title="Terminate Hosting"
        message={`Are you sure you want to terminate this ${terminateTarget?.planCode ?? ''} hosting? This will end the plan and process any pending profits.`}
        confirmText="Terminate"
        variant="danger"
        loading={processing !== null}
      />

      <main className="container mx-auto p-4 lg:p-8 lg:pt-16">
        <PageHeader title="Arbitrage Hostings" subtitle="Manage active arbitrage hosting plans." />

        {loading ? (
          <SkeletonList rows={4} rowClassName="h-20" />
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">No records</div>
        ) : (
          <div className="space-y-3">
            {items.map((h) => (
              <Card key={h.id} padding="md" className="flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">Plan</span>
                    <span className="font-semibold text-foreground">{h.planCode}</span>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">Amount</span>
                    <span className="text-sm text-muted-foreground">{Number(h.amount).toLocaleString()} {h.currency}</span>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">Daily Rate</span>
                    <span className="text-sm text-muted-foreground">{h.dailyRate}% daily</span>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">Duration</span>
                    <span className="text-sm text-muted-foreground">{h.durationDays} Days</span>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">User</span>
                    <span className="truncate text-sm text-muted-foreground">{h.user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden">Status</span>
                    <StatusBadge status={h.status === 'running' ? 'active' : h.status === 'ended' ? 'ended' : 'pending'} size="xs" />
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={processing === h.id || h.status !== 'running'}
                  loading={processing === h.id}
                  onClick={() => setTerminateTarget(h)}
                  fullWidth
                  className="md:w-auto"
                >
                  Terminate
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}