import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade } from './trade.entity';
import { TradeContract } from './trade-contract.entity';
import { TradeOption } from './trade-option.entity';
import { TradeSpot } from './trade-spot.entity';
import { UserAsset } from '../assets/user-asset.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TradesRepository {
  constructor(
    @InjectRepository(Trade) private readonly repo: Repository<Trade>,
    @InjectRepository(TradeContract) private readonly contractRepo: Repository<TradeContract>,
    @InjectRepository(TradeOption) private readonly optionRepo: Repository<TradeOption>,
    @InjectRepository(TradeSpot) private readonly spotRepo: Repository<TradeSpot>,
    @InjectRepository(UserAsset) private readonly assetRepo: Repository<UserAsset>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  findById(id: number): Promise<Trade | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'options', 'contracts', 'spots'],
    });
  }

  findByUser(userId: number): Promise<Trade[]> {
    return this.repo.find({
      where: { userId },
      relations: ['options', 'contracts', 'spots'],
      order: { createdAt: 'DESC' },
    });
  }

  findActiveByUser(userId: number): Promise<Trade[]> {
    return this.repo.find({
      where: { userId, status: 'open' },
      relations: ['options', 'contracts', 'spots'],
      order: { createdAt: 'DESC' },
    });
  }

  findAll(): Promise<Trade[]> {
    return this.repo.find({
      relations: ['user', 'options', 'contracts', 'spots'],
      order: { createdAt: 'DESC' },
    });
  }

  save(trade: Trade): Promise<Trade> {
    return this.repo.save(trade);
  }

  async createTrade(user: User, data: Omit<Partial<Trade>, 'options' | 'contracts' | 'spots'> & {
    options?: Partial<TradeOption>[];
    contracts?: Partial<TradeContract>[];
    spots?: Partial<TradeSpot>[];
  }): Promise<Trade> {
    const { options, contracts, spots, ...tradeData } = data;
    const trade = this.repo.create({ ...tradeData, user });
    await this.repo.save(trade);

    if (options?.length) {
      for (const opt of options) {
        const option = this.optionRepo.create({ ...opt, tradeId: trade.id });
        await this.optionRepo.save(option);
      }
    }
    if (contracts?.length) {
      for (const con of contracts) {
        const contract = this.contractRepo.create({ ...con, tradeId: trade.id });
        await this.contractRepo.save(contract);
      }
    }
    if (spots?.length) {
      for (const spot of spots) {
        const s = this.spotRepo.create({ ...spot, tradeId: trade.id });
        await this.spotRepo.save(s);
      }
    }

    return this.findById(trade.id) as Promise<Trade>;
  }

  findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  findAsset(userId: number, symbol: string): Promise<UserAsset | null> {
    return this.assetRepo.findOne({ where: { userId, symbol } });
  }

  saveAsset(asset: UserAsset): Promise<UserAsset> {
    return this.assetRepo.save(asset);
  }

  async createAsset(data: Partial<UserAsset>): Promise<UserAsset> {
    const asset = this.assetRepo.create(data);
    return this.assetRepo.save(asset);
  }
}