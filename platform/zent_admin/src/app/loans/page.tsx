'use client';

import { useEffect, useState } from 'react';
import { getPendingLoans, approveLoan, rejectLoan } from '@/lib/api';
import { Check, X, Landmark, User, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ActionButtons } from '@/shared/components/ui/ActionButtons';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { formatDate } from '@/shared/lib/utils';

interface LoanCardProps {
  loan: any;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function LoanCard({ loan, onApprove, onReject }: LoanCardProps) {
  return (
    <Card padding="lg" className="shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <User size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{loan.user?.name || 'Unknown'}</h3>
            <p className="text-xs text-muted-foreground">{loan.user?.email}</p>
          </div>
        </div>
        <StatusBadge status="pending" dot />
      </div>

      <div className="space-y-3 mb-6 bg-surface-hover p-3 rounded-lg border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Amount</p>
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <DollarSign size={16} className="text-success" />
              {Number(loan.amount).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Interest (5%)</p>
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              ${Number(loan.interest).toLocaleString()}
            </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Due Date</p>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar size={14} className="text-muted-foreground" />
            {formatDate(loan.dueDate) || 'N/A'}
          </div>
        </div>
      </div>

      <ActionButtons
        onApprove={() => onApprove(loan.id)}
        onReject={() => onReject(loan.id)}
        approveIcon={<Check size={16} />}
        rejectIcon={<X size={16} />}
      />
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border-light border-dashed">
      <Landmark className="w-12 h-12 text-zinc-300 mb-4" />
      <p className="text-muted-foreground font-medium">No pending loan applications</p>
    </div>
  );
}

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    setLoading(true);
    getPendingLoans()
      .then(setLoans)
      .catch((err) => {
        console.error(err);
        alert('Failed to load pending loans');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this loan? Funds will be added to the user\'s balance.')) return;
    try {
      await approveLoan(id);
      fetchLoans();
    } catch (error: any) {
      alert(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this loan application?')) return;
    try {
      await rejectLoan(id);
      fetchLoans();
    } catch (error: any) {
      alert(error.message || 'Failed to reject');
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4 lg:p-8 lg:pt-16">
        <PageHeader
          title="Loan Applications"
          subtitle="Review and manage loan requests"
          badge={
            <StatusBadge status="pending" size="sm">
              {loans.length} Pending
            </StatusBadge>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : loans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}