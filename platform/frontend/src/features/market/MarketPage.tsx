'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { marketApi, type NormalizedAsset } from '../../shared/api';
import { config } from '../../shared/lib/config';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { Tabs } from '../../shared/components/ui/Tabs';
import { MarketList } from './components/MarketList';

type MarketTab = 'all' | 'crypto' | 'stocks' | 'metals' | 'forex';
type SortFilter = 'hot' | '24h' | 'rise' | 'loss';

const SORT_FILTERS: { value: SortFilter; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: '24h', label: '24h' },
  { value: 'rise', label: 'Rise' },
  { value: 'loss', label: 'Loss' },
];

const matchesQuery = (q: string) => (a: NormalizedAsset) =>
  !q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);

function sortItems(items: NormalizedAsset[], filter: SortFilter): NormalizedAsset[] {
  const sorted = [...items];
  if (filter === 'hot') sorted.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  else if (filter === 'rise') sorted.sort((a, b) => b.changePercent - a.changePercent);
  else if (filter === 'loss') sorted.sort((a, b) => a.changePercent - b.changePercent);
  return sorted;
}

export function MarketPage() {
  useDocumentTitle('Market · Paxora Capital');
  const [tab, setTab] = useState<MarketTab>('all');
  const [sortFilter, setSortFilter] = useState<SortFilter>('hot');
  const [query, setQuery] = useState('');
  const crypto = useQuery({ queryKey: ['market', 'crypto'], queryFn: () => marketApi.getCrypto(), staleTime: config.staleTime });
  const stocks = useQuery({ queryKey: ['market', 'stocks'], queryFn: () => marketApi.getStocks(), staleTime: config.staleTime });
  const metals = useQuery({ queryKey: ['market', 'metals'], queryFn: () => marketApi.getMetals(), staleTime: config.staleTime });
  const forex = useQuery({ queryKey: ['market', 'forex'], queryFn: () => marketApi.getForex(), staleTime: config.staleTime });

  const q = query.trim().toLowerCase();
  const cryptoItems = useMemo(() => sortItems((crypto.data ?? []).filter(matchesQuery(q)), sortFilter), [crypto.data, q, sortFilter]);
  const stockItems = useMemo(() => sortItems((stocks.data ?? []).filter(matchesQuery(q)), sortFilter), [stocks.data, q, sortFilter]);
  const metalItems = useMemo(() => sortItems((metals.data ?? []).filter(matchesQuery(q)), sortFilter), [metals.data, q, sortFilter]);
  const forexItems = useMemo(() => sortItems((forex.data ?? []).filter(matchesQuery(q)), sortFilter), [forex.data, q, sortFilter]);

  const showCrypto = tab === 'all' || tab === 'crypto';
  const showStocks = tab === 'all' || tab === 'stocks';
  const showMetals = tab === 'all' || tab === 'metals';
  const showForex = tab === 'all' || tab === 'forex';

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      {/* Sticky Header Wrapper */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none px-6 pt-16 pb-4 md:pt-10 md:px-0">
        <PageHeader title="Market" className="mb-4" />

        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets by name or symbol…"
            className="w-full rounded-[20px] bg-surface/60 py-3.5 pl-12 pr-4 text-[15px] font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground focus:bg-surface focus:shadow-[0_0_0_2px_var(--primary-glow)]"
          />
        </div>

        <Tabs
          value={tab}
          options={[
            { value: 'all', label: 'All' },
            { value: 'crypto', label: 'Crypto' },
            { value: 'stocks', label: 'Stocks' },
            { value: 'metals', label: 'Metals' },
            { value: 'forex', label: 'Forex' },
          ]}
          onChange={setTab}
          fullWidth
        />

        <div className="mt-3">
          <Tabs value={sortFilter} options={SORT_FILTERS} onChange={setSortFilter} size="sm" />
        </div>
      </div>

      <div className="mt-6 space-y-8 px-6 md:px-0">
        {showCrypto && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Crypto</h2>
            {crypto.isLoading ? <SkeletonList rows={4} /> : <MarketList items={cryptoItems} type="crypto" />}
          </div>
        )}
        {showStocks && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Stocks</h2>
            {stocks.isLoading ? <SkeletonList rows={3} /> : <MarketList items={stockItems} type="stock" />}
          </div>
        )}
        {showMetals && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Precious Metals</h2>
            {metals.isLoading ? <SkeletonList rows={2} /> : <MarketList items={metalItems} type="metal" />}
          </div>
        )}
        {showForex && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Forex</h2>
            {forex.isLoading ? <SkeletonList rows={3} /> : <MarketList items={forexItems} type="forex" />}
          </div>
        )}
      </div>
    </div>
  );
}
