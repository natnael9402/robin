'use client';

import { useState } from 'react';
import { Cpu, Activity, Zap, ShieldCheck, ChevronRight, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { Modal } from '../../shared/components/ui/Modal';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { arbitrageApi } from '../../shared/api';
import { config } from '../../shared/lib/config';
import { formatCurrency } from '../../shared/lib/utils';
import type { ArbitrageHosting, ArbitragePlan } from '../../shared/types';
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue';
import { BackButton } from '../../shared/components/ui/BackButton';

import { useRouter } from 'next/navigation';

function useArbitragePlans() {
  return useQuery<ArbitragePlan[]>({
    queryKey: ['arbitrage', 'plans'],
    queryFn: () => arbitrageApi.getPlans(),
    staleTime: config.staleTime,
  });
}

function useStartHosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, amount }: { planId: string | number; amount: number }) =>
      arbitrageApi.startHosting(planId, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arbitrage', 'my'] }),
  });
}

export function ArbitragePage() {
  useDocumentTitle('AI Arbitrage · Paxora Capital');
  const router = useRouter();
  const { data: plans, isLoading } = useArbitragePlans();
  const [selected, setSelected] = useState<ArbitragePlan | null>(null);

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <div className="mb-3">
          <BackButton href="/home" />
        </div>
        <PageHeader 
          title="AI Arbitrage" 
          subtitle="Algorithmic profit sharing" 
          action={
            <Button variant="outline" size="sm" onClick={() => router.push('/arbitrage/my-hosting')}>
              My Hostings
            </Button>
          }
        />
      </div>

      <div className="px-6 space-y-8 md:px-0 mt-6">
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Available Strategies
          </h2>
        
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonList rows={4} rowClassName="h-44 rounded-2xl" />
            </div>
          ) : (plans?.length ?? 0) === 0 ? (
            <EmptyState title="No plans available" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans!.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan)}
                  className="group relative w-full p-5 rounded-2xl bg-surface/40 border border-white/5 hover:border-primary/30 text-left transition-all duration-300 hover:shadow-lg active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{plan.name}</h3>
                      <div className="text-[11px] text-muted-foreground font-medium">AI Arbitrage Product</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-colors shrink-0">
                      <Cpu className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex-1 bg-background/50 p-2.5 rounded-xl border border-white/5 text-center">
                      <div className="text-muted-foreground text-[9px] uppercase tracking-wider font-bold mb-0.5">Daily</div>
                      <div className="text-primary font-black text-base">{plan.dailyRate}%</div>
                    </div>
                    <div className="flex-1 bg-background/50 p-2.5 rounded-xl border border-white/5 text-center">
                      <div className="text-muted-foreground text-[9px] uppercase tracking-wider font-bold mb-0.5">Duration</div>
                      <div className="text-foreground font-black text-base">{plan.durationDays}d</div>
                    </div>
                    <div className="flex-1 bg-background/50 p-2.5 rounded-xl border border-white/5 text-center">
                      <div className="text-muted-foreground text-[9px] uppercase tracking-wider font-bold mb-0.5">Min</div>
                      <div className="text-foreground font-black text-sm">${formatCurrency(plan.minAmount)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ArbitrageCheckoutModal plan={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ArbitrageCheckoutModal({ plan, onClose }: { plan: ArbitragePlan | null; onClose: () => void }) {
  const [amount, setAmount] = useState('1000');
  const start = useStartHosting();
  const toast = useToast();
  const debounced = useDebouncedValue(amount, 250);

  if (!plan) return null;

  const num = Number(debounced);
  const minAmt = plan.minAmount ?? plan.min_amount ?? 0;
  const maxAmt = plan.maxAmount ?? plan.max_amount ?? 0;
  const valid = num >= minAmt && num <= maxAmt;

  const handleSubmit = async () => {
    if (!valid) return toast.error(`Amount must be between $${formatCurrency(minAmt)} and $${formatCurrency(maxAmt)}`);
    try {
      await start.mutateAsync({ planId: plan.id, amount: num });
      toast.success('Strategy successfully deployed!');
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={!!plan} onClose={onClose} size="md" title="Deploy Strategy">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 mb-2">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground">{plan.name}</h2>
          <p className="text-sm text-muted-foreground">Automated Arbitrage Engine</p>
        </div>

        <div className="bg-background rounded-3xl p-5 border border-white/5 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-2xl bg-surface/50">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Guaranteed Daily</div>
            <div className="text-primary font-black text-xl">{plan.dailyRate}%</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-surface/50">
            <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Lock Duration</div>
            <div className="text-foreground font-black text-xl">{plan.durationDays} <span className="text-sm font-normal text-muted-foreground">Days</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Investment Amount"
            type="number"
            value={amount}
            leftAdornment={<span className="text-foreground font-black pl-2">$</span>}
            onChange={(e) => setAmount(e.target.value)}
            hint={`Range: $${formatCurrency(minAmt)} – $${formatCurrency(maxAmt)}`}
            className="text-lg font-bold"
          />

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              Your principal of <span className="text-foreground font-bold">${formatCurrency(num || 0)}</span> will be locked for {plan.durationDays} days. You will receive daily payouts of <span className="text-primary font-bold">${formatCurrency((num || 0) * ((plan.dailyRate ?? 0) / 100))}</span> directly to your wallet.
            </div>
          </div>

          <Button variant="lime" size="xl" fullWidth loading={start.isPending} onClick={handleSubmit} className="text-lg shadow-[0_0_20px_rgba(180,134,8,0.3)]">
            Deploy Engine <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
