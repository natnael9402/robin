'use client';

import { memo, useRef, useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Loader2, Timer, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { formatCompact, formatCurrency } from '../../../shared/lib/utils';
import { DURATIONS, OPTION_TRADE_RULES, profitFor, type TradeDirection, type TradeDuration } from '../logic/tradeMath';
import { cn } from '../../../shared/lib/utils';

interface Props {
  amount: number;
  duration: TradeDuration;
  placingDirection: 'buy' | 'sell' | null;
  balance: number;
  accountLabel?: string;
  onAmountChange: (v: number) => void;
  onDurationChange: (d: TradeDuration) => void;
  onTrade: (type: TradeDirection) => void;
}

function TradeControlsBase({ amount, duration, placingDirection, balance, accountLabel = 'Balance', onAmountChange, onDurationChange, onTrade }: Props) {
  const [internal, setInternal] = useState(String(amount));
  const [open, setOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternal(String(amount));
  }, [amount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentRule = OPTION_TRADE_RULES[duration];
  const inRange = currentRule && amount >= currentRule.minCapital && amount <= currentRule.maxCapital;
  const estProfit = inRange ? profitFor(amount, duration) : 0;

  return (
    <div className="flex flex-col space-y-3">
      {/* Balance */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{accountLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-black text-foreground">
            {showBalance ? `$${formatCurrency(balance)}` : '****'}
          </span>
          <button
            onClick={() => setShowBalance((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative bg-surface/80 border border-white/10 rounded-[14px] p-3 backdrop-blur-2xl shadow-sm">
        <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-1">Investment Amount</label>
        <div className="flex items-center">
          <span className="text-sm font-black text-muted-foreground mr-1">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={internal}
            onChange={(e) => {
              setInternal(e.target.value);
              onAmountChange(Number(e.target.value));
            }}
            className="bg-transparent text-lg font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="0"
          />
        </div>
      </div>

      {/* Duration dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <Timer className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">Duration</span>
        </div>

        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all',
            open ? 'border-primary/40 bg-primary/[0.04]' : 'border-border bg-surface/60 hover:border-foreground/20',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-foreground/5 text-[10px] font-black text-foreground">
              {duration}s
            </div>
            <div className="text-left">
              <div className="text-[12px] font-bold text-foreground leading-tight">{currentRule?.returnRate ?? 0}% Return</div>
              <div className="text-[10px] text-muted-foreground">${formatCompact(currentRule?.minCapital ?? 0)} – ${formatCompact(currentRule?.maxCapital ?? 0)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {inRange ? (
              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">+${formatCurrency(estProfit)}</span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground">
                {currentRule && amount < currentRule.minCapital ? `Min $${formatCompact(currentRule.minCapital)}` : currentRule && amount > currentRule.maxCapital ? `Max $${formatCompact(currentRule.maxCapital)}` : ''}
              </span>
            )}
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
          </div>
        </button>

        {/* Dropdown — opens upward */}
        {open && (
          <div className="absolute inset-x-0 z-50 mb-1.5 bottom-full flex flex-col gap-0.5 rounded-xl border border-border bg-surface/95 p-1 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            {DURATIONS.map((d) => {
              const r = OPTION_TRADE_RULES[d];
              const valid = r && amount >= r.minCapital && amount <= r.maxCapital;
              const est = valid ? profitFor(amount, d) : 0;
              const selected = duration === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => { onDurationChange(d); setOpen(false); }}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-left transition-all',
                    selected
                      ? 'bg-primary/[0.08]'
                      : 'hover:bg-foreground/5',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'flex h-7 w-10 items-center justify-center rounded-md text-[10px] font-black',
                      selected ? 'bg-primary text-black' : 'bg-foreground/5 text-foreground',
                    )}>
                      {d}s
                    </div>
                    <div>
                      <div className={cn('text-[12px] font-bold leading-tight', selected ? 'text-primary' : 'text-foreground')}>
                        {r?.returnRate ?? 0}%
                      </div>
                      <div className="text-[9px] text-muted-foreground">${formatCompact(r?.minCapital ?? 0)}–${formatCompact(r?.maxCapital ?? 0)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {valid ? (
                      <span className="font-mono text-[12px] font-black text-emerald-600 dark:text-emerald-400">+${formatCompact(est)}</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">
                        {r && amount < r.minCapital ? `min $${formatCompact(r.minCapital)}` : r && amount > r.maxCapital ? `max $${formatCompact(r.maxCapital)}` : ''}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          disabled={placingDirection !== null}
          onClick={() => onTrade('buy')}
          className="relative overflow-hidden group rounded-[14px] bg-gradient-to-b from-[#10b981] to-[#059669] px-4 py-3 shadow-[0_5px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-black">
            {placingDirection === 'buy' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingUp className="w-4 h-4 drop-shadow-sm" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider drop-shadow-sm">{placingDirection === 'buy' ? 'Placing...' : 'LONG'}</span>
          </div>
        </button>
        
        <button
          disabled={placingDirection !== null}
          onClick={() => onTrade('sell')}
          className="relative overflow-hidden group rounded-[14px] bg-gradient-to-b from-[#ef4444] to-[#dc2626] px-4 py-3 shadow-[0_5px_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-white">
            {placingDirection === 'sell' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingDown className="w-4 h-4 drop-shadow-sm" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider drop-shadow-sm">{placingDirection === 'sell' ? 'Placing...' : 'SHORT'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export const TradeControls = memo(TradeControlsBase);
