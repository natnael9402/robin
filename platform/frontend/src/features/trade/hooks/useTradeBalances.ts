'use client';

import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../../../shared/api';
import { config } from '../../../shared/lib/config';

export interface TradeBalances {
  tradingBalance: number;
  spotBalance: number;
  fastTradeBalance: number;
  total: number;
}

export function useTradeBalances() {
  return useQuery<TradeBalances>({
    queryKey: ['trades', 'balances'],
    queryFn: async () => {
      const balances = await walletApi.getBalances();
      return {
        tradingBalance: balances.trading,
        spotBalance: balances.spot,
        fastTradeBalance: balances.fast_trade,
        total: balances.total,
      };
    },
    staleTime: config.staleTime,
  });
}
