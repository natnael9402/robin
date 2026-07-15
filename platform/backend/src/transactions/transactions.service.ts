import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { UsersService } from '../users/users.service';
import { DepositsService } from '../deposits/deposits.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';

export interface CreateTransactionParams {
  type: 'deposit' | 'withdrawal' | 'trade_amount' | 'fee' | 'trade_win' | 'trade_cancel' | 'loan_disbursement' | 'loan_repayment' | 'mining_profit' | 'arbitrage_profit' | 'arbitrage_purchase' | 'arbitrage_refund';
  amount: number;
  currency?: string;
  balance: number;
  description?: string;
  tradeId?: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly repo: Repository<Transaction>,
    private readonly users: UsersService,
    private readonly deposits: DepositsService,
    private readonly withdrawals: WithdrawalsService,
  ) {}

  async create(userId: number, params: CreateTransactionParams) {
    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const tx = this.repo.create({
      type: params.type,
      amount: params.amount,
      currency: params.currency || 'USDT',
      balance: params.balance,
      description: params.description,
      tradeId: params.tradeId,
      user,
    });

    return this.repo.save(tx);
  }

  async findAllByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findByTrade(tradeId: number) {
    return this.repo.find({ where: { tradeId }, order: { createdAt: 'DESC' } });
  }

  async findAllPending() {
    return this.repo.find({ where: { type: 'deposit' }, relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async approve(id: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');
    return tx;
  }

  async reject(id: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');
    return tx;
  }

  async remove(id: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');
    return this.repo.remove(tx);
  }
}