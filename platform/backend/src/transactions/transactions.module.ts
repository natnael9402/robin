import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController, AdminTransactionsController } from './transactions.controller';
import { Transaction } from './transaction.entity';
import { UsersModule } from '../users/users.module';
import { DepositsModule } from '../deposits/deposits.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    UsersModule,
    DepositsModule,
    WithdrawalsModule,
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController, AdminTransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
