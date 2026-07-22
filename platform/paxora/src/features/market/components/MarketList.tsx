'use client';

import { useRouter } from 'next/navigation';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent, cn } from '../../../shared/lib/utils';
import { getMetalMeta, getForexMeta, getFlagUrl } from '../../../shared/lib/assetMeta';
import type { NormalizedAsset } from '../../../shared/api';

interface Props {
  items: NormalizedAsset[];
  type: 'crypto' | 'stock' | 'metal' | 'forex';
}

export function MarketList({ items, type }: Props) {
  const router = useRouter();
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const positive = item.changePercent >= 0;
        const metalMeta = type === 'metal' ? getMetalMeta(item.symbol) : undefined;
        const forexMeta = type === 'forex' ? getForexMeta(item.symbol) : undefined;

        const isForex = type === 'forex';
        const handleClick = isForex ? undefined : () => {
          if (type === 'crypto') router.push(`/market/crypto/${item.id}`);
          else router.push(`/market/stock/${item.symbol}`);
        };

        return (
          <div
            key={item.id}
            onClick={handleClick}
            className={`group flex items-center justify-between rounded-[24px] bg-surface/50 p-4 transition-all duration-300 ${isForex ? '' : 'cursor-pointer hover:-translate-y-1 hover:bg-surface hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] active:scale-[0.98]'}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-full bg-white object-contain" />
              ) : metalMeta ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-xl">{metalMeta.icon}</div>
              ) : forexMeta ? (
                <div className="relative h-10 w-10 shrink-0">
                  <img src={getFlagUrl(forexMeta.baseFlag)} alt={forexMeta.base} className="absolute top-0 left-0 h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-border/30" loading="lazy" />
                  <img src={getFlagUrl(forexMeta.quoteFlag)} alt={forexMeta.quote} className="absolute bottom-0 right-0 h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-border/30" loading="lazy" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 text-xs font-bold uppercase text-primary">
                  {item.symbol.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">{type === 'metal' || type === 'forex' ? item.name : item.symbol}</div>
                <div className="truncate text-xs text-muted-foreground">{type === 'metal' || type === 'forex' ? item.symbol : item.name}</div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-foreground">${formatCurrency(item.price)}</div>
              <div className={cn('mt-0.5 inline-flex items-center justify-end gap-1 rounded-full px-1.5 py-0.5 text-xs font-bold', positive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive')}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? '+' : '-'}{formatPercent(item.changePercent)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
