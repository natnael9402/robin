import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAsset } from './user-asset.entity';
import { User } from '../users/user.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(UserAsset)
        private assetRepo: Repository<UserAsset>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Transaction)
        private txRepo: Repository<Transaction>,
    ) { }

    async getPortfolio(userId: number) {
        return this.assetRepo.find({ where: { user: { id: userId } } });
    }

    async buyAsset(userId: number, symbol: string, type: 'crypto' | 'stock', amount: number, price: number, name: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const cost = amount * price;
        if (user.balance < cost) throw new BadRequestException('Insufficient balance');

        user.balance = Number(user.balance) - cost;
        await this.userRepo.save(user);

        let asset = await this.assetRepo.findOne({ where: { user: { id: userId }, symbol } });

        if (asset) {
            // Calculate new avg price
            const totalValue = (Number(asset.amount) * Number(asset.avgPurchasePrice)) + cost;
            const totalAmount = Number(asset.amount) + amount;
            asset.avgPurchasePrice = totalValue / totalAmount;
            asset.amount = totalAmount;
        } else {
            asset = this.assetRepo.create({
                user,
                symbol,
                name,
                amount,
                avgPurchasePrice: price,
            });
        }


        const result = await this.assetRepo.save(asset);

        // Log Transaction
        await this.txRepo.save(this.txRepo.create({
            user,
            type: 'buy',
            amount: cost,
            description: `Bought ${amount} ${symbol}`,
            currency: 'USD',
            balance: Number(user.balance),
        }));

        return result;
    }

    async sellAsset(userId: number, symbol: string, amount: number, price: number, name?: string, type?: 'crypto' | 'stock') {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        // Don't error if asset missing
        let asset = await this.assetRepo.findOne({ where: { user: { id: userId }, symbol } });

        if (!user) throw new BadRequestException('User not found');

        // Create asset if missing (for Shorting)
        if (!asset) {
            asset = this.assetRepo.create({
                user,
                symbol,
                name: name || symbol,
                amount: 0,
                avgPurchasePrice: price,
            });
        }

        const revenue = amount * price;

        // MARGIN CHECK: If Shorting (current amount <= 0), require collateral
        // We require 1x collateral (Balance >= Trade Value)
        if (Number(asset.amount) <= 0) {
            if (Number(user.balance) < revenue) {
                throw new BadRequestException('Insufficient collateral for Short position');
            }
        }

        user.balance = Number(user.balance) + revenue;
        await this.userRepo.save(user);

        // Update asset
        asset.amount = Number(asset.amount) - amount;

        // If it goes negative, we keep it (Short Position). 
        // Only remove if EXACTLY 0
        if (asset.amount === 0) {
            await this.assetRepo.remove(asset);
        } else {
            await this.assetRepo.save(asset);
        }

        // Log Transaction
        await this.txRepo.save(this.txRepo.create({
            user,
            type: 'sell',
            amount: revenue,
            description: `Sold ${amount} ${symbol} (Short)`,
            currency: 'USD',
            balance: Number(user.balance),
        }));

        return { message: 'Asset sold/shorted successfully' };
    }
}
