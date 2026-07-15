import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { UserAsset } from '../types';

const http = createHttpClient(config.apiUrl);

export const assetsApi = {
  getPortfolio: () => http.get<any>('/assets').then(res => {
    const data = res?.data ?? res;
    const list = Array.isArray(data) ? data : data?.assets ?? [];
    return list.map((item: any) => ({
      id: Number(item.id),
      userId: Number(item.user_id ?? item.userId),
      symbol: item.symbol,
      name: item.name ?? item.symbol,
      type: item.type ?? 'crypto',
      amount: Number(item.amount),
      avgPrice: Number(item.avg_purchase_price ?? item.avgPrice ?? 0),
    }));
  }),
  buy: (symbol: string, type: string, amount: number, price: number, name: string, marketType?: string) =>
    http.post<UserAsset>('/trades/spot', { symbol, direction: 'buy', amount, from_coin: 'USDT', to_coin: symbol, market_type: marketType, exchange_rate: price }),
  sell: (symbol: string, amount: number, price: number, name?: string, type?: string, marketType?: string) =>
    http.post<UserAsset>('/trades/spot', { symbol, direction: 'sell', amount, from_coin: symbol, to_coin: 'USDT', market_type: marketType, exchange_rate: price }),
  buyStock: (symbol: string, shares: number, price?: number) =>
    http.post<UserAsset>('/trades/stocks', { symbol, direction: 'buy', shares, exchange_rate: price }),
  sellStock: (symbol: string, shares: number, price?: number) =>
    http.post<UserAsset>('/trades/stocks', { symbol, direction: 'sell', shares, exchange_rate: price }),
};