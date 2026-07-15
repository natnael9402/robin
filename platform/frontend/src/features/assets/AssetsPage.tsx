'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { assetsApi, marketApi } from '../../shared/api';
import { config } from '../../shared/lib/config';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { StatCard } from '../../shared/components/ui/StatCard';
import { formatCurrency, formatCompact, safeNumber } from '../../shared/lib/utils';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import type { UserAsset, Stock } from '../../shared/types';

export function AssetsPage() {
  useDocumentTitle('Assets · Paxora Capital');
  const portfolio = useQuery<UserAsset[]>({
    queryKey: ['assets', 'portfolio'],
    queryFn: () => assetsApi.getPortfolio(),
    staleTime: config.staleTime,
  });
  const crypto = useQuery({ queryKey: ['market', 'crypto'], queryFn: () => marketApi.getCrypto(), staleTime: config.staleTime });
  const stocks = useQuery({ queryKey: ['market', 'stocks'], queryFn: () => marketApi.getStocks().catch(() => []), staleTime: config.staleTime });

  const enriched = useMemo(() => {
    if (!portfolio.data) return [];
    return portfolio.data.map((a) => enrich(a, crypto.data ?? [], stocks.data ?? []));
  }, [portfolio.data, crypto.data, stocks.data]);

  const { totalValue, totalPnL } = useMemo(() => {
    return enriched.reduce(
      (acc: { totalValue: number; totalPnL: number }, item: EnrichedAsset) => ({
        totalValue: acc.totalValue + item.currentValue,
        totalPnL: acc.totalPnL + item.pnl,
      }),
      { totalValue: 0, totalPnL: 0 }
    );
  }, [enriched]);

  return (
    <div className="p-6 pt-10 pb-24">
      <PageHeader title="Assets" subtitle="Your portfolio overview" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Value" value={`$${formatCompact(totalValue)}`} />
        <StatCard
          label="P&L"
          value={`${totalPnL >= 0 ? '+' : ''}$${formatCompact(Math.abs(totalPnL))}`}
          trend={totalPnL >= 0 ? 'up' : 'down'}
        />
      </div>

      {portfolio.isLoading ? (
        <SkeletonList rows={3} />
      ) : enriched.length === 0 ? (
        <EmptyState icon={<PieChart className="w-10 h-10" />} title="No assets yet" description="Start trading to build your portfolio." />
      ) : (
        <div className="space-y-3">
          {enriched.map((a) => (
            <div key={`${a.symbol}-${a.type}`} className="p-4 rounded-2xl bg-surface/30 border border-border-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center font-bold text-foreground text-xs uppercase">
                  {a.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="font-bold text-foreground">{a.symbol}</div>
                  <div className="text-xs text-muted-foreground">{a.amount.toFixed(4)} · ${formatCurrency(a.currentPrice)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-foreground">${formatCompact(a.currentValue)}</div>
                <div className={cn('text-xs flex items-center justify-end gap-1', a.pnl >= 0 ? 'text-primary' : 'text-destructive')}>
                  {a.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {a.pnl >= 0 ? '+' : ''}${formatCompact(Math.abs(a.pnl))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface EnrichedAsset extends UserAsset {
  currentPrice: number;
  currentValue: number;
  pnl: number;
  change24h: number;
}

function enrich(asset: UserAsset, crypto: any[], stocks: Stock[]): EnrichedAsset {
  let currentPrice = asset.avgPrice;
  let change24h = 0;
  if (asset.type === 'crypto') {
    const m = crypto.find((c) => c.symbol.toUpperCase() === asset.symbol.toUpperCase());
    if (m) {
      currentPrice = Number(m.price ?? m.current_price);
      change24h = safeNumber(m.changePercent ?? m.price_change_percentage_24h);
    }
  } else {
    const m = stocks.find((s) => s.symbol.toUpperCase() === asset.symbol.toUpperCase());
    if (m) {
      currentPrice = m.price;
      change24h = safeNumber(m.changePercent);
    }
  }
  const currentValue = currentPrice * asset.amount;
  const costBasis = asset.avgPrice * asset.amount;
  return { ...asset, currentPrice, currentValue, pnl: currentValue - costBasis, change24h };
}
