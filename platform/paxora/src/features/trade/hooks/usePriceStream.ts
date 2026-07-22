'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRingBuffer } from '../../../shared/hooks/useRingBuffer';
import { config } from '../../../shared/lib/config';
import type { ChartPoint } from '../../../shared/types';

export function usePriceStream(initialPrice: number) {
  const buffer = useRingBuffer<ChartPoint>(config.chartMaxPoints);
  const pushRef = useRef(buffer.push);
  pushRef.current = buffer.push;
  const [price, setPrice] = useState(initialPrice);
  const priceRef = useRef(initialPrice);
  const seededRef = useRef(false);

  const seed = useCallback(
    (p: number) => {
      seededRef.current = true;
      priceRef.current = p;
      setPrice(p);
      const now = Date.now();
      const points: ChartPoint[] = Array.from({ length: config.chartMaxPoints }, (_, i) => ({
        time: now - (config.chartMaxPoints - i) * 100,
        price: p + (Math.random() - 0.5) * p * 0.001,
      }));
      points.forEach((pt) => buffer.push(pt));
    },
    [buffer]
  );

  const reset = useCallback(
    (p: number) => {
      buffer.clear();
      seededRef.current = false;
      seed(p);
    },
    [buffer, seed]
  );

  useEffect(() => {
    const id = setInterval(() => {
      const current = priceRef.current;
      const volatility = current * 0.00005;
      const change = (Math.random() - 0.5) * volatility;
      const next = current + change;
      priceRef.current = next;
      setPrice(next);
      pushRef.current({ time: Date.now(), price: next });
    }, config.chartTickMs);
    return () => clearInterval(id);
  }, []);

  const setSeedPrice = useCallback((p: number) => {
    priceRef.current = p;
    setPrice(p);
  }, []);

  return { price, setSeedPrice, items: buffer.items, seed, reset };
}
