export type TradeDirection = 'buy' | 'sell';
export type TradeOutcome = 'WIN' | 'LOSS' | 'SPOT';
export type TradeMode = 'option' | 'spot' | 'contract';

export interface ActiveTrade {
  id: number;
  startTime: number;
  duration: number;
  type: TradeDirection;
  assetSymbol: string;
  initialAmount: number;
  profit: number;
  outcome?: TradeOutcome;
  visualStrikePrice: number;
}

export interface AssetOption {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h_in_currency?: number;
  type: 'crypto' | 'stock' | 'metal';
}

// Must match /ol OPTION_TRADE_RULES or the option trade is rejected.
export const DURATIONS = [30, 60, 90, 120, 180, 300, 700] as const;
export type TradeDuration = (typeof DURATIONS)[number];

export const OPTION_TRADE_RULES: Record<number, { minCapital: number; maxCapital: number; returnRate: number }> = {
  30:  { minCapital: 100,    maxCapital: 5000,   returnRate: 15 },
  60:  { minCapital: 5001,  maxCapital: 20000,  returnRate: 20 },
  90:  { minCapital: 20001, maxCapital: 80000,  returnRate: 25 },
  120: { minCapital: 80001, maxCapital: 120000, returnRate: 28 },
  180: { minCapital: 80001, maxCapital: 200000, returnRate: 30 },
  300: { minCapital: 200001,maxCapital: 300000, returnRate: 35 },
  700: { minCapital: 300001,maxCapital: 500000, returnRate: 40 },
};

export function profitFor(amount: number, duration: number): number {
  const rule = OPTION_TRADE_RULES[duration];
  if (!rule) return 0;
  return Number((amount * rule.returnRate / 100).toFixed(2));
}

export interface IntervalOption {
  value: number;
  label: string;
}

export const TIME_INTERVALS: IntervalOption[] = [
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 900, label: '15m' },
  { value: 1800, label: '30m' },
  { value: 3600, label: '1h' },
  { value: 14400, label: '4h' },
  { value: 86400, label: '1d' },
  { value: 604800, label: '1w' },
  { value: 2592000, label: '1M' },
];
