'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tradesApi } from '../../../shared/api';
import type { Trade, TradeStats } from '../../../shared/types';

interface Filters {
  type: string;
  status: string;
  direction: string;
  page: number;
  per_page: number;
}

interface TradesResponse {
  trades: {
    data: Trade[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export function useTradeHistory() {
  const [filters, setFilters] = useState<Filters>({
    type: '',
    status: '',
    direction: '',
    page: 1,
    per_page: 20,
  });

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }));
  }, []);

  const tradesQuery = useQuery({
    queryKey: ['trades', 'history', filters],
    queryFn: () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined),
      );
      return tradesApi.getUserTrades(params).then((res) => res as unknown as TradesResponse);
    },
    staleTime: 15_000,
  });

  const statsQuery = useQuery({
    queryKey: ['trades', 'stats'],
    queryFn: () => tradesApi.getTradeStats(),
    staleTime: 30_000,
  });

  const raw = tradesQuery.data?.trades;

  return {
    trades: raw?.data ?? [],
    pagination: raw
      ? {
          current_page: raw.current_page,
          total: raw.total,
          per_page: raw.per_page,
          last_page: raw.last_page,
          from: raw.from,
          to: raw.to,
        }
      : null,
    stats: statsQuery.data ?? null,
    isLoading: tradesQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    filters,
    setFilter,
    setPage: (page: number) => setFilter('page', page),
  };
}
