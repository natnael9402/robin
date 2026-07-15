'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { miningApi } from '../../../shared/api';
import { config } from '../../../shared/lib/config';
import { FALLBACK_MINING_PLANS } from '../constants/fallbackPlans';
import type { MiningPlan, UserMining } from '../../../shared/types';

export function useMiningPlans() {
  return useQuery<MiningPlan[]>({
    queryKey: ['mining', 'plans'],
    queryFn: async () => {
      try {
        const data = await miningApi.getPlans();
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {
      }
      return FALLBACK_MINING_PLANS;
    },
    staleTime: config.staleTime,
  });
}

export function useMyMining() {
  return useQuery<UserMining[]>({
    queryKey: ['mining', 'my'],
    queryFn: () => miningApi.getMyMining(),
    staleTime: config.staleTime,
  });
}

export function useSubscribePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, amount }: { planId: number; amount: number }) =>
      miningApi.host(planId, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mining', 'my'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function useCancelHosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => miningApi.cancelHosting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mining', 'my'] });
      qc.invalidateQueries({ queryKey: ['mining', 'stats'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function useMiningStats() {
  return useQuery({
    queryKey: ['mining', 'stats'],
    queryFn: () => miningApi.getStats(),
    staleTime: config.staleTime,
  });
}

export function useMiningProfits() {
  return useQuery({
    queryKey: ['mining', 'profits'],
    queryFn: () => miningApi.getProfits(),
    staleTime: config.staleTime,
  });
}
