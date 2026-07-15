'use client';

import { useState } from 'react';
import { Cpu, ShieldCheck, AlertTriangle, X, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { Modal } from '../../shared/components/ui/Modal';
import { Button } from '../../shared/components/ui/Button';
import { formatCurrency, formatCompact } from '../../shared/lib/utils';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { useArbitrageHostings, useCancelHosting } from './hooks/useArbitrage';
import type { ArbitrageHosting } from '../../shared/types';

function CancelModal({ hosting, open, onClose }: { hosting: ArbitrageHosting | null; open: boolean; onClose: () => void }) {
  const cancel = useCancelHosting();
  const toast = useToast();

  if (!hosting) return null;

  const daysElapsed = Math.floor((Date.now() - new Date(hosting.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.floor((new Date(hosting.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const totalDays = daysElapsed + daysRemaining;
  const refundPct = Math.round(Math.max(0, (daysRemaining / totalDays) * 90));

  const handleCancel = async () => {
    try {
      const result = await cancel.mutateAsync(hosting.id);
      toast.success(`Hosting cancelled. Refund: $${formatCurrency(result.refundAmount)}`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Cancel Hosting">
      <div className="space-y-4 p-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to cancel <strong className="text-foreground">{hosting.planCode}</strong>?
        </p>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Investment</span>
            <span className="font-bold text-foreground">${formatCurrency(hosting.amount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Days elapsed</span>
            <span className="font-bold text-foreground">{daysElapsed}d</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Days remaining</span>
            <span className="font-bold text-foreground">{daysRemaining}d</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Est. refund</span>
            <span className="font-bold text-emerald-400">~{refundPct}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Cancellation fee</span>
            <span className="font-bold text-destructive">10%</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          Pending profits will be paid out before refund.
        </p>
        <div className="flex gap-3 pt-1">
          <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={cancel.isPending}>
            Keep Running
          </Button>
          <Button variant="danger" size="lg" fullWidth onClick={handleCancel} loading={cancel.isPending}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function HostingCard({ hosting, onCancel }: { hosting: ArbitrageHosting; onCancel: (h: ArbitrageHosting) => void }) {
  const isRunning = hosting.status === 'running' || (hosting.active && hosting.status !== 'cancelled');
  const daysElapsed = Math.floor((Date.now() - new Date(hosting.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.floor((new Date(hosting.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const totalDays = daysElapsed + daysRemaining;
  const progress = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : (isRunning ? 0 : 100);

  return (
    <div className="rounded-2xl bg-surface/40 border border-white/5 p-5 hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-foreground text-base truncate">{hosting.planCode}</h3>
            <p className="text-[11px] text-muted-foreground">
              {hosting.currency} · Deployed {new Date(hosting.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={hosting.status === 'cancelled' ? 'cancelled' : isRunning ? 'active' : 'ended'} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Invested</div>
          <div className="text-foreground font-black text-sm">${formatCurrency(hosting.amount)}</div>
        </div>
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Duration</div>
          <div className="text-foreground font-black text-sm">{totalDays}d</div>
        </div>
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Status</div>
          <div className={`font-black text-sm ${isRunning ? 'text-emerald-400' : hosting.status === 'cancelled' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {isRunning ? 'Running' : hosting.status === 'cancelled' ? 'Cancelled' : 'Ended'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Progress ({progress}%)</span>
          <span className="text-foreground font-semibold">
            {isRunning ? `${daysRemaining}d remaining` : hosting.status === 'cancelled' ? 'Cancelled' : 'Completed'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-background/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              hosting.status === 'cancelled'
                ? 'bg-destructive'
                : isRunning
                  ? 'bg-gradient-to-r from-primary to-primary-hover'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{new Date(hosting.startDate).toLocaleDateString()}</span>
          <span>{new Date(hosting.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Cancel button */}
      {isRunning && (
        <button
          onClick={() => onCancel(hosting)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/10 transition-all active:scale-[0.98]"
        >
          <X className="w-3.5 h-3.5" />
          Cancel Hosting
        </button>
      )}
    </div>
  );
}

export function MyHostingsPage() {
  useDocumentTitle('My Hostings · Paxora Capital');
  const router = useRouter();
  const { data: hostings, isLoading } = useArbitrageHostings();
  const [cancelling, setCancelling] = useState<ArbitrageHosting | null>(null);

  const activeHostings = hostings?.filter((h) => h.status === 'running' || (h.active && h.status !== 'cancelled')) ?? [];
  const endedHostings = hostings?.filter((h) => h.status !== 'running' && !(h.active && h.status !== 'cancelled')) ?? [];
  const totalInvested = hostings?.reduce((s, h) => s + h.amount, 0) ?? 0;

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <PageHeader
          title="My Hostings"
          subtitle="Your Active & Ended Strategies"
          action={
            <Button variant="secondary" size="sm" onClick={() => router.push('/arbitrage')}>
              Back
            </Button>
          }
        />
      </div>

      <div className="px-6 mt-6 md:px-0">
        {isLoading ? (
          <SkeletonList rows={5} rowClassName="h-44 rounded-2xl" />
        ) : !hostings || hostings.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface/40 border border-white/5 text-center mt-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No hostings found</h3>
            <p className="text-muted-foreground text-sm mb-6">You haven&apos;t deployed any arbitrage strategies yet.</p>
            <Button variant="lime" onClick={() => router.push('/arbitrage')}>Deploy Strategy</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">{activeHostings.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Active</div>
              </div>
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">${formatCompact(totalInvested)}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Invested</div>
              </div>
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">{endedHostings.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Ended</div>
              </div>
            </div>

            {/* Active */}
            {activeHostings.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Active Strategies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeHostings.map((h) => (
                    <HostingCard key={h.id} hosting={h} onCancel={setCancelling} />
                  ))}
                </div>
              </div>
            )}

            {/* Ended */}
            {endedHostings.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Past Strategies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {endedHostings.map((h) => (
                    <HostingCard key={h.id} hosting={h} onCancel={setCancelling} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CancelModal hosting={cancelling} open={!!cancelling} onClose={() => setCancelling(null)} />
    </div>
  );
}
