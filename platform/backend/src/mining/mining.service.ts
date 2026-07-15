import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiningPlan } from './mining-plan.entity';
import { UserMining } from './user-mining.entity';
import { User } from '../users/user.entity';
import { MiningHostingStatus } from './mining-plan.entity';

@Injectable()
export class MiningService implements OnModuleInit {
    constructor(
        @InjectRepository(MiningPlan)
        private plansRepo: Repository<MiningPlan>,
        @InjectRepository(UserMining)
        private userMiningRepo: Repository<UserMining>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedPlans();
        setInterval(() => this.processPayouts(), 60000);
    }

    async seedPlans() {
        const plans = [
            { id: 100, name: 'Starter CPU Node', minAmount: 50, maxAmount: 1000, dailyRate: 1.2, days: 14, power: '150W', networkType: 'XMR', limitTimes: 10, hashrate: '15 KH/s' },
            { id: 101, name: 'S3 Miner', minAmount: 1000, maxAmount: 5000, dailyRate: 1.88, days: 30, power: '850W', networkType: 'ETH', limitTimes: 3, hashrate: '100 MH/s' },
            { id: 105, name: 'RTX 4090 Rig', minAmount: 5000, maxAmount: 20000, dailyRate: 1.95, days: 45, power: '1200W', networkType: 'SOL', limitTimes: 2, hashrate: '300 MH/s' },
            { id: 108, name: 'Antminer S21 Hydro', minAmount: 20000, maxAmount: 100000, dailyRate: 2.5, days: 90, power: '5360W', networkType: 'BTC', limitTimes: 1, hashrate: '335 TH/s' },
            { id: 112, name: 'Liquid Immersion Tank', minAmount: 100000, maxAmount: 500000, dailyRate: 2.8, days: 120, power: '4500W', networkType: 'BTC', limitTimes: 1, hashrate: '400 TH/s' },
        ];

        for (const plan of plans) {
            const existing = await this.plansRepo.findOne({ where: { id: plan.id } });
            if (!existing) {
                await this.plansRepo.save(plan);
            }
        }
    }

    async processPayouts() {
        const activeMiners = await this.userMiningRepo.find({
            where: { status: MiningHostingStatus.RUNNING },
            relations: ['user', 'plan']
        });

        for (const miner of activeMiners) {
            if (miner.endDate && new Date() > miner.endDate) {
                miner.status = MiningHostingStatus.ENDED;
                miner.user.balance = Number(miner.user.balance) + Number(miner.amount) + Number(miner.totalEarned);
                await this.userRepo.save(miner.user);
                await this.userMiningRepo.save(miner);
                continue;
            }

            const dailyRate = Number(miner.plan.dailyRate);
            const investment = Number(miner.amount);
            const earnings = (investment * (dailyRate / 100)) / (24 * 60);

            miner.user.balance = Number(miner.user.balance) + earnings;
            miner.totalEarned = Number(miner.totalEarned) + earnings;

            await this.userRepo.save(miner.user);
            await this.userMiningRepo.save(miner);
        }
    }

    async getPlans() {
        return this.plansRepo.find({ where: { isActive: true } });
    }

    async subscribe(userId: number, planId: number, amount: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const plan = await this.plansRepo.findOne({ where: { id: planId } });

        if (!user) throw new NotFoundException('User not found');
        if (!plan) throw new NotFoundException('Plan not found');

        const existingCount = await this.userMiningRepo.count({
            where: { userId, productId: planId, status: MiningHostingStatus.RUNNING }
        });

        if (existingCount >= plan.limitTimes) throw new BadRequestException('Max purchases reached for this plan');

        const investAmount = Number(amount);
        if (investAmount < Number(plan.minAmount) || investAmount > Number(plan.maxAmount)) {
            throw new BadRequestException(`Amount must be between ${plan.minAmount} and ${plan.maxAmount}`);
        }

        if (Number(user.balance) < investAmount) throw new BadRequestException('Insufficient balance');

        user.balance = Number(user.balance) - investAmount;
        await this.userRepo.save(user);

        const subscription = this.userMiningRepo.create({
            userId,
            productId: plan.id,
            amount: investAmount,
            currency: 'USDT',
            status: MiningHostingStatus.RUNNING,
            startDate: new Date(),
            endDate: new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000),
            totalEarned: 0,
        });

        return this.userMiningRepo.save(subscription);
    }

    async getMyMining(userId: number) {
        return this.userMiningRepo.find({
            where: { userId },
            relations: ['plan'],
            order: { startDate: 'DESC' }
        });
    }

    async getActiveMinersForUser(userId: number) {
        return this.userMiningRepo.find({
            where: { userId, status: MiningHostingStatus.RUNNING },
            relations: ['plan']
        });
    }

    async getAllMiners() {
        return this.userMiningRepo.find({
            relations: ['user', 'plan'],
            order: { startDate: 'DESC' }
        });
    }

    async stopMiner(id: number) {
        const miner = await this.userMiningRepo.findOne({ where: { id }, relations: ['plan'] });
        if (!miner) throw new NotFoundException('Miner not found');
        miner.status = MiningHostingStatus.CANCELLED;
        const daysElapsed = Math.floor((Date.now() - miner.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = miner.plan.days;
        const refundPercentage = Math.max(0, (totalDays - daysElapsed) / totalDays);
        const refundAmount = Number(miner.amount) * refundPercentage * 0.9;
        if (refundAmount > 0) {
            const user = await this.userRepo.findOne({ where: { id: miner.userId } });
            if (!user) throw new NotFoundException('User not found');
            user.balance = Number(user.balance) + refundAmount;
            await this.userRepo.save(user);
        }
        return this.userMiningRepo.save(miner);
    }
}