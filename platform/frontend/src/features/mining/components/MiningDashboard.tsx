'use client';

import { memo } from 'react';
import { Server } from 'lucide-react';
import { SkeletonList } from '../../../shared/components/ui/Skeleton';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { formatCurrency } from '../../../shared/lib/utils';
import { useMyMining } from '../hooks/useMining';

function MiningDashboardBase() {
  const { data, isLoading } = useMyMining();
  if (isLoading) return <SkeletonList rows={2} rowClassName="h-24" />;
  if (!data || data.length === 0) {
    return <EmptyState icon={<Server className="w-10 h-10" />} title="No active miners" description="Start a plan to see your miners here." />;
  }
  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className="p-4 rounded-2xl bg-surface/30 border border-border-light">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-foreground">{m.plan?.name || `Plan #${m.planId}`}</div>
              <div className="text-xs text-muted-foreground">
                ${formatCurrency(m.amount)} · Earned ${formatCurrency(m.totalEarned)} · ends {new Date(m.endDate).toLocaleDateString()}
              </div>
            </div>
            <StatusBadge status={m.status === 'running' ? 'active' : m.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const MiningDashboard = memo(MiningDashboardBase);
