'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Zap, TrendingUp, TrendingDown, X, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { tradesApi } from '../../shared/api';
import { formatCurrency, safeNumber, cn } from '../../shared/lib/utils';

export function PositionsPage() {
  useDocumentTitle('Positions · Paxora Capital');
  const toast = useToast();
  const qc = useQueryClient();
  const router = useRouter();

  const positions = useQuery({
    queryKey: ['trades', 'contracts'],
    queryFn: () => tradesApi.getUserTrades({ type: 'contract', status: 'open', per_page: 50 }),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const positionsList = (positions.data as any)?.trades?.data ?? [];

  const handleCancel = async (id: number) => {
    try {
      await tradesApi.cancelTrade(id);
      toast.success('Position closed');
      qc.invalidateQueries({ queryKey: ['trades', 'contracts'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to close position');
    }
  };

  return (
    <div className="px-4 pt-24 pb-32 md:max-w-4xl md:mx-auto w-full min-h-[calc(100dvh-96px)]">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface/60 border border-white/5 flex items-center justify-center hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Open Positions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {positionsList.length > 0
              ? `${positionsList.length} active contract${positionsList.length !== 1 ? 's' : ''}`
              : 'No active positions'}
          </p>
        </div>
      </div>

      {positionsList.length === 0 ? (
        <div className="rounded-[28px] bg-surface/60 border border-white/5 p-6 backdrop-blur-xl shadow-2xl text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface/80 border border-white/5 flex items-center justify-center">
            <Zap className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm font-bold">No open positions</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Open a contract on the futures page to start trading</p>
          <button
            onClick={() => router.push('/options')}
            className="mt-6 inline-flex items-center gap-2 rounded-[20px] bg-gradient-to-b from-[#10b981] to-[#059669] text-black px-6 py-3 text-sm font-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all"
          >
            <Zap className="w-4 h-4" />
            Open a Contract
          </button>
        </div>
      ) : (
        <div className="rounded-[28px] bg-surface/60 border border-white/5 p-6 backdrop-blur-xl shadow-2xl">
          <div className="space-y-3">
            {positionsList.map((pos: any) => {
              const pnl = safeNumber(pos.profit);
              const pnlPositive = pnl >= 0;
              return (
                <div
                  key={pos.id}
                  className={cn(
                    'rounded-[20px] border p-4 md:p-5 transition-all',
                    pnlPositive
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-destructive/5 border-destructive/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                        pos.direction === 'buy' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                      )}>
                        {pos.direction === 'buy' ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="font-bold text-foreground text-sm">{pos.symbol}</span>
                      <span className="text-muted-foreground text-xs font-bold">{pos.leverage ?? '?'}×</span>
                    </div>
                    <button
                      onClick={() => handleCancel(pos.id)}
                      className="w-8 h-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground font-bold mb-0.5">Margin</div>
                      <div className="font-mono font-bold text-foreground text-sm">${formatCurrency(safeNumber(pos.amount))}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-bold mb-0.5">Size</div>
                      <div className="font-mono font-bold text-foreground text-sm">
                        ${formatCurrency(safeNumber(pos.amount) * safeNumber(pos.leverage ?? 1))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-bold mb-0.5">Entry</div>
                      <div className="font-mono font-bold text-foreground text-sm">
                        ${formatCurrency(safeNumber(pos.entry_price ?? pos.exchange_rate))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-bold mb-0.5">PnL</div>
                      <div className={cn('font-mono font-black text-sm', pnlPositive ? 'text-primary' : 'text-destructive')}>
                        {pnlPositive ? '+' : ''}${formatCurrency(pnl)}
                        {safeNumber(pos.change) > 0 && (
                          <span className={cn('ml-1 text-xs', pnlPositive ? 'text-primary' : 'text-destructive')}>
                            ({pnlPositive ? '+' : ''}{(safeNumber(pos.change) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
