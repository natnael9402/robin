'use client';

import { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { useSubscribePlan } from '../hooks/useMining';
import type { MiningPlan } from '../../../shared/types';
import { formatCurrency } from '../../../shared/lib/utils';

interface Props {
  plan: MiningPlan | null;
  open: boolean;
  onClose: () => void;
}

export function MiningCheckoutModal({ plan, open, onClose }: Props) {
  const [amount, setAmount] = useState('1000');
  const subscribe = useSubscribePlan();
  const toast = useToast();

  if (!plan) return null;

  const num = Number(amount);
  const valid = num >= plan.minAmount && num <= plan.maxAmount;

  const handleSubmit = async () => {
    if (!valid) {
      toast.error(`Amount must be between $${plan.minAmount} and $${plan.maxAmount}`);
      return;
    }
    try {
      await subscribe.mutateAsync({ planId: plan.id, amount: num });
      toast.success('Mining subscription started');
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title={`Subscribe to ${plan.name}`}>
      <div className="space-y-4">
        <div className="bg-surface/50 rounded-2xl p-4 border border-border-light">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold mb-1">Daily Rate</div>
              <div className="text-primary font-mono font-bold">{plan.dailyRate}%</div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold mb-1">Duration</div>
              <div className="text-foreground font-mono font-bold">{plan.durationDays} days</div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold mb-1">Min</div>
              <div className="text-foreground font-mono font-bold">${formatCurrency(plan.minAmount)}</div>
            </div>
            <div>
              <div className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold mb-1">Max</div>
              <div className="text-foreground font-mono font-bold">${formatCurrency(plan.maxAmount)}</div>
            </div>
          </div>
        </div>
        <Input
          label="Amount"
          type="number"
          value={amount}
          leftAdornment={<span className="text-foreground font-mono font-bold">$</span>}
          onChange={(e) => setAmount(e.target.value)}
          hint={`Range: $${formatCurrency(plan.minAmount)} – $${formatCurrency(plan.maxAmount)}`}
        />
        <Button variant="lime" size="lg" fullWidth loading={subscribe.isPending} onClick={handleSubmit}>
          Confirm Subscription
        </Button>
      </div>
    </Modal>
  );
}
