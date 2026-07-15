import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArbitrageHosting } from './arbitrage-hosting.entity';
import { ArbitrageProduct } from './arbitrage-product.entity';
import { ArbitrageService } from './arbitrage.service';
import { ArbitrageController } from './arbitrage.controller';
import { ArbitrageCronService } from './arbitrage.cron.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArbitrageHosting, ArbitrageProduct]), UsersModule],
  controllers: [ArbitrageController],
  providers: [ArbitrageService, ArbitrageCronService],
})
export class ArbitrageModule {}
