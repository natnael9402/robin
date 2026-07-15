import { Trade } from './trade.entity';

export type TradeDirection = 'buy' | 'sell';
export type TradeStatus = 'OPEN' | 'CLOSED';
export type TradeOutcome = 'WIN' | 'LOSS';

export interface TradeResult {
  status: TradeOutcome;
  profit: number;
  payout: number;
  balance: number;
  tradingBalance: number;
}

export const VALID_DURATIONS: readonly number[] = [30, 60, 120, 240] as const;
export const MIN_TRADE_AMOUNT = 10;
export const FALLBACK_PRICE = 100_000;

export const YIELD_TIERS: ReadonlyArray<{ minAmount: number; yield: number }> = [
  { minAmount: 40_000, yield: 0.4 },
  { minAmount: 20_000, yield: 0.3 },
  { minAmount: 5_000, yield: 0.2 },
  { minAmount: 0, yield: 0.15 },
];

export function yieldFor(amount: number): number {
  return (YIELD_TIERS.find((t) => amount >= t.minAmount) ?? YIELD_TIERS[YIELD_TIERS.length - 1]).yield;
}

export function profitFor(amount: number, yieldPct: number): number {
  return Number((Number(amount) * yieldPct).toFixed(2));
}

export function payoutFor(amount: number, yieldPct: number, isWin: boolean): number {
  return isWin ? Number(amount) + profitFor(amount, yieldPct) : 0;
}

export function isWinner(strike: number, end: number): boolean {
  return end > strike;
}

export function buildResult(trade: Trade, userBalance: number, userTradingBalance: number): TradeResult {
  const isWin = trade.result === 'won';
  const option = trade.options?.[0];
  const yieldPct = option ? Number(option.returnRate) / 100 : 0;
  const profit = isWin ? profitFor(Number(trade.amount), yieldPct) : 0;
  const payout = isWin ? Number(trade.amount) + profit : 0;
  const status: TradeOutcome = isWin ? 'WIN' : 'LOSS';
  return { status, profit, payout, balance: userBalance, tradingBalance: userTradingBalance };
}

export function normalizeSymbol(input: string): string {
  return input.replace('/USD', '').replace('/USDT', '').toUpperCase();
}
