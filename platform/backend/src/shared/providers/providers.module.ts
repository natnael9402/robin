import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoinGeckoProvider } from './coingecko.provider';
import { YahooFinanceProvider } from './yahoo-finance.provider';
import { MarketDataService } from './market-data.service';
import { MARKET_DATA_PROVIDER } from '../interfaces/market-data.interface';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    CoinGeckoProvider,
    YahooFinanceProvider,
    { provide: MARKET_DATA_PROVIDER, useExisting: CoinGeckoProvider },
    MarketDataService,
  ],
  exports: [MarketDataService, YahooFinanceProvider, MARKET_DATA_PROVIDER, CoinGeckoProvider],
})
export class ProvidersModule {}
