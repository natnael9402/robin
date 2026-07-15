export interface PriceQuote {
  symbol: string;
  price: number;
  changePercent24h?: number;
  source: 'crypto' | 'stock';
  timestamp: number;
}

export interface IMarketDataProvider {
  getCryptoDetail(id: string): Promise<{ market_data: { current_price: { usd: number } } } | null>;
  getStockDetail(symbol: string): Promise<{ price: number } | null>;
  getQuote(symbol: string): Promise<PriceQuote | null>;
}

export const MARKET_DATA_PROVIDER = Symbol('MARKET_DATA_PROVIDER');
