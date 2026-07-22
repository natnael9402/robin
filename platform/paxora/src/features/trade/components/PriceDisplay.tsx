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
        <div className="text-2xl sm:text-5xl font-black font-mono tracking-tighter text-foreground">
          ${formatCurrency(showPrice)}
        </div>
      </div>
      <div className="w-full mb-1 sm:mb-4 flex items-center justify-center">
        <PriceChart data={points} strikePrice={strikePrice} intervalSec={intervalSec} />
      </div>
    </div>
  );
}

export const PriceDisplay = memo(PriceDisplayBase);
