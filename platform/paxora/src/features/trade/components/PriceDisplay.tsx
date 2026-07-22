'use client';

import { memo } from 'react';
import { formatCurrency } from '../../../shared/lib/utils';
import { PriceChart } from '../../../shared/components/ui/PriceChart';

interface Props {
  price: number;
  displayPrice?: number;
  points: { time: number; price: number }[];
  strikePrice?: number;
  intervalSec: number;
}

function PriceDisplayBase({ price, displayPrice, points, strikePrice, intervalSec }: Props) {
  const showPrice = displayPrice && displayPrice > 0 ? displayPrice : price;
  if (showPrice <= 0) return null;
  return (
    <div>
      <div className="mb-1 sm:mb-2 text-center">
        <div className="text-2xl sm:text-5xl font-black font-mono tracking-tighter text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          ${formatCurrency(showPrice)}
        </div>
        <div className="hidden sm:flex justify-center items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Real-Time Exchange Feed</span>
        </div>
      </div>
      <div className="w-full mb-1 sm:mb-4 flex items-center justify-center">
        <PriceChart data={points} strikePrice={strikePrice} intervalSec={intervalSec} />
      </div>
    </div>
  );
}

export const PriceDisplay = memo(PriceDisplayBase);
