import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import yahooFinance from 'yahoo-finance2';
import { PriceQuote } from '../interfaces/market-data.interface';

interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  longName?: string;
  shortName?: string;
}

interface YahooChartResult {
  quotes?: Array<{ date: Date; close: number | null }>;
}

@Injectable()
export class YahooFinanceProvider {
  private readonly logger = new Logger(YahooFinanceProvider.name);

  constructor(config: ConfigService) {
    const timeout = config.get<number>('app.external.timeoutMs') ?? 10_000;
    try {
      const yf = yahooFinance as unknown as {
        suppressNotices?: (m: string | string[]) => void;
        setGlobalConfig?: (c: unknown) => void;
      };
      if (typeof yf.suppressNotices === 'function') yf.suppressNotices('yahooSurvey');
    } catch {
      // ignore
    }
    void timeout;
  }

  async getStockDetail(symbol: string): Promise<{ price: number } | null> {
    try {
      const quote = (await yahooFinance.quote(symbol)) as YahooQuote;
      if (!quote?.regularMarketPrice) return null;
      return { price: quote.regularMarketPrice };
    } catch (err) {
      this.logger.warn(`Yahoo getStockDetail(${symbol}) failed: ${(err as Error).message}`);
      return null;
    }
  }

  async getQuote(symbol: string): Promise<PriceQuote | null> {
    try {
      const quote = (await yahooFinance.quote(symbol)) as YahooQuote;
      if (!quote?.regularMarketPrice) return null;
      return {
        symbol: symbol.toUpperCase(),
        price: quote.regularMarketPrice,
        changePercent24h: quote.regularMarketChangePercent,
        source: 'stock',
        timestamp: Date.now(),
      };
    } catch (err) {
      this.logger.warn(`Yahoo getQuote(${symbol}) failed: ${(err as Error).message}`);
      return null;
    }
  }

  async getChart(symbol: string, period1: Date, interval: '30m' | '60m' | '1d' | '1wk'): Promise<YahooChartResult | null> {
    try {
      return (await yahooFinance.chart(symbol, { period1, interval })) as YahooChartResult;
    } catch (err) {
      this.logger.warn(`Yahoo getChart(${symbol}) failed: ${(err as Error).message}`);
      return null;
    }
  }
}
