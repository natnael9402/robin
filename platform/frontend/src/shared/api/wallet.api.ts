import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { BalancesResponse, Transaction, TransferPayload } from '../types';

const http = createHttpClient(config.apiUrl);

export const walletApi = {
  deposit: (amount: number, network: string, proofImage?: File) => {
    const formData = new FormData();
    formData.append('currency', 'USDT');
    formData.append('amount', String(amount));
    formData.append('paymentMethod', network);
    if (proofImage) {
      formData.append('proof_image', proofImage);
    }
    return http.post<Transaction>('/deposit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeoutMs: 120_000,
    });
  },
  withdraw: (amount: number, network: string, walletAddress: string, withdrawPassword?: string) =>
    http.post<Transaction>('/withdrawals', {
      currency: 'USDT',
      amount,
      network,
      walletAddress,
      withdrawalPassword: withdrawPassword,
    }),
  getTransactions: () =>
    http.get<{ data: Transaction[]; pagination: any }>('/transactions')
      .then((res: any) => (Array.isArray(res) ? res : res?.data ?? [])),
  transfer: (payload: TransferPayload) =>
    http.post<void>('/transfer', payload),
  loadFromMain: (to: string, amount: number) =>
    http.post<void>('/transfer/from-main', { to, amount }),
  transferToMain: (from: 'spot' | 'trading' | 'fast_trade', amount: number) =>
    http.post<void>('/transfer/to-main', { from, amount }),
  getBalances: () =>
    http.get<BalancesResponse>('/users/balances'),
};