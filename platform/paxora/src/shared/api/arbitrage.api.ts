import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { ArbitragePlan, ArbitrageHosting } from '../types';

const http = createHttpClient(config.apiUrl);

function normalizeHosting(item: any): ArbitrageHosting {
  return {
    id: Number(item.id),
    planCode: item.product?.name || item.planCode || item.plan_code,
    amount: Number(item.amount),
    currency: item.currency,
    startDate: item.created_at || item.startDate || item.start_date,
    endDate: item.end_date || item.endDate || item.end_date,
    active: item.status === 'running' || item.active,
    status: (item.status as ArbitrageHosting['status']) || (item.active ? 'running' : 'ended'),
  };
}

export const arbitrageApi = {
  getPlans: () =>
    http.get<any>('/arbitrage/products').then((res) => {
      const data = res.data || res;
      return Array.isArray(data)
        ? data.map((item: any) => ({
            id: Number(item.id),
            name: item.name,
            code: item.name,
            minAmount: Number(item.min_amount),
            maxAmount: Number(item.max_amount),
            dailyRate: Number(item.daily_rate),
            durationDays: Number(item.days),
          }))
        : [];
    }),
  startHosting: (planId: string | number, amount: number, currency = 'USDT') =>
    http.post<any>('/arbitrage/hostings', { product_id: Number(planId), amount, currency }).then((res) => {
      const data = res.data || res;
      return normalizeHosting(data);
    }),
  myHostings: () =>
    http.get<any>('/arbitrage/hostings').then((res) => {
      const data = res.data || res;
      return Array.isArray(data) ? data.map(normalizeHosting) : [];
    }),
  cancelHosting: (id: number) =>
    http.post<any>(`/arbitrage/hostings/${id}/cancel`).then((res) => {
      const data = res.data ?? res;
      return {
        hosting: normalizeHosting(data.hosting ?? data),
        refundAmount: Number(data.refund_amount ?? data.refundAmount ?? 0),
        newBalance: Number(data.new_balance ?? data.newBalance ?? 0),
      };
    }),
};
