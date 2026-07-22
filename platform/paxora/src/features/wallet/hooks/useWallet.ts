'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, walletApi } from '../../../shared/api';
import { config } from '../../../shared/lib/config';
import type { BalancesResponse, Transaction, TransferPayload, User } from '../../../shared/types';

export function useWalletData() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const [user, transactions, balances] = await Promise.all([
        authApi.getProfile(),
        walletApi.getTransactions(),
        walletApi.getBalances(),
      ]);
      return { user, transactions, balances };
    },
    staleTime: config.staleTime,
  });
}

export function useDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, network, proofImage }: { amount: number; network: string; proofImage?: File }) =>
      walletApi.deposit(amount, network, proofImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      amount,
      network,
      walletAddress,
      withdrawPassword,
    }: {
      amount: number;
      network: string;
      walletAddress: string;
      withdrawPassword?: string;
    }) => walletApi.withdraw(amount, network, walletAddress, withdrawPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function useWithdrawalPinStatus() {
  return useQuery({
    queryKey: ['withdrawal-pin-status'],
    queryFn: () => authApi.getWithdrawalPinStatus(),
    staleTime: 30_000,
  });
}

export function useSetWithdrawalPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => authApi.setWithdrawalPassword(password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawal-pin-status'] });
    },
  });
}

export function useResetWithdrawalPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountPassword, newPin }: { accountPassword: string; newPin: string }) =>
      authApi.resetWithdrawalPassword(accountPassword, newPin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawal-pin-status'] });
    },
  });
}

export function useTransferToMain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ from, amount }: { from: 'spot' | 'trading' | 'fast_trade'; amount: number }) =>
      walletApi.transferToMain(from, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export function useTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => walletApi.transfer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
    },
  });
}

export type { BalancesResponse, Transaction, TransferPayload, User };