'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { formatCurrency } from '../../../shared/lib/utils';
import { cn } from '../../../shared/lib/utils';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import type { AssetOption } from '../logic/tradeMath';

interface Props {
  open: boolean;
  onClose: () => void;
  assets: AssetOption[];
  selectedId?: string;
  onSelect: (asset: AssetOption) => void;
}

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  crypto: { label: 'C', className: 'bg-blue-500/20 text-blue-400' },
  stock: { label: 'S', className: 'bg-emerald-500/20 text-emerald-400' },
  metal: { label: 'M', className: 'bg-amber-500/20 text-amber-400' },
};

function AssetIcon({ asset }: { asset: AssetOption }) {
  const [imgError, setImgError] = useState(false);
  const badge = TYPE_BADGE[asset.type] ?? TYPE_BADGE.crypto;

  if (asset.image && !imgError) {
    return (
      <img
        src={asset.image}
        alt={asset.name}
        className="w-10 h-10 rounded-full"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold', badge.className)}>
      {badge.label}
    </div>
  );
}

const FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'stock', label: 'Stocks', icon: '📈' },
  { key: 'metal', label: 'Metals', icon: '🥇' },
];

const FILTER_COLORS: Record<string, string> = {
  crypto: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  stock: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  metal: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
};

export function AssetPickerModal({ open, onClose, assets, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('crypto');
  const debounced = useDebouncedValue(query, 200);

  const filtered = useMemo(() => {
    let list = assets.filter((a) => a.type === typeFilter);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assets, typeFilter, debounced]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of assets) {
      c[a.type] = (c[a.type] ?? 0) + 1;
    }
    return c;
  }, [assets]);

  const searchPlaceholder = cn(
    'Search',
    typeFilter === 'crypto' ? 'BTC, ETH, SOL...' : '',
    typeFilter === 'stock' ? 'AAPL, TSLA, MSFT...' : '',
    typeFilter === 'metal' ? 'XAU, XAG, XPT...' : ''
  );

  return (
    <Modal open={open} onClose={onClose} size="full" title="Select Asset">
      <div className="space-y-3">
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftAdornment={<Search className="w-4 h-4" />}
        />

        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {FILTERS.map((f) => {
            const count = counts[f.key] ?? 0;
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5',
                  typeFilter === f.key
                    ? FILTER_COLORS[f.key] ?? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                )}
              >
                <span className="text-sm">{f.icon}</span>
                <span>{f.label}</span>
                <span className={cn(
                  'ml-0.5 rounded-full px-1.5 py-0 text-[10px] leading-none',
                  typeFilter === f.key ? 'bg-black/20' : 'bg-white/5'
                )}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2 -mx-2 px-2">
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-10 text-sm">No assets match your search</div>
          )}
          {filtered.map((asset) => {
            const change = asset.price_change_percentage_24h_in_currency ?? 0;
            const positive = change >= 0;
            const active = asset.id === selectedId;
            return (
              <button
                key={asset.id}
                onClick={() => {
                  onSelect(asset);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-95 ${
                  active
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-surface border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AssetIcon asset={asset} />
                  <div className="text-left">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      {asset.name}
                      <span className="text-xs text-muted-foreground font-mono tracking-wider bg-background px-1.5 py-0.5 rounded">
                        {asset.symbol.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-foreground font-bold">${formatCurrency(asset.current_price)}</div>
                  <div className={`text-xs ${positive ? 'text-primary' : 'text-destructive'}`}>
                    {change.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
