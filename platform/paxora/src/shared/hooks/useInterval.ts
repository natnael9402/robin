'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type IntervalFn = () => void;

export function useInterval(callback: IntervalFn, delay: number | null): void {
  const savedCallback = useRef<IntervalFn>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useTick(delay: number | null): number {
  const [tick, setTick] = useState(0);
  const inc = useCallback(() => setTick((t) => t + 1), []);
  useInterval(inc, delay);
  return tick;
}
