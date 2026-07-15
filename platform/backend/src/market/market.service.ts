import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CoinGeckoProvider } from '../shared/providers/coingecko.provider';
import { YahooFinanceProvider } from '../shared/providers/yahoo-finance.provider';

const TICKERS = [
  'AAPL', 'TSLA', 'NVDA', 'GOOGL', 'AMZN', 'MSFT', 'META', 'NFLX', 'AMD', 'PLTR',
  'JPM', 'BAC', 'WMT', 'COST', 'DIS', 'KO', 'PEP', 'XOM', 'CVX', 'PFE',
  'JNJ', 'V', 'MA', 'PYPL', 'COIN', 'HOOD', 'UBER', 'ABNB', 'SBUX', 'NKE',
];

const SIM_BASE_PRICES: Record<string, number> = {
  AAPL: 185, TSLA: 240, NVDA: 460, GOOGL: 140, AMZN: 145,
  MSFT: 370, META: 310, NFLX: 480, AMD: 110, PLTR: 17,
};

const SYMBOL_DOMAIN: Record<string, string> = {
  AAPL: 'apple.com', TSLA: 'tesla.com', NVDA: 'nvidia.com',
  GOOGL: 'google.com', AMZN: 'amazon.com', MSFT: 'microsoft.com',
  META: 'meta.com', NFLX: 'netflix.com', AMD: 'amd.com', PLTR: 'palantir.com',
};

const INTERVAL_MS: Record<'1d' | '1w' | '1m' | '1y', number> = {
  '1d': 30 * 60 * 1000,
  '1w': 60 * 60 * 1000,
  '1m': 24 * 60 * 60 * 1000,
  '1y': 7 * 24 * 60 * 60 * 1000,
};

export interface StockRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  image: string;
  source: string;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private readonly httpTimeout: number;

  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    config: ConfigService,
    private readonly coingecko: CoinGeckoProvider,
    private readonly yahoo: YahooFinanceProvider,
  ) {
    this.httpTimeout = config.get<number>('app.external.timeoutMs') ?? 10_000;
  }

  // ── Stocks ────────────────────────────────────────────────────────────────

  async getStocks(): Promise<StockRow[]> {
    const cached = await this.cache.get<StockRow[]>('real_stocks_list');
    if (cached) return cached;

    const results = await Promise.all(
      TICKERS.map(async (symbol): Promise<StockRow> => {
        const detail = await this.yahoo.getStockDetail(symbol).catch(() => null);
        if (detail?.price) {
          return {
            symbol,
            name: symbol,
            price: detail.price,
            change: 0,
            volume: '0',
            image: `https://www.google.com/s2/favicons?domain=${this.domainFor(symbol)}&sz=128`,
            source: 'yahoo',
          };
        }
        return this.simulatedStock(symbol);
      })
    );

    await this.cache.set('real_stocks_list', results, 60_000);
    return results;
  }

  async getStockDetail(symbol: string): Promise<StockRow> {
    const list = await this.getStocks();
    const found = list.find((s) => s.symbol === symbol);
    return found ?? this.simulatedStock(symbol);
  }

  async getLogo(symbol: string): Promise<{ buffer: Buffer; mime: string }> {
    const cacheKey = `logo_${symbol}`;
    const cached = await this.cache.get<{ buffer: Buffer | { data: number[] }; mime: string }>(cacheKey);
    if (cached) return { buffer: Buffer.from(cached.buffer as never), mime: cached.mime };

    try {
      const domain = this.domainFor(symbol);
      const { data, headers } = await firstValueFrom(
        this.http.get<ArrayBuffer>(`https://logo.clearbit.com/${domain}`, {
          responseType: 'arraybuffer',
          timeout: 2000,
        })
      );
      const result = { buffer: Buffer.from(data), mime: (headers['content-type'] as string) ?? 'image/png' };
      await this.cache.set(cacheKey, result, 86_400_000);
      return result;
    } catch {
      const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1E293B"/><text x="50%" y="54%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">${symbol.slice(0, 2)}</text></svg>`;
      return { buffer: Buffer.from(svg), mime: 'image/svg+xml' };
    }
  }

  async getStockHistory(symbol: string, range: '1d' | '1w' | '1m' | '1y'): Promise<number[][]> {
    const cacheKey = `history_stock_${symbol}_${range}`;
    const cached = await this.cache.get<number[][]>(cacheKey);
    if (cached) return cached;

    const period1 = this.periodFor(range);
    const interval = this.intervalFor(range);
    const result = await this.yahoo.getChart(symbol, period1, interval);

    if (result?.quotes?.length) {
      const data: number[][] = result.quotes
        .filter((q): q is { date: Date; close: number } => q.close !== null)
        .map((q) => [q.date.getTime(), q.close]);

      if (data.length > 0) {
        await this.cache.set(cacheKey, data, 600_000);
        return data;
      }
    }

    const stock = await this.getStockDetail(symbol);
    const currentPrice: number = (stock as StockRow | undefined)?.price ?? SIM_BASE_PRICES[symbol] ?? 100;
    return this.simulatedHistory(currentPrice, range);
  }

  // ── Crypto — all routed through CoinGeckoProvider (shared cache key space) ─

  async getCrypto() {
    const cacheKey = 'crypto_list_v2';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    try {
      // CoinGeckoProvider doesn't expose a list endpoint, so we keep the raw
      // call here — but now it's the ONLY place making it.
      const baseUrl = 'https://api.coingecko.com/api/v3';
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: '1h,24h,7d,30d',
          },
          timeout: this.httpTimeout,
        })
      );
      await this.cache.set(cacheKey, data, 60_000);
      return data;
    } catch (err) {
      this.logger.warn(`getCrypto failed: ${(err as Error).message}`);
      return [];
    }
  }

  async getCryptoHistory(id: string, days: number) {
    const cacheKey = `history_crypto_${id}_${days}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    try {
      const baseUrl = 'https://api.coingecko.com/api/v3';
      const { data } = await firstValueFrom(
        this.http.get(`${baseUrl}/coins/${id}/market_chart`, {
          params: { vs_currency: 'usd', days },
          timeout: this.httpTimeout,
        })
      );
      const prices = (data as { prices: number[][] }).prices;
      await this.cache.set(cacheKey, prices, 300_000);
      return prices;
    } catch {
      return [];
    }
  }

  // Routes through CoinGeckoProvider — same cache key used by trades fetchStrikePrice
  async getCryptoDetail(id: string) {
    const cacheKey = `crypto_detail_${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.coingecko.getCryptoDetail(id);
    if (data) {
      await this.cache.set(cacheKey, data, 300_000);
    }
    return data;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private simulatedStock(symbol: string): StockRow {
    const base = SIM_BASE_PRICES[symbol] ?? 150;
    const change = (Math.random() - 0.5) * 0.04;
    return {
      symbol,
      name: symbol,
      price: parseFloat((base * (1 + change)).toFixed(2)),
      change: parseFloat((change * 100).toFixed(2)),
      volume: '10M',
      image: `https://www.google.com/s2/favicons?domain=${this.domainFor(symbol)}&sz=128`,
      source: 'simulation',
    };
  }

  private simulatedHistory(currentPrice: number, range: '1d' | '1w' | '1m' | '1y'): number[][] {
    const now = Date.now();
    const points = 50;
    const interval: number = INTERVAL_MS[range];
    const volatility = range === '1d' ? 0.005 : range === '1w' ? 0.01 : 0.002;
    const data: number[][] = [];
    let price = currentPrice;
    for (let i = 0; i < points; i++) {
      data.unshift([now - i * interval, price]);
      const change = 1 + (Math.random() - 0.5) * volatility * 5;
      price = price / change;
    }
    return data;
  }

  private periodFor(range: '1d' | '1w' | '1m' | '1y'): Date {
    const day = 86_400_000;
    if (range === '1d') return new Date(Date.now() - day);
    if (range === '1w') return new Date(Date.now() - 7 * day);
    if (range === '1m') return new Date(Date.now() - 30 * day);
    return new Date(Date.now() - 365 * day);
  }

  private intervalFor(range: '1d' | '1w' | '1m' | '1y'): '30m' | '60m' | '1d' | '1wk' {
    if (range === '1d') return '30m';
    if (range === '1w') return '60m';
    if (range === '1m') return '1d';
    return '1wk';
  }

  private domainFor(symbol: string): string {
    return SYMBOL_DOMAIN[symbol] ?? 'google.com';
  }
}
