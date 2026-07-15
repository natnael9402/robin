import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IMarketDataProvider, PriceQuote } from '../interfaces/market-data.interface';

@Injectable()
export class CoinGeckoProvider implements IMarketDataProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name);
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly http: HttpService,
    config: ConfigService
  ) {
    this.baseUrl = config.get<string>('app.external.coingeckoUrl') ?? 'https://api.coingecko.com/api/v3';
    this.timeout = config.get<number>('app.external.timeoutMs') ?? 10_000;
  }

  async getCryptoDetail(id: string): Promise<{ market_data: { current_price: { usd: number } } } | null> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.baseUrl}/coins/${id}`, {
          timeout: this.timeout,
          params: { localization: false, tickers: false, community_data: false, developer_data: false },
        })
      );
      return res.data as { market_data: { current_price: { usd: number } } };
    } catch (err) {
      this.logger.warn(`CoinGecko getCryptoDetail(${id}) failed: ${(err as Error).message}`);
      return null;
    }
  }

  async getStockDetail(): Promise<{ price: number } | null> {
    return null;
  }

  async getQuote(symbol: string): Promise<PriceQuote | null> {
    const id = symbol.toLowerCase();
    const detail = await this.getCryptoDetail(id);
    if (!detail) return null;
    return {
      symbol: symbol.toUpperCase(),
      price: detail.market_data.current_price.usd,
      source: 'crypto',
      timestamp: Date.now(),
    };
  }
}
