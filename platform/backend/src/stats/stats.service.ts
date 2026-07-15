import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Deposit } from '../deposits/deposit.entity';
import { DepositStatus } from '../deposits/deposit.entity';
import { Loan } from '../loans/loan.entity';
import { LoanStatus } from '../loans/loan.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Deposit)
    private depositsRepository: Repository<Deposit>,
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,
  ) {}

  async getAdminStats() {
    // Total Revenue — sum of all approved deposits
    const { totalRevenue } = await this.depositsRepository
      .createQueryBuilder('deposit')
      .select('SUM(deposit.amount)', 'totalRevenue')
      .where('deposit.status = :status', { status: DepositStatus.APPROVED })
      .getRawOne();

    // Total users
    const activeUsers = await this.usersRepository.count();

    // Total approved deposits count
    const sales = await this.depositsRepository.count({
      where: { status: DepositStatus.APPROVED },
    });

    // New users in last 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeNow = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: oneDayAgo })
      .getCount();

    // Active (approved) loans
    const activeLoans = await this.loansRepository.count({
      where: { status: LoanStatus.APPROVED },
    });

    // Recent transactions
    const recentTransactions = await this.transactionsRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    return {
      totalRevenue: Number(totalRevenue) || 0,
      totalDeposits: Number(totalRevenue) || 0,
      activeUsers,
      totalUsers: activeUsers,
      sales,
      activeNow,
      activeLoans,
      recentTransactions,
    };
  }
}
