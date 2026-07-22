'use client';

import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { AssetOption } from '../logic/tradeMath';

interface Props {
  asset: AssetOption | null;
  disabled?: boolean;
  onClick: () => void;
}

function TradeAssetSelectorBase({ asset, disabled, onClick }: Props) {
  if (!asset) {
    return (
      <div className="h-10 w-32 rounded-xl bg-surface border border-border animate-pulse" />
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 hover:border-primary/50 transition-all disabled:opacity-50 disabled:pointer-events-none"
    >
      {asset.image ? (
        <img src={asset.image} alt={asset.symbol} className="w-6 h-6 rounded-full" />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
          {asset.symbol.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-foreground font-bold">{asset.symbol.toUpperCase()}</span>
      {!disabled && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export const TradeAssetSelector = memo(TradeAssetSelectorBase);
