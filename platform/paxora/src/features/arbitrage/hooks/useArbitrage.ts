'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { arbitrageApi } from '../../../shared/api';
import { config } from '../../../shared/lib/config';
import type { ArbitrageHosting } from '../../../shared/types';

export function useArbitrageHostings() {
  return useQuery<ArbitrageHosting[]>({
    queryKey: ['arbitrage', 'my'],
    queryFn: () => arbitrageApi.myHostings(),
    staleTime: config.staleTime,
  });
}

export function useCancelHosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => arbitrageApi.cancelHosting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['arbitrage', 'my'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export type { ArbitrageHosting };
