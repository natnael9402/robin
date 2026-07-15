import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from './withdrawal.entity';
import { WithdrawalStatus } from './withdrawal.entity';
import { User } from '../users/user.entity';
import { Profile } from '../users/profile.entity';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectRepository(Withdrawal) private readonly repo: Repository<Withdrawal>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Profile) private readonly profileRepo: Repository<Profile>,
  ) {}

  async create(userId: number, data: Partial<Withdrawal>) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile || !profile.withdrawalPasswordEnabled || !profile.withdrawalPassword) {
      throw new Error('Withdrawal password not set');
    }
    if (profile.kycStatus !== 'verified') {
      throw new Error('KYC not verified');
    }

    const withdrawal = this.repo.create({ ...data, userId, status: WithdrawalStatus.PENDING });
    return this.repo.save(withdrawal);
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAll(status?: WithdrawalStatus) {
    const where = status ? { status } : {};
    return this.repo.find({ where, relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async approve(id: number) {
    const withdrawal = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== WithdrawalStatus.PENDING) throw new Error('Already processed');

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.processedAt = new Date();
    await this.repo.save(withdrawal);

    await this.userRepo.decrement({ id: withdrawal.userId }, 'balance', Number(withdrawal.amount) + Number(withdrawal.fee));
    return withdrawal;
  }

  async reject(id: number, reason: string) {
    const withdrawal = await this.repo.findOne({ where: { id } });
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== WithdrawalStatus.PENDING) throw new Error('Already processed');

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectionReason = reason;
    withdrawal.processedAt = new Date();
    return this.repo.save(withdrawal);
  }

  static calculateFee(currency: string, amount: number, network: string): number {
    const multipliers: Record<string, number> = {
      TRC20: 1,
      ERC20: 5,
      BEP20: 0.5,
      SOL: 0.2,
    };
    const baseFee = 1;
    const multiplier = multipliers[network] || 1;
    const percentageFee = amount > 100 ? amount * 0.005 : 0;
    const fee = baseFee * multiplier + percentageFee;
    return Math.min(fee, 20);
  }
}