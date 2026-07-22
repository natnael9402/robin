'use client';

import { useEffect, useState, useCallback } from 'react';
import { tradesApi } from '../../../shared/api';
import { useToast } from '../../../shared/contexts/ToastContext';
import type { ActiveTrade, TradeDirection } from '../logic/tradeMath';
import { profitFor } from '../logic/tradeMath';
import type { TradeResolution } from '../../../shared/types';

interface StartParams {
  assetSymbol: string;
  visualStrikePrice: number;
  amount: number;
  duration: number;
  type: TradeDirection;
  marketType?: string;
}

interface UseActiveTradeApi {
  active: ActiveTrade | null;
  timeLeft: number;
  currentPayout: number;
  start: (params: StartParams) => Promise<ActiveTrade | null>;
  resolve: () => Promise<TradeResolution | null>;
  placingDirection: 'buy' | 'sell' | null;
  isResolving: boolean;
  reset: () => void;
}

export function useActiveTrade(): UseActiveTradeApi {
  const [active, setActive] = useState<ActiveTrade | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPayout, setCurrentPayout] = useState(0);
  const [placingDirection, setPlacingDirection] = useState<'buy' | 'sell' | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - active.startTime) / 1000;
      const remaining = Math.max(0, Math.ceil(active.duration - elapsed));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active) {
      setCurrentPayout(0);
      return;
    }
    setCurrentPayout(active.profit + active.initialAmount);
  }, [active]);

  const start = useCallback(
    async ({ assetSymbol, visualStrikePrice, amount, duration, type, marketType }: StartParams) => {
      setPlacingDirection(type);
      try {
        const res = await tradesApi.start(assetSymbol, amount, duration, type, marketType, visualStrikePrice);
        const trade: ActiveTrade = {
          id: res.trade.id,
          startTime: Date.now(),
          duration,
          type,
          assetSymbol,
          initialAmount: amount,
          profit: profitFor(amount, duration),
          visualStrikePrice,
        };
        setActive(trade);
        setTimeLeft(duration);
        setCurrentPayout(trade.profit + amount);
        return trade;
      } catch (err) {
        toast.error((err as Error).message ?? 'Trade failed');
        return null;
      } finally {
        setPlacingDirection(null);
      }
    },
    [toast]
  );

  const resolve = useCallback(async (): Promise<TradeResolution | null> => {
    if (!active) return null;
    setIsResolving(true);
    try {
      let result = null;
      for (let i = 0; i < 5; i++) {
        const res = await tradesApi.pollStatus(active.id);
        const trade = res.trade;
        if (trade.status === 'closed') {
          const isWin = trade.result === 'won';
          result = {
            id: active.id,
            status: isWin ? 'WIN' : 'LOSS',
            profit: Number.isFinite(trade.pnl) ? Number(trade.pnl) : (isWin ? profitFor(active.initialAmount, active.duration) : -active.initialAmount),
            entry_price: trade.entry_price,
            exit_price: trade.exit_price,
            fee: trade.fee,
            opened_at: trade.opened_at ?? trade.created_at,
            closed_at: trade.closed_at,
            return_rate: trade.option?.return_rate,
            expected_return: trade.option?.expected_return,
          };
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!result) {
        result = { id: active.id, status: 'LOSS', profit: -active.initialAmount };
      }
      return result as TradeResolution;
    } catch (err) {
      toast.error((err as Error).message ?? 'Resolution failed');
      return null;
    } finally {
      setIsResolving(false);
      setActive(null);
    }
  }, [active, toast]);

  const reset = useCallback(() => {
    setActive(null);
    setTimeLeft(0);
    setCurrentPayout(0);
  }, []);

  return { active, timeLeft, currentPayout, start, resolve, placingDirection, isResolving, reset };
}
