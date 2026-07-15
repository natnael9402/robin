import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { TradeContract } from './trade-contract.entity';
import { TradeOption } from './trade-option.entity';
import { TradeSpot } from './trade-spot.entity';
import { User } from '../users/user.entity';
import { UserAsset } from '../assets/user-asset.entity';
import { TradesService } from './trades.service';
import { TradesRepository } from './trades.repository';
import { TradesController } from './trades.controller';
import { AdminTradesController } from './trades-admin.controller';
import { TradesCronService } from './trades.cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, TradeContract, TradeOption, TradeSpot, User, UserAsset])],
  providers: [TradesService, TradesRepository, TradesCronService],
  controllers: [TradesController, AdminTradesController],
  exports: [TradesService],
})
export class TradesModule {}
