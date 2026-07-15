'use client';

import { useEffect, useRef, useState } from 'react';

export function useRingBuffer<T>(capacity: number): {
  push: (item: T) => void;
  items: T[];
  size: number;
  clear: () => void;
} {
  const [size, setSize] = useState(0);
  const bufferRef = useRef<(T | undefined)[]>(new Array(capacity));
  const [version, setVersion] = useState(0);

  const push = (item: T) => {
    const buf = bufferRef.current;
    const next = size >= capacity ? buf.length : size + 1;
    const idx = size % capacity;
    buf[idx] = item;
    setSize(next);
    setVersion((v) => v + 1);
  };

  const clear = () => {
    bufferRef.current = new Array(capacity);
    setSize(0);
    setVersion((v) => v + 1);
  };

  const items: T[] = [];
  if (size > 0) {
    const buf = bufferRef.current;
    const start = size < capacity ? 0 : size % capacity;
    for (let i = 0; i < size; i++) {
      const v = buf[(start + i) % capacity];
      if (v !== undefined) items.push(v);
    }
  }

  return { push, items, size, clear };
}
