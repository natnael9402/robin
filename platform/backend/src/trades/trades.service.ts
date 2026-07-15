import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TradesRepository } from './trades.repository';
import { MarketDataService } from '../shared/providers/market-data.service';
import { Trade } from './trade.entity';
import { TradeContract } from './trade-contract.entity';
import { TradeOption } from './trade-option.entity';
import { TradeSpot } from './trade-spot.entity';
import { User } from '../users/user.entity';

@Injectable()
export class TradesService {
  private readonly logger = new Logger(TradesService.name);

  constructor(
    private readonly repo: TradesRepository,
    private readonly market: MarketDataService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async startOptionTrade(userId: number, data: { symbol: string; direction: 'buy' | 'sell'; amount: number; duration: number }) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const { symbol, direction, amount, duration } = data;
    const strikePrice = await this.fetchStrikePrice(symbol);

    if (amount < 10) throw new BadRequestException('Minimum trade amount is $10');
    if (![30, 60, 120, 180, 240, 300].includes(duration)) throw new BadRequestException('Invalid duration');

    const yieldPct = this.getYieldForAmount(amount);

    user.tradingBalance = Number(user.tradingBalance) - amount;
    await this.repo.saveUser(user);

    const trade = await this.repo.createTrade(user, {
      symbol,
      type: 'option',
      direction,
      amount,
      entryPrice: strikePrice,
      status: 'open',
      result: null,
      pnl: 0,
      fee: 0,
      options: [{
        duration,
        returnRate: yieldPct,
        expectedReturn: amount + (amount * yieldPct / 100),
      }],
    });

    return trade;
  }

  async startContractTrade(userId: number, data: { symbol: string; direction: 'buy' | 'sell'; amount: number; leverage: number; takeProfit?: number; stopLoss?: number }) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const { symbol, direction, amount, leverage, takeProfit, stopLoss } = data;
    const entryPrice = await this.fetchStrikePrice(symbol);

    if (amount < 10) throw new BadRequestException('Minimum trade amount is $10');
    if (![2, 5, 10, 20, 50, 100, 125].includes(leverage)) throw new BadRequestException('Invalid leverage');

    const fee = amount * 0.02;
    const totalDeduction = amount + fee;
    if (Number(user.balance) < totalDeduction) throw new BadRequestException('Insufficient balance');

    user.balance = Number(user.balance) - totalDeduction;
    await this.repo.saveUser(user);

    const quantity = (amount * leverage) / entryPrice;
    const liquidationPrice = direction === 'buy'
      ? entryPrice * (1 - 1 / leverage)
      : entryPrice * (1 + 1 / leverage);

    const trade = await this.repo.createTrade(user, {
      symbol,
      type: 'contract',
      direction,
      amount,
      entryPrice,
      fee,
      status: 'open',
      result: null,
      pnl: 0,
      contracts: [{
        quantity,
        leverage,
        liquidationPrice,
        takeProfit: takeProfit ?? null,
        stopLoss: stopLoss ?? null,
      }],
    });

    return trade;
  }

  async startSpotTrade(userId: number, data: { symbol: string; direction: 'buy' | 'sell'; amount: number; fromCoin: string; toCoin: string }) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const { symbol, direction, amount, fromCoin, toCoin } = data;
    const entryPrice = await this.fetchStrikePrice(symbol);

    if (amount < 10) throw new BadRequestException('Minimum trade amount is $10');

    const fee = amount * 0.02;
    const totalDeduction = amount + fee;

    if (fromCoin === 'USDT') {
      if (Number(user.balance) < totalDeduction) throw new BadRequestException('Insufficient USDT balance');
      user.balance = Number(user.balance) - totalDeduction;
    } else {
      const asset = await this.repo.findAsset(userId, fromCoin);
      if (!asset || Number(asset.amount) < amount) throw new BadRequestException(`Insufficient ${fromCoin} balance`);
      asset.amount = Number(asset.amount) - amount;
      await this.repo.saveAsset(asset);
      if (Number(user.balance) < fee) throw new BadRequestException('Insufficient USDT balance for fee');
      user.balance = Number(user.balance) - fee;
    }
    await this.repo.saveUser(user);

    const exchangeRate = fromCoin === 'USDT' ? 1 / entryPrice : entryPrice;
    const quantity = amount * exchangeRate;

    const trade = await this.repo.createTrade(user, {
      symbol,
      type: 'spot',
      direction,
      amount,
      entryPrice,
      fee,
      exchangeRate,
      fromCoin,
      toCoin,
      status: 'closed',
      result: 'completed',
      pnl: 0,
      spots: [{
        quantity,
        marketPrice: entryPrice,
        exchangeRate,
        fromCoin,
        toCoin,
      }],
    });

    const targetAsset = await this.repo.findAsset(userId, toCoin);
    if (targetAsset) {
      targetAsset.amount = Number(targetAsset.amount) + quantity;
      targetAsset.currentPrice = entryPrice;
      targetAsset.currentValue = Number(targetAsset.amount) * entryPrice;
      targetAsset.avgPurchasePrice = (Number(targetAsset.avgPurchasePrice) * (Number(targetAsset.amount) - quantity) + entryPrice * quantity) / Number(targetAsset.amount);
      await this.repo.saveAsset(targetAsset);
    } else {
      await this.repo.createAsset({
        userId,
        symbol: toCoin,
        name: toCoin,
        amount: quantity,
        currentPrice: entryPrice,
        currentValue: quantity * entryPrice,
        avgPurchasePrice: entryPrice,
      });
    }

    return trade;
  }

  async resolveOptionTrade(userId: number, tradeId: number): Promise<Trade> {
    const trade = await this.repo.findById(tradeId);
    if (!trade) throw new BadRequestException('Trade not found');
    if (trade.userId !== userId) throw new BadRequestException('Unauthorized');
    if (trade.status === 'closed') return trade;
    if (trade.type !== 'option' || !trade.options?.[0]) throw new BadRequestException('Not an option trade');

    const option = trade.options[0];
    const endPrice = await this.fetchStrikePrice(trade.symbol);

    const userMode = trade.user?.tradeMode as 'REAL' | 'ALWAYS_WIN' | 'ALWAYS_LOSS' | undefined;
    const isWin = userMode === 'ALWAYS_WIN' ? true :
      userMode === 'ALWAYS_LOSS' ? false :
      endPrice > Number(trade.entryPrice);

    trade.exitPrice = endPrice;
    trade.status = 'closed';
    trade.result = isWin ? 'won' : 'lost';
    trade.closedAt = new Date();

    const payout = isWin ? Number(trade.amount) + (Number(trade.amount) * Number(option.returnRate) / 100) : 0;
    trade.pnl = isWin ? payout - Number(trade.amount) : -Number(trade.amount);

    await this.repo.save(trade);

    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const remainingTrading = Number(user.tradingBalance);
    user.balance = Number(user.balance) + payout + remainingTrading;
    user.tradingBalance = 0;
    await this.repo.saveUser(user);

    return trade;
  }

  async transferToTrading(userId: number, amount: number): Promise<{ tradingBalance: number }> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (Number(user.balance) < amount) throw new BadRequestException('Insufficient balance');
    user.balance = Number(user.balance) - amount;
    user.tradingBalance = Number(user.tradingBalance) + amount;
    await this.repo.saveUser(user);
    return { tradingBalance: Number(user.tradingBalance) };
  }

  async getTradingBalance(userId: number): Promise<{ tradingBalance: number }> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');
    return { tradingBalance: Number(user.tradingBalance) };
  }

  async getTrades(userId: number) {    return this.repo.findByUser(userId);
  }

  async getActiveTrades(userId: number) {
    return this.repo.findActiveByUser(userId);
  }

  async forceOutcome(tradeId: number, outcome: 'WIN' | 'LOSS') {
    const trade = await this.repo.findById(tradeId);
    if (!trade) throw new BadRequestException('Trade not found');
    if (trade.status !== 'open') throw new BadRequestException('Trade not open');

    trade.result = outcome === 'WIN' ? 'won' : 'lost';
    trade.status = 'closed';
    trade.closedAt = new Date();

    if (outcome === 'WIN') {
      const profit = Number(trade.amount) * 0.5;
      trade.pnl = profit;
      trade.user.balance = Number(trade.user.balance) + Number(trade.amount) + profit;
      await this.repo.saveUser(trade.user);
    } else {
      trade.pnl = -Number(trade.amount);
    }

    return this.repo.save(trade);
  }

  private getYieldForAmount(amount: number): number {
    if (amount >= 40000) return 40;
    if (amount >= 20000) return 30;
    if (amount >= 5000) return 20;
    return 15;
  }

  private async fetchStrikePrice(symbol: string): Promise<number> {
    const normalized = symbol.replace('/USD', '').replace('/USDT', '').toUpperCase();
    const cacheKey = `strike_price_${normalized}`;

    const cached = await this.cache.get<number>(cacheKey);
    if (cached) return cached;

    try {
      const stock = await this.market.getStockDetail(normalized);
      if (stock?.price) {
        await this.cache.set(cacheKey, stock.price, 15_000);
        return stock.price;
      }
      const crypto = await this.market.getCryptoDetail(normalized.toLowerCase());
      if (crypto?.market_data?.current_price?.usd) {
        const price = crypto.market_data.current_price.usd;
        await this.cache.set(cacheKey, price, 15_000);
        return price;
      }
    } catch (err) {
      this.logger.warn(`fetchStrikePrice(${normalized}) failed: ${(err as Error).message}`);
    }
    return 100000;
  }
}