import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Deposit } from '../deposits/deposit.entity';
import { Loan } from '../loans/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Deposit, Loan])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
