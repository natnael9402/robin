'use client';

import { memo } from 'react';
import { formatCurrency } from '../../../shared/lib/utils';
import { cn } from '../../../shared/lib/utils';

interface Props {
  timeLeft: number;
  payout: number;
  stake: number;
  entryPrice: number;
  currentPrice: number;
  returnRate: number;
  totalDuration: number;
}

function ActiveTradePanelBase({ timeLeft, payout, stake, entryPrice, currentPrice, returnRate, totalDuration }: Props) {
  const positive = payout >= 0;
  const priceChange = currentPrice - entryPrice;
  const priceChangePercent = entryPrice > 0 ? (priceChange / entryPrice) * 100 : 0;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

  return (
    <div className="h-full flex flex-col py-6">
      {/* Countdown Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="88" cy="88" r="80" className="stroke-white/10 fill-none" strokeWidth="6" />
            <circle
              cx="88" cy="88" r="80"
              className="stroke-primary fill-none transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * progress}
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-5xl font-black text-foreground font-mono tabular-nums tracking-tighter drop-shadow-lg">{timeLeft}</div>
            <div className="text-primary font-bold uppercase tracking-widest text-[10px] mt-0.5">Seconds</div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Entry</div>
          <div className="text-sm font-black text-foreground font-mono">${formatCurrency(entryPrice)}</div>
        </div>
        <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
            Current
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-foreground font-mono">${formatCurrency(currentPrice)}</span>
            <span className={cn('text-[10px] font-black', priceChange >= 0 ? 'text-primary' : 'text-destructive')}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Est. Return</div>
          <div className="text-sm font-black text-primary font-mono">+${formatCurrency(payout - stake)}<span className="text-[10px] ml-0.5 text-primary/70">({returnRate}%)</span></div>
        </div>
        <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Duration</div>
          <div className="text-sm font-black text-foreground font-mono">{totalDuration}s</div>
        </div>
      </div>
    </div>
  );
}

export const ActiveTradePanel = memo(ActiveTradePanelBase);
