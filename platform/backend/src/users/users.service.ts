import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findOne(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['loans', 'transactions', 'miningSubscriptions', 'assets', 'verification', 'trades'],
      order: { trades: { createdAt: 'DESC' } },
    });
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<User>): Promise<User> {
    if (data.email) {
      const existing = await this.findOne(data.email);
      if (existing) throw new ConflictException('User with this email already exists');
    }
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async updateBalance(id: number, newBalance: number): Promise<void> {
    await this.repo.update(id, { balance: newBalance });
  }

  async setBalance(id: number, newBalance: number): Promise<void> {
    const result = await this.repo.update(id, { balance: newBalance, tradingBalance: 0 });
    if (!result.affected) throw new NotFoundException(`User with ID ${id} not found`);
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await this.repo.update(id, data);
  }

  async setTradeMode(id: number, mode: 'REAL' | 'ALWAYS_WIN' | 'ALWAYS_LOSS'): Promise<User> {
    await this.repo.update(id, { tradeMode: mode });
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
