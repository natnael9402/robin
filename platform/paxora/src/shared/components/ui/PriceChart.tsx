'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import type { ComponentType } from 'react';
import { PaxoraMark } from './PaxoraMark';

const PriceChartLoader: ComponentType<{
  data: { time: number; price: number }[];
  strikePrice?: number;
  color?: string;
  height?: number | string;
  intervalSec: number;
}> = dynamic(() => import('./PriceChartImpl').then((m) => m.PriceChartImpl), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 w-full items-center justify-center rounded-xl bg-surface/50">
      <PaxoraMark size="md" />
    </div>
  ),
});

export const PriceChart = memo(PriceChartLoader);
