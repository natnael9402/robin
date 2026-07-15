import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArbitrageHosting } from './arbitrage-hosting.entity';
import { ArbitrageProduct } from './arbitrage-product.entity';
import { UsersService } from '../users/users.service';
import { ArbitrageHostingStatus } from './arbitrage-product.entity';

@Injectable()
export class ArbitrageService {
  constructor(
    @InjectRepository(ArbitrageHosting) private readonly repo: Repository<ArbitrageHosting>,
    @InjectRepository(ArbitrageProduct) private readonly productRepo: Repository<ArbitrageProduct>,
    private readonly users: UsersService,
  ) {}

  async getPlans() {
    return this.productRepo.find({ where: { isActive: true } });
  }

  async startHosting(userId: number, productId: number, amount: number, currency = 'USDT') {
    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');
    if (!product.isActive) throw new BadRequestException('Product not available');

    const minAmount = Number(product.minAmount);
    const maxAmount = Number(product.maxAmount);
    if (amount < minAmount || amount > maxAmount) throw new BadRequestException(`Amount must be between ${minAmount} and ${maxAmount}`);

    const supported = product.supportedCurrencies ? product.supportedCurrencies.split(',').map(s => s.trim()) : [];
    if (supported.length && !supported.includes(currency)) throw new BadRequestException(`Currency ${currency} not supported`);

    if (Number(user.balance) < amount) throw new BadRequestException('Insufficient funds');

    await this.users.updateBalance(userId, Number(user.balance) - amount);

    const hosting = this.repo.create({
      userId,
      productId,
      amount,
      currency,
      status: ArbitrageHostingStatus.RUNNING,
      startDate: new Date(),
      endDate: new Date(Date.now() + product.days * 24 * 60 * 60 * 1000),
      totalEarned: 0,
    });

    return this.repo.save(hosting);
  }

  findMyHostings(userId: number) {
    return this.repo.find({ where: { userId }, relations: ['product'], order: { createdAt: 'DESC' } });
  }

  findAllHostings() {
    return this.repo.find({ relations: ['user', 'product'], order: { createdAt: 'DESC' } });
  }

  async terminateHosting(id: number) {
    const hosting = await this.repo.findOne({ where: { id }, relations: ['user', 'product'] });
    if (!hosting) throw new NotFoundException('Hosting not found');
    if (hosting.status !== ArbitrageHostingStatus.RUNNING) throw new BadRequestException('Already processed');

    hosting.status = ArbitrageHostingStatus.ENDED;
    hosting.endDate = new Date();
    await this.repo.save(hosting);

    const user = await this.users.findById(hosting.userId);
    if (!user) throw new NotFoundException('User not found');
    user.balance = Number(user.balance) + Number(hosting.amount) + Number(hosting.totalEarned);
    await this.users.updateBalance(user.id, user.balance);

    return hosting;
  }

  async cancelHosting(id: number, userId: number) {
    const hosting = await this.repo.findOne({ where: { id }, relations: ['product'] });
    if (!hosting) throw new NotFoundException('Hosting not found');
    if (hosting.userId !== userId) throw new BadRequestException('Unauthorized');
    if (hosting.status !== ArbitrageHostingStatus.RUNNING) throw new BadRequestException('Only running hostings can be cancelled');

    const daysElapsed = Math.floor((Date.now() - hosting.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = hosting.product.days;
    const refundPercentage = Math.max(0, (totalDays - daysElapsed) / totalDays);
    const refundAmount = Number(hosting.amount) * refundPercentage * 0.9;

    hosting.status = ArbitrageHostingStatus.CANCELLED;
    hosting.endDate = new Date();
    await this.repo.save(hosting);

    if (refundAmount > 0) {
      const user = await this.users.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      user.balance = Number(user.balance) + refundAmount;
      await this.users.updateBalance(user.id, user.balance);
    }

    return { hosting, refundAmount };
  }

  async processPendingProfits(id: number) {
    const hosting = await this.repo.findOne({ where: { id }, relations: ['product'] });
    if (!hosting) throw new NotFoundException('Hosting not found');
    if (hosting.status !== ArbitrageHostingStatus.RUNNING) throw new BadRequestException('Not running');

    const lastProfit = hosting.lastProfitDate || hosting.startDate;
    const endDate = hosting.endDate || new Date();
    const now = new Date();
    const effectiveEnd = endDate < now ? endDate : now;
    const daysSinceLastProfit = Math.floor((effectiveEnd.getTime() - new Date(lastProfit).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastProfit <= 0) return { totalProfit: 0, hosting };

    const dailyProfit = Number(hosting.amount) * (Number(hosting.product.dailyRate) / 100);
    const totalProfit = dailyProfit * daysSinceLastProfit;

    if (totalProfit > 0) {
      const user = await this.users.findById(hosting.userId);
      if (!user) throw new NotFoundException('User not found');
      user.balance = Number(user.balance) + totalProfit;
      await this.users.updateBalance(user.id, user.balance);

      hosting.totalEarned = Number(hosting.totalEarned) + totalProfit;
      hosting.lastProfitDate = effectiveEnd;
      await this.repo.save(hosting);
    }

    return { totalProfit, hosting };
  }

  async finalizeHosting(id: number) {
    const hosting = await this.repo.findOne({ where: { id }, relations: ['product'] });
    if (!hosting) throw new NotFoundException('Hosting not found');
    if (hosting.status !== ArbitrageHostingStatus.RUNNING) throw new BadRequestException('Not running');

    const endDate = hosting.endDate || new Date();
    if (new Date() < endDate) throw new BadRequestException('Not due yet');

    await this.processPendingProfits(id);

    hosting.status = ArbitrageHostingStatus.ENDED;
    hosting.endDate = endDate;
    await this.repo.save(hosting);

    const user = await this.users.findById(hosting.userId);
    if (!user) throw new NotFoundException('User not found');
    user.balance = Number(user.balance) + Number(hosting.amount) + Number(hosting.totalEarned);
    await this.users.updateBalance(user.id, user.balance);

    return hosting;
  }
}