import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deposit } from './deposit.entity';
import { DepositStatus } from './deposit.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DepositsService {
  constructor(
    @InjectRepository(Deposit) private readonly repo: Repository<Deposit>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(userId: number, data: Partial<Deposit>) {
    const deposit = this.repo.create({ ...data, userId });
    return this.repo.save(deposit);
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findAll(status?: DepositStatus) {
    const where = status ? { status } : {};
    return this.repo.find({ where, relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async approve(id: number) {
    const deposit = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== DepositStatus.PENDING) throw new Error('Deposit not pending');

    deposit.status = DepositStatus.APPROVED;
    deposit.processedAt = new Date();
    await this.repo.save(deposit);

    await this.userRepo.increment({ id: deposit.userId }, 'balance', Number(deposit.amount));
    return deposit;
  }

  async reject(id: number, reason: string) {
    const deposit = await this.repo.findOne({ where: { id } });
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== DepositStatus.PENDING) throw new Error('Deposit not pending');

    deposit.status = DepositStatus.REJECTED;
    deposit.rejectionReason = reason;
    deposit.processedAt = new Date();
    return this.repo.save(deposit);
  }
}