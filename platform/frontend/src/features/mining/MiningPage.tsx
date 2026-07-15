'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { BackButton } from '../../shared/components/ui/BackButton';
import { Button } from '../../shared/components/ui/Button';
import { useMiningPlans } from './hooks/useMining';
import { MiningPlanCard } from './components/MiningPlanCard';
import { MiningDashboard } from './components/MiningDashboard';
import { MiningCheckoutModal } from './components/MiningCheckoutModal';
import type { MiningPlan } from '../../shared/types';

export function MiningPage() {
  useDocumentTitle('Mining · Paxora Capital');
  const router = useRouter();
  const { data: plans, isLoading } = useMiningPlans();
  const [selected, setSelected] = useState<MiningPlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <div className="mb-3">
          <BackButton href="/home" />
        </div>
        <PageHeader
          title="Mining Pool"
          subtitle="Pick a plan and start earning daily rewards"
          action={
            <Button variant="outline" size="sm" onClick={() => router.push('/mining/my')}>
              My Miners
            </Button>
          }
        />
      </div>

      <div className="px-6 space-y-8 md:px-0 mt-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">My Miners</h2>
            <button onClick={() => router.push('/mining/my')} className="text-xs text-primary font-bold hover:underline transition-colors">
              View All
            </button>
          </div>
          <div>
            <MiningDashboard />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Available Plans</h2>
          {isLoading ? (
            <SkeletonList rows={3} rowClassName="h-44" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans?.map((plan) => (
                <MiningPlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={(p) => {
                    setSelected(p);
                    setCheckoutOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MiningCheckoutModal plan={selected} open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
