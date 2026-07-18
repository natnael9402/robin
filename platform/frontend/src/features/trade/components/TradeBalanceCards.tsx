'use client';

import { memo, useState } from 'react';
import { Zap, ArrowLeftRight, FileText, Eye, EyeOff } from 'lucide-react';
import { formatCurrency, cn } from '../../../shared/lib/utils';

interface Props {
  fastTrade: number;
  spot: number;
  trading: number;
  loading?: boolean;
}

const ACCOUNTS = [
  { key: 'fast_trade' as const, label: 'Binary Option', sub: 'Options', icon: Zap, glow: 'bg-primary/20', accent: 'from-primary to-primary-hover' },
  { key: 'spot' as const, label: 'Spot', sub: 'Swaps', icon: ArrowLeftRight, glow: 'bg-blue-500/20', accent: 'from-blue-500 to-blue-600' },
  { key: 'trading' as const, label: 'Contract', sub: 'Leverage', icon: FileText, glow: 'bg-purple-500/20', accent: 'from-purple-500 to-purple-600' },
] as const;

const BALANCE_MAP = { fast_trade: 'fast_trade', spot: 'spot', trading: 'trading' } as const;

function TradeBalanceCardsBase({ fastTrade, spot, trading, loading }: Props) {
  const [hidden, setHidden] = useState(true);
  const values = { fast_trade: fastTrade, spot, trading };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Balances</span>
        <button
          onClick={() => setHidden((h) => !h)}
          className="text-muted-foreground/70 transition-colors hover:text-foreground"
          aria-label={hidden ? 'Show balances' : 'Hide balances'}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {ACCOUNTS.map((acc) => {
          const val = values[acc.key];
          const Icon = acc.icon;
          return (
            <div
              key={acc.key}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-white/10 p-4 text-left transition-all duration-300',
                'bg-surface/60 backdrop-blur-xl'
              )}
            >
              {/* glow orb */}
              <div className={cn('pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-[40px] opacity-40', acc.glow)} />
              <div className="relative z-10">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-b shadow-lg text-black', acc.accent)}>
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{acc.label}</p>
                {loading ? (
                  <div className="h-6 w-20 rounded bg-foreground/5 animate-pulse" />
                ) : (
                  <p className="font-mono text-lg font-black text-foreground tabular-nums leading-tight">
                    {hidden ? '••••••' : `$${formatCurrency(val)}`}
                  </p>
                )}
                <p className="text-[10px] font-medium text-muted-foreground mt-1">{acc.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TradeBalanceCards = memo(TradeBalanceCardsBase);
