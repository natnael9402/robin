'use client';

import { LineChart, Line } from 'recharts';
import { memo } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

function SparklineBase({ data, color, width = 160, height = 48, strokeWidth = 2 }: SparklineProps) {
  if (!data || data.length === 0) return null;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <LineChart width={width} height={height} data={chartData}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={strokeWidth} dot={false} isAnimationActive={false} />
    </LineChart>
  );
}

export const Sparkline = memo(SparklineBase);
