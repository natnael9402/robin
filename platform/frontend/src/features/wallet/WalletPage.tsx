'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { useWalletData } from './hooks/useWallet';
import { useToast } from '../../shared/contexts/ToastContext';
import { BalanceHeader, TransactionRow } from './components/WalletBits';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { TransferModal } from './components/TransferModal';
import { WalletSuccessModal } from './components/WalletSuccessModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import type { Transaction } from '../../shared/types';

export function WalletPage() {
  useDocumentTitle('Wallet · Paxora Capital');
  const { data, isLoading, refetch } = useWalletData();
  const toast = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [success, setSuccess] = useState<{ open: boolean; type: 'deposit' | 'withdraw'; amount: number }>({
    open: false,
    type: 'deposit',
    amount: 0,
  });

  const balance = data?.balances?.total ?? 0;
  const balances = data?.balances ? { spot: data.balances.spot, trading: data.balances.trading, fast_trade: data.balances.fast_trade, total: data.balances.total } : undefined;

  const handleRefresh = useCallback(async () => {
    const result = await refetch();
    toast.success('Everything up to date');
    return result;
  }, [refetch, toast]);

  // Hide bottom nav & support widget when any modal is open
  const anyModalOpen = depositOpen || withdrawOpen || transferOpen || success.open || !!selectedTx;

  useEffect(() => {
    if (anyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [anyModalOpen]);

  return (
    <div className="fixed inset-0 pt-24 md:pl-64 flex flex-col overflow-hidden z-30 bg-background">
      <div className="flex flex-col flex-1 min-h-0 md:max-w-3xl md:mx-auto w-full">
      {/* Fixed top section */}
      <div className="shrink-0 px-6">
        <BalanceHeader balance={balance} balances={balances} onDeposit={() => setDepositOpen(true)} onWithdraw={() => setWithdrawOpen(true)} onTransfer={() => setTransferOpen(true)} onRefresh={handleRefresh} />
        
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-black tracking-tight text-foreground">Recent Transactions</h2>
        </div>
      </div>
      
      {/* Scrollable transaction list */}
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-6 pb-24 md:pb-10">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <SkeletonList rows={3} />
          ) : (data?.transactions?.length ?? 0) === 0 ? (
            <EmptyState title="No transactions yet" description="Your deposit and withdrawal history will appear here." />
          ) : (
            (data!.transactions as Transaction[]).map((tx) => <TransactionRow key={tx.id} tx={tx} onClick={setSelectedTx} />)
          )}
        </div>
      </div>
      </div>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={(amount) => {
          setDepositOpen(false);
          setSuccess({ open: true, type: 'deposit', amount });
        }}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={(amount) => {
          setWithdrawOpen(false);
          setSuccess({ open: true, type: 'withdraw', amount });
        }}
      />
      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={() => {
          setTransferOpen(false);
          refetch();
        }}
      />
      <WalletSuccessModal
        open={success.open}
        onClose={() => setSuccess((s) => ({ ...s, open: false }))}
        type={success.type}
        amount={success.amount}
      />
      <TransactionDetailsModal
        tx={selectedTx}
        open={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
