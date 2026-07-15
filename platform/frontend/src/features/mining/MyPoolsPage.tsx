'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Server, TrendingUp, Clock, DollarSign, AlertTriangle, Cpu, ShieldCheck, X, Zap, History } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { useMyMining, useCancelHosting, useMiningProfits } from './hooks/useMining';
import { formatCurrency, formatCompact } from '../../shared/lib/utils';
import { useToast } from '../../shared/contexts/ToastContext';
import type { UserMining } from '../../shared/types';

function CancelModal({ hosting, open, onClose }: { hosting: UserMining | null; open: boolean; onClose: () => void }) {
  const cancel = useCancelHosting();
  const toast = useToast();

  if (!hosting) return null;

  const daysElapsed = Math.floor((Date.now() - new Date(hosting.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = hosting.plan?.durationDays ?? 1;
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const refundPct = Math.round(Math.max(0, (daysRemaining / totalDays) * 90));

  const handleCancel = async () => {
    try {
      const result = await cancel.mutateAsync(hosting.id);
      toast.success(`Pool cancelled. Refund: $${formatCurrency(result.refundAmount)}`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Cancel Mining Pool">
      <div className="space-y-4 p-2 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to cancel <strong className="text-foreground">{hosting.plan?.name || `Plan #${hosting.planId}`}</strong>?
        </p>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Investment</span>
            <span className="font-bold text-foreground">${formatCurrency(hosting.amount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Earned so far</span>
            <span className="font-bold text-primary">${formatCurrency(hosting.totalEarned)}</span>
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
        <div className="flex gap-3">
          <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={cancel.isPending}>
            Keep Running
          </Button>
          <Button variant="danger" size="lg" fullWidth onClick={handleCancel} loading={cancel.isPending}>
            <X className="w-4 h-4 mr-1" /> Cancel Pool
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ProfitHistoryModal({ hosting, open, onClose }: { hosting: UserMining | null; open: boolean; onClose: () => void }) {
  const { data: profits, isLoading } = useMiningProfits();

  if (!hosting) return null;

  const hostingProfits = profits?.filter((p) => p.type === 'mining_profit') ?? [];

  return (
    <Modal open={open} onClose={onClose} size="md" title="Profit History">
      <div className="space-y-4 p-2">
        <div className="flex items-center justify-between bg-background/50 rounded-xl p-4">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Earned</div>
            <div className="text-primary font-black text-xl">${formatCurrency(hosting.totalEarned)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Invested</div>
            <div className="text-foreground font-black text-xl">${formatCurrency(hosting.amount)}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-surface/40 animate-pulse" />
            ))}
          </div>
        ) : hostingProfits.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No profit transactions yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hostingProfits.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-background/50 rounded-xl p-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">Daily Profit</div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="text-primary font-bold text-sm">+${formatCurrency(p.amount)}</div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" fullWidth onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

function HostingCard({ hosting, onCancel, onViewProfits }: {
  hosting: UserMining;
  onCancel: (h: UserMining) => void;
  onViewProfits: (h: UserMining) => void;
}) {
  const daysLeft = hosting.endDate
    ? Math.max(0, Math.ceil((new Date(hosting.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalDays = hosting.plan?.durationDays ?? 0;
  const progress = totalDays > 0 ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : 0;
  const isRunning = hosting.status === 'running';
  const isEnded = hosting.status === 'ended' || hosting.status === 'cancelled';

  return (
    <div className="rounded-2xl bg-surface/40 border border-white/5 p-5 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-foreground text-base truncate">{hosting.plan?.name || `Plan #${hosting.planId}`}</h3>
            <p className="text-[11px] text-muted-foreground">{hosting.plan?.networkType ?? ''} · {hosting.plan?.hashPower ?? ''}</p>
          </div>
        </div>
        <StatusBadge status={hosting.status === 'running' ? 'active' : hosting.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Invested</div>
          <div className="text-foreground font-black text-sm">${formatCurrency(hosting.amount)}</div>
        </div>
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Daily Rate</div>
          <div className="text-primary font-black text-sm">{hosting.plan?.dailyRate ?? '—'}%</div>
        </div>
        <div
          className="bg-background/50 rounded-xl p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => onViewProfits(hosting)}
        >
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Earned</div>
          <div className="text-primary font-black text-sm">${formatCurrency(hosting.totalEarned)}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Progress ({progress}%)</span>
          <span className="text-foreground font-semibold">{isEnded ? 'Completed' : `${daysLeft}d remaining`}</span>
        </div>
        <div className="h-2 rounded-full bg-background/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-hover"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{new Date(hosting.startDate).toLocaleDateString()}</span>
          <span>{hosting.endDate ? new Date(hosting.endDate).toLocaleDateString() : '—'}</span>
        </div>
      </div>

      {isRunning && (
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfits(hosting)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border-light text-muted-foreground font-bold text-sm hover:bg-surface/50 transition-all active:scale-[0.98]"
          >
            <History className="w-3.5 h-3.5" />
            Profits
          </button>
          <button
            onClick={() => onCancel(hosting)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-destructive/30 text-destructive font-bold text-sm hover:bg-destructive/10 transition-all active:scale-[0.98]"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-10 rounded-3xl bg-surface/40 border border-white/5 text-center mt-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-black text-foreground mb-2">No Mining Pools</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        You haven&apos;t joined any mining pools yet. Pick a plan and start earning daily rewards.
      </p>
      <Button variant="lime" onClick={onCreate}>
        <Zap className="w-4 h-4 mr-2" /> Start Mining
      </Button>
    </div>
  );
}

export function MyPoolsPage() {
  useDocumentTitle('My Mining Pools · Paxora Capital');
  const router = useRouter();
  const { data: hostings, isLoading } = useMyMining();
  const [cancelling, setCancelling] = useState<UserMining | null>(null);
  const [viewingProfits, setViewingProfits] = useState<UserMining | null>(null);

  const activePools = hostings?.filter((h) => h.status === 'running') ?? [];
  const endedPools = hostings?.filter((h) => h.status !== 'running') ?? [];
  const totalInvested = hostings?.reduce((s, h) => s + h.amount, 0) ?? 0;
  const totalEarned = hostings?.reduce((s, h) => s + h.totalEarned, 0) ?? 0;

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <PageHeader
          title="My Mining Pools"
          subtitle="Manage your active and past mining pools"
          action={
            <Button variant="outline" size="sm" onClick={() => router.push('/mining')}>
              Browse Plans
            </Button>
          }
        />
      </div>

      <div className="px-6 mt-6 md:px-0">
        {isLoading ? (
          <SkeletonList rows={5} rowClassName="h-44 rounded-2xl" />
        ) : !hostings || hostings.length === 0 ? (
          <EmptyState onCreate={() => router.push('/mining')} />
        ) : (
          <div className="space-y-6">
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">{activePools.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Active</div>
              </div>
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">${formatCompact(totalEarned)}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Earned</div>
              </div>
              <div className="rounded-2xl bg-surface/40 border border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">{endedPools.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Ended</div>
              </div>
            </div>

            {/* Active pools */}
            {activePools.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Active Pools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePools.map((h) => (
                    <HostingCard
                      key={h.id}
                      hosting={h}
                      onCancel={setCancelling}
                      onViewProfits={setViewingProfits}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ended pools */}
            {endedPools.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Past Pools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {endedPools.map((h) => (
                    <HostingCard
                      key={h.id}
                      hosting={h}
                      onCancel={setCancelling}
                      onViewProfits={setViewingProfits}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CancelModal hosting={cancelling} open={!!cancelling} onClose={() => setCancelling(null)} />
      <ProfitHistoryModal hosting={viewingProfits} open={!!viewingProfits} onClose={() => setViewingProfits(null)} />
    </div>
  );
}
