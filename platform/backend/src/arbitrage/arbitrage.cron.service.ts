import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArbitrageHosting } from './arbitrage-hosting.entity';
import { ArbitrageHostingStatus } from './arbitrage-product.entity';
import { ArbitrageService } from './arbitrage.service';

@Injectable()
export class ArbitrageCronService {
  private readonly logger = new Logger(ArbitrageCronService.name);

  constructor(
    @InjectRepository(ArbitrageHosting)
    private readonly repo: Repository<ArbitrageHosting>,
    private readonly service: ArbitrageService,
  ) {}

  // Runs every hour: distribute pending profits and finalize ended hostings
  @Cron('0 * * * *')
  async processAllHostings() {
    const running = await this.repo.find({
      where: { status: ArbitrageHostingStatus.RUNNING },
    });

    for (const hosting of running) {
      try {
        const now = new Date();
        const endDate = hosting.endDate ? new Date(hosting.endDate) : null;

        if (endDate && now >= endDate) {
          await this.service.finalizeHosting(hosting.id);
          this.logger.log(`Finalized arbitrage hosting #${hosting.id}`);
        } else {
          await this.service.processPendingProfits(hosting.id);
        }
      } catch (err) {
        this.logger.error(
          `Failed to process arbitrage hosting #${hosting.id}: ${(err as Error).message}`,
        );
      }
    }
  }
}
