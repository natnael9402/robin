import type { MiningPlan } from '../../../shared/types';

export const FALLBACK_MINING_PLANS: MiningPlan[] = [
  { id: 100, name: 'Starter CPU Node', minAmount: 50, maxAmount: 1000, dailyRate: 1.2, durationDays: 7, power: '150W', networkType: 'XMR', hashPower: '15 KH/s', isActive: true },
  { id: 101, name: 'S3 Miner', minAmount: 1000, maxAmount: 5000, dailyRate: 1.88, durationDays: 30, power: '850W', networkType: 'ETH', hashPower: '100 MH/s', isActive: true },
  { id: 102, name: 'MS3 Pro', minAmount: 5000, maxAmount: 20000, dailyRate: 1.9, durationDays: 40, power: '3188W', networkType: 'ETH', hashPower: '500 MH/s', isActive: true },
  { id: 103, name: '460S Plus', minAmount: 20000, maxAmount: 50000, dailyRate: 2.0, durationDays: 60, power: '4000W', networkType: 'BTC', hashPower: '2.5 GH/s', isActive: true },
  { id: 104, name: 'Antminer S19', minAmount: 10000, maxAmount: 40000, dailyRate: 1.5, durationDays: 20, power: '3250W', networkType: 'BTC', hashPower: '110 TH/s', isActive: true },
  { id: 105, name: 'RTX 4090 Rig', minAmount: 15000, maxAmount: 60000, dailyRate: 1.95, durationDays: 45, power: '1200W', networkType: 'SOL', hashPower: '300 MH/s', isActive: true },
  { id: 106, name: 'Kaspa KS3', minAmount: 25000, maxAmount: 80000, dailyRate: 2.2, durationDays: 30, power: '3000W', networkType: 'KAS', hashPower: '8.3 TH/s', isActive: true },
  { id: 107, name: 'L7 Scrypt Master', minAmount: 5000, maxAmount: 25000, dailyRate: 1.4, durationDays: 15, power: '3425W', networkType: 'LTC', hashPower: '9.5 GH/s', isActive: true },
  { id: 108, name: 'Antminer S21 Hydro', minAmount: 100000, maxAmount: 500000, dailyRate: 2.5, durationDays: 90, power: '5360W', networkType: 'BTC', hashPower: '335 TH/s', isActive: true },
  { id: 109, name: 'Quantum Rack', minAmount: 500000, maxAmount: 10000000, dailyRate: 3.0, durationDays: 120, power: '15000W', networkType: 'BTC', hashPower: '1.2 PH/s', isActive: true },
  { id: 110, name: 'AI Compute Cluster', minAmount: 50000, maxAmount: 200000, dailyRate: 2.8, durationDays: 60, power: '5000W', networkType: 'AI', hashPower: '500 TFLOPS', isActive: true },
];
