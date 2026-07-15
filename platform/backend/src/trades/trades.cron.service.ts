import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TradesRepository } from './trades.repository';
import { TradesService } from './trades.service';

@Injectable()
export class TradesCronService {
  private readonly logger = new Logger(TradesCronService.name);

  constructor(
    private readonly repo: TradesRepository,
    private readonly trades: TradesService,
  ) {}

  @Cron('*/10 * * * * *')
  async resolveExpiredTrades() {
    const now = new Date();
    const open = await this.repo.findAll();
    for (const trade of open) {
      if (trade.status !== 'open') continue;
      const option = trade.options?.[0];
      const durationMs = option ? Number(option.duration) * 1000 : 60000;
      const expiration = new Date(trade.createdAt.getTime() + durationMs);
      if (now < expiration) continue;
      try {
        await this.trades.resolveOptionTrade(trade.user.id, trade.id);
      } catch (err) {
        this.logger.error(`Failed to auto-resolve trade ${trade.id}: ${(err as Error).message}`);
      }
    }
  }
}
