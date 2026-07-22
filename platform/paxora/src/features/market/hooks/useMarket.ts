'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { marketApi, type NormalizedAsset } from '../../../shared/api';
import { config } from '../../../shared/lib/config';
import { storage } from '../../../shared/lib/storage';

export function useCryptoMarket() {
  return useQuery<NormalizedAsset[]>({
    queryKey: ['market', 'crypto'],
    queryFn: () => marketApi.getCrypto(),
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
  });
}

export function useStockMarket() {
  return useQuery<NormalizedAsset[]>({
    queryKey: ['market', 'stocks'],
    queryFn: () => marketApi.getStocks(),
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
  });
}

export function useMetalsMarket() {
  return useQuery<NormalizedAsset[]>({
    queryKey: ['market', 'metals'],
    queryFn: () => marketApi.getMetals(),
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
  });
}

export function useForexMarket() {
  return useQuery<NormalizedAsset[]>({
    queryKey: ['market', 'forex'],
    queryFn: () => marketApi.getForex(),
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
  });
}

export function useCachedUserName(): string | null {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    setName(storage.getUserName());
  }, []);
  return name;
}
