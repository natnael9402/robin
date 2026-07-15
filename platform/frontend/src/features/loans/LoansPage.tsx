'use client';

import { useRouter } from 'next/navigation';
import { Landmark, ArrowRight, Clock } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { loansApi } from '../../shared/api';
import { config } from '../../shared/lib/config';
import { formatCurrency } from '../../shared/lib/utils';
import { LoanAnimation } from './components/LoanAnimation';
import type { Loan } from '../../shared/types';

function useLoans() {
  return useQuery<Loan[]>({
    queryKey: ['loans', 'my'],
    queryFn: () => loansApi.getMyLoans(),
    staleTime: config.staleTime,
  });
}

export function LoansPage() {
  useDocumentTitle('Loans · Paxora Capital');
  const router = useRouter();
  const { data, isLoading } = useLoans();

  const goToApply = () => router.push('/loans/apply');

  if (isLoading) {
    return (
      <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto px-6 pt-16 md:pt-10">
        <PageHeader title="Loans" className="mb-6" />
        <SkeletonList rows={3} rowClassName="h-24 rounded-2xl" />
      </div>
    );
  }

  const hasLoans = data && data.length > 0;

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto px-6 pt-16 md:pt-10 min-h-[calc(100dvh-80px)] flex flex-col">
      <PageHeader title="Loans" className="mb-2 shrink-0" />

      {!hasLoans ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative overflow-hidden rounded-[32px] bg-black/95 border border-primary/20 p-8 shadow-[0_15px_40px_-15px_var(--primary-glow)] flex flex-col items-center text-center w-full max-w-sm">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

            <LoanAnimation />

            <h2 className="relative z-10 text-xl font-black text-white mb-2 tracking-tight">
              Unlock Liquidity
            </h2>

            <p className="relative z-10 text-xs font-medium text-white/60 mb-6 max-w-[240px] leading-relaxed">
              Borrow against your portfolio seamlessly without selling your crypto assets. Enjoy instant approval and low rates.
            </p>

            <button
              onClick={goToApply}
              className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-primary-foreground font-black text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_var(--primary-glow)] w-full overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_forwards]" />
              <Landmark className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Apply for a Loan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col mt-4">
          <button
            onClick={goToApply}
            className="w-full flex items-center justify-center gap-2 py-4 mb-8 rounded-[20px] bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-primary font-bold transition-all active:scale-[0.98] shadow-[0_0_15px_var(--primary-glow)]"
          >
            <Landmark className="w-5 h-5" /> Apply for New Loan
          </button>

          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Loan History
            </h2>
            <div className="space-y-3">
              {data.map((loan) => (
                <div key={loan.id} className="p-4 rounded-2xl bg-surface/40 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                      <Landmark className="w-5 h-5 text-primary drop-shadow-[0_0_5px_var(--primary-glow)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Duration: {loan.duration} Days</div>
                      <div className="font-black text-base text-foreground truncate">${formatCurrency(loan.amount)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={loan.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
