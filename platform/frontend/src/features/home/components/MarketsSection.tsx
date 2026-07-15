'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Tabs } from '../../../shared/components/ui/Tabs';
import { SkeletonList } from '../../../shared/components/ui/Skeleton';
import { formatCurrency, formatPercent, safeNumber, cn } from '../../../shared/lib/utils';
import { getMetalMeta, getForexMeta, getFlagUrl } from '../../../shared/lib/assetMeta';
import { useCryptoMarket, useStockMarket, useMetalsMarket, useForexMarket } from '../../market/hooks/useMarket';
import type { NormalizedAsset } from '../../../shared/api';

type Filter = 'hot' | '24h' | 'rise' | 'loss';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: '24h', label: '24h' },
  { value: 'rise', label: 'Rise' },
  { value: 'loss', label: 'Loss' },
];
type MarketTab = 'crypto' | 'stocks' | 'metals' | 'forex';

export function MarketsSection() {
  const router = useRouter();
  const [marketType, setMarketType] = useState<MarketTab>('crypto');
  const [filter, setFilter] = useState<Filter>('hot');
  const crypto = useCryptoMarket();
  const stocks = useStockMarket();
  const metals = useMetalsMarket();
  const forex = useForexMarket();

  const isLoading = marketType === 'crypto' ? crypto.isLoading : marketType === 'stocks' ? stocks.isLoading : marketType === 'metals' ? metals.isLoading : forex.isLoading;

  const items = useMemo<NormalizedAsset[]>(() => {
    const pool = (
      marketType === 'crypto' ? (crypto.data as NormalizedAsset[]) ?? [] :
      marketType === 'stocks' ? (stocks.data as NormalizedAsset[]) ?? [] :
      marketType === 'metals' ? (metals.data as NormalizedAsset[]) ?? [] :
      (forex.data as NormalizedAsset[]) ?? []
    );
    const sorted = [...pool];
    if (filter === 'hot') {
      sorted.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    } else if (filter === 'rise') {
      sorted.sort((a, b) => b.changePercent - a.changePercent);
    } else if (filter === 'loss') {
      sorted.sort((a, b) => a.changePercent - b.changePercent);
    }
    return sorted.slice(0, 6);
  }, [marketType, filter, crypto.data, stocks.data, metals.data, forex.data]);

  function handleClick(item: NormalizedAsset) {
    if (marketType === 'crypto') router.push(`/market/crypto/${item.id}`);
    else if (marketType !== 'forex') router.push(`/market/stock/${item.symbol}`);
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Markets</h2>
          <Tabs value={filter} options={FILTERS} onChange={setFilter} size="sm" />
        </div>
        <Tabs
          value={marketType}
          options={[
            { value: 'crypto', label: 'Crypto' },
            { value: 'stocks', label: 'Stocks' },
            { value: 'metals', label: 'Metals' },
            { value: 'forex', label: 'Forex' },
          ]}
          onChange={setMarketType}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <SkeletonList rows={3} />
        ) : items.length === 0 ? null : (
          items.map((item) => {
            const change = item.changePercent;
            const positive = change >= 0;
            const metalMeta = marketType === 'metals' ? getMetalMeta(item.symbol) : undefined;
            const forexMeta = marketType === 'forex' ? getForexMeta(item.symbol) : undefined;
            const isForex = marketType === 'forex';
            return (
              <div
                key={item.id}
                onClick={isForex ? undefined : () => handleClick(item)}
                className={`glass relative overflow-hidden group flex items-center justify-between rounded-2xl p-5 transition-all duration-300 ${isForex ? '' : 'cursor-pointer hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_-12px_var(--primary-glow)] active:scale-[0.98]'}`}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                  style={{ background: `radial-gradient(80% 100% at 50% 0%, var(--primary-glow) 0%, transparent 50%)` }}
                />
                <div className="flex min-w-0 flex-1 items-center gap-4 relative z-10">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-11 w-11 rounded-full bg-white object-contain shadow-sm ring-1 ring-border/50" />
                  ) : metalMeta ? (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-2xl shadow-sm ring-1 ring-border/50">{metalMeta.icon}</div>
                  ) : forexMeta ? (
                    <div className="relative h-11 w-11 shrink-0">
                      <img src={getFlagUrl(forexMeta.baseFlag)} alt={forexMeta.base} className="absolute top-0 left-0 h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-border/50" loading="lazy" />
                      <img src={getFlagUrl(forexMeta.quoteFlag)} alt={forexMeta.quote} className="absolute bottom-0 right-0 h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-border/50" loading="lazy" />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 text-sm font-black uppercase text-primary shadow-sm ring-1 ring-border/50">
                      {item.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-black tracking-tight text-foreground">{marketType === 'metals' || marketType === 'forex' ? item.name : item.symbol}</h3>
                    <p className="truncate text-[13px] font-medium text-muted-foreground">{marketType === 'metals' || marketType === 'forex' ? item.symbol : item.name}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right relative z-10">
                  <div className="text-[15px] font-black tracking-tight text-foreground">${formatCurrency(item.price)}</div>
                  <div className={cn('mt-1 inline-flex items-center justify-end gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider', positive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                    {positive ? <TrendingUp className="h-3 w-3" strokeWidth={3} /> : <TrendingDown className="h-3 w-3" strokeWidth={3} />}
                    {positive ? '+' : '-'}{formatPercent(change)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
