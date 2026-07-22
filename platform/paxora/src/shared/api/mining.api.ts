import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { MiningPlan, UserMining } from '../types';

const http = createHttpClient(config.apiUrl);

function normalizePlan(item: any): MiningPlan {
  return {
    id: Number(item.id),
    name: item.name,
    minAmount: Number(item.min_amount ?? item.minAmount),
    maxAmount: Number(item.max_amount ?? item.maxAmount),
    dailyRate: Number(item.daily_rate ?? item.dailyRate),
    durationDays: Number(item.days ?? item.durationDays),
    hashPower: item.hashrate ?? item.hashPower ?? '',
    power: item.power ?? '',
    networkType: item.network_type ?? item.networkType ?? '',
    isActive: item.is_active ?? item.isActive ?? true,
  };
}

function normalizeHosting(item: any): UserMining {
  const status = item.status ?? (item.active === true ? 'running' : 'ended');
  return {
    id: Number(item.id),
    planId: Number(item.product_id ?? item.planId),
    amount: Number(item.amount),
    currency: item.currency || 'USDT',
    startDate: item.start_date ?? item.created_at ?? item.startDate ?? '',
    endDate: item.end_date ?? item.endDate ?? '',
    active: status === 'running' || status === 'paused',
    status: status as UserMining['status'],
    totalEarned: Number(item.total_earned ?? item.totalEarned ?? 0),
    plan: item.product ? normalizePlan(item.product) : undefined,
  };
}

export const miningApi = {
  getPlans: () =>
    http.get<any>('/mining/products').then((res) => {
      const data = res.data ?? res;
      return Array.isArray(data) ? data.map(normalizePlan) : [];
    }),

  host: (planId: number, amount: number) =>
    http.post<any>('/mining/hostings', { product_id: planId, amount, currency: 'USDT' }).then((res) => {
      const data = res.data ?? res;
      const hosting = data.hosting ?? data;
      return normalizeHosting(hosting);
    }),

  getMyMining: () =>
    http.get<any>('/mining/hostings').then((res) => {
      const data = res.data ?? res;
      return Array.isArray(data) ? data.map(normalizeHosting) : [];
    }),

  getActive: () =>
    http.get<any>('/mining/hostings').then((res) => {
      const data = res.data ?? res;
      return Array.isArray(data) ? data.map(normalizeHosting) : [];
    }),

  cancelHosting: (id: number) =>
    http.post<any>(`/mining/hostings/${id}/cancel`).then((res) => {
      const data = res.data ?? res;
      return {
        hosting: normalizeHosting(data.hosting ?? data),
        refundAmount: Number(data.refundAmount ?? 0),
        newBalance: Number(data.newBalance ?? 0),
      };
    }),

  pauseHosting: (id: number) =>
    http.post<any>(`/mining/hostings/${id}/pause`).then((res) => {
      const data = res.data ?? res;
      return {
        hosting: normalizeHosting(data.hosting ?? data),
      };
    }),

  resumeHosting: (id: number) =>
    http.post<any>(`/mining/hostings/${id}/resume`).then((res) => {
      const data = res.data ?? res;
      return {
        hosting: normalizeHosting(data.hosting ?? data),
      };
    }),

  getStats: () =>
    http.get<any>('/mining/stats').then((res) => {
      const data = res.data ?? res;
      return {
        totalInvested: Number(data.totalInvested ?? 0),
        totalEarned: Number(data.totalEarned ?? 0),
        activeHostings: Number(data.activeHostings ?? 0),
        pausedHostings: Number(data.pausedHostings ?? 0),
      };
    }),

  getProfits: () =>
    http.get<any>('/mining/profits').then((res) => {
      const data = res.data ?? res;
      return Array.isArray(data) ? data.map((item: any) => ({
        id: Number(item.id),
        type: item.type,
        amount: Number(item.amount),
        balance: Number(item.balance),
        createdAt: item.created_at ?? '',
      })) : [];
    }),
};
