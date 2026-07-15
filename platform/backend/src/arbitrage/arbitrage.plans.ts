export interface ArbitragePlanDef {
  code: string;
  name: string;
  dailyRate: number;
  durationDays: number;
  min: number;
  max: number;
}

export const ARBITRAGE_PLANS: ReadonlyArray<ArbitragePlanDef> = [
  { code: 'A100', name: 'A100 Starter', dailyRate: 0.5, durationDays: 3, min: 50, max: 499 },
  { code: 'H200', name: 'H200 Advanced', dailyRate: 0.87, durationDays: 3, min: 500, max: 2499 },
  { code: 'GH350', name: 'GH350 Pro', dailyRate: 0.99, durationDays: 3, min: 2500, max: 9999 },
  { code: 'V8', name: 'V8 Turbo', dailyRate: 1.41, durationDays: 14, min: 10000, max: 49999 },
  { code: 'V12', name: 'V12 Elite', dailyRate: 1.56, durationDays: 15, min: 50000, max: 149999 },
  { code: 'V16', name: 'V16 Institutional', dailyRate: 1.62, durationDays: 20, min: 150000, max: 1000000 },
];

export function findPlan(code: string): ArbitragePlanDef | undefined {
  return ARBITRAGE_PLANS.find((p) => p.code === code);
}
