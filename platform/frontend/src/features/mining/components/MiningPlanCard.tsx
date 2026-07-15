'use client';

import { memo } from 'react';
import { Cpu, Zap } from 'lucide-react';
import { formatCurrency } from '../../../shared/lib/utils';
import type { MiningPlan } from '../../../shared/types';

interface Props {
  plan: MiningPlan;
  onSelect: (plan: MiningPlan) => void;
}

function MiningPlanCardBase({ plan, onSelect }: Props) {
  return (
    <div className="rounded-2xl bg-surface/40 backdrop-blur-md border border-border-light p-5 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-foreground text-sm">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.networkType} · {plan.hashPower}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Cpu className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-background/40 rounded-lg p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Daily</div>
          <div className="text-primary font-mono font-bold">{plan.dailyRate}%</div>
        </div>
        <div className="bg-background/40 rounded-lg p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Duration</div>
          <div className="text-foreground font-mono font-bold">{plan.durationDays}d</div>
        </div>
        <div className="bg-background/40 rounded-lg p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Power</div>
          <div className="text-foreground font-mono font-bold">{plan.power}</div>
        </div>
        <div className="bg-background/40 rounded-lg p-2">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">Min</div>
          <div className="text-foreground font-mono font-bold">${formatCurrency(plan.minAmount)}</div>
        </div>
      </div>

      <button
        onClick={() => onSelect(plan)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition-all active:scale-95"
      >
        <Zap className="w-4 h-4" strokeWidth={2.5} />
        Start Mining
      </button>
    </div>
  );
}

export const MiningPlanCard = memo(MiningPlanCardBase);
