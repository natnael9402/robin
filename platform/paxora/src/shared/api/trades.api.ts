import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { TradeStats } from '../types';

const http = createHttpClient(config.apiUrl);

export const tradesApi = {
  start: (asset: string, amount: number, duration: number, direction: 'buy' | 'sell', marketType?: string, price?: number) =>
    http.post<{ trade: { id: number } }>('/trades/option', { symbol: asset, direction, amount, duration, market_type: marketType, price }),
  pollStatus: (id: number) => http.get<{ trade: { id: number; status: 'open' | 'closed'; result: 'won' | 'lost' | null; pnl: number; amount: number; symbol: string; direction: 'buy' | 'sell'; type: string; entry_price: number; exit_price: number | null; fee: number; opened_at?: string; closed_at?: string | null; created_at?: string; option?: any; contract?: any; spot?: any } }>(`/trades/${id}`),
  getTrade: (id: number) => http.get<{ trade: any }>(`/trades/${id}`),

  // Spot trades
  createSpot: (params: {
    symbol: string;
    direction: 'buy' | 'sell';
    amount: number;
    from_coin?: string;
    to_coin?: string;
    exchange_rate?: number;
    market_type?: 'crypto' | 'metals' | 'stocks';
  }) => http.post<{ trade: any }>('/trades/spot', params),

  // Contract / Futures trades
  createContract: (params: {
    symbol: string;
    direction: 'buy' | 'sell';
    amount: number;
    leverage: number;
    take_profit?: number;
    stop_loss?: number;
    market_type?: 'crypto' | 'metals' | 'stocks';
  }) => http.post<{ trade: any }>('/trades/contract', params),

  // Trade history & management
  getUserTrades: (filters?: Record<string, string | number | undefined>) =>
    http.get<{ trades: any[]; pagination: any }>('/trades', { query: filters as Record<string, string | number | boolean | undefined> }),

  getTradeStats: () => http.get<TradeStats>('/trades/stats'),

  cancelTrade: (id: number) => http.post<{ trade: any }>(`/trades/${id}/cancel`),

  getMarketPrice: (symbol: string, market_type?: string) =>
    http.get<{ price: number }>(`/trades/price/${symbol}`, market_type ? { market_type } as any : undefined),
};