import { Inject, Injectable } from '@nestjs/common';
import { CoinGeckoProvider } from './coingecko.provider';
import { YahooFinanceProvider } from './yahoo-finance.provider';
import { IMarketDataProvider, MARKET_DATA_PROVIDER, PriceQuote } from '../interfaces/market-data.interface';

@Injectable()
export class MarketDataService {
  constructor(
    @Inject(MARKET_DATA_PROVIDER) private readonly primary: IMarketDataProvider,
    private readonly yahoo: YahooFinanceProvider,
  ) {}

  async getCryptoDetail(id: string) {
    return this.primary.getCryptoDetail(id);
  }

  async getStockDetail(symbol: string) {
    return this.yahoo.getStockDetail(symbol);
  }

  async getQuote(symbol: string): Promise<PriceQuote | null> {
    const crypto = await this.primary.getQuote(symbol).catch(() => null);
    if (crypto) return crypto;
    return this.yahoo.getQuote(symbol);
  }
}
