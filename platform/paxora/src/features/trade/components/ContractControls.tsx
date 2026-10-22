'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { TrendingDown, TrendingUp, Loader2, Eye, EyeOff, RefreshCw, Timer } from 'lucide-react';
import { tradesApi } from '../../../shared/api';
import { useToast } from '../../../shared/contexts/ToastContext';
import { formatCurrency, cn } from '../../../shared/lib/utils';
import { TransferApprovalModal } from './TransferApprovalModal';
import type { AssetOption } from '../logic/tradeMath';

const LEVERAGE_OPTIONS = [2, 5, 10, 20, 50, 100, 125];
/** Contracts auto-close after this duration — must match backend default. */
const CONTRACT_DURATION_SECONDS = 45;

interface Props {
  asset: AssetOption | null;
  balance: number;
  accountLabel?: string;
  currentPrice: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onComplete: (result: { symbol: string; amount: string; profit: number; direction: 'buy' | 'sell'; result?: 'won' | 'lost' | null }) => void;
}

interface ContractPosition {
  id: number;
  symbol: string;
  direction: 'buy' | 'sell';
  amount: number;
  leverage: number;
  entryPrice: number;
  liquidationPrice: number | null;
  minProfit: number | null;
  maxLoss: number | null;
  openedAt: number;
}

function ContractControlsBase({ asset, balance, accountLabel = 'Balance', currentPrice, onRefresh, isRefreshing, onComplete }: Props) {
  const [showBalance, setShowBalance] = useState(false);
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(10);
  const [minProfit, setMinProfit] = useState('');
  const [maxLoss, setMaxLoss] = useState('');
  const [placingDirection, setPlacingDirection] = useState<'buy' | 'sell' | null>(null);
  const [closingOutcome, setClosingOutcome] = useState<'WIN' | 'LOSS' | null>(null);
  const [position, setPosition] = useState<ContractPosition | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countdownTick, setCountdownTick] = useState(0);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const pendingDirectionRef = useRef<'buy' | 'sell' | null>(null);
  const toast = useToast();

  const symbol = asset ? `${asset.symbol.toUpperCase()}/USD` : '';
  const marketType = asset?.type === 'metal' ? 'metals' : asset?.type === 'stock' ? 'stocks' : 'crypto';
  const positionSize = Number(amount) * leverage;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  const handleSubmit = useCallback(async (dir: 'buy' | 'sell') => {
    const amt = Number(amount);
    if (!amt || amt < 10) {
      toast.error('Minimum amount is $10');
      return;
    }
    if (!symbol) {
      toast.error('Select an asset first');
      return;
    }
    const tp = minProfit ? Number(minProfit) : undefined;
    const sl = maxLoss ? Number(maxLoss) : undefined;
    if (tp !== undefined && (!Number.isFinite(tp) || tp <= 0)) {
      toast.error('Min profit must be greater than $0');
      return;
    }
    if (sl !== undefined && (!Number.isFinite(sl) || sl <= 0)) {
      toast.error('Max loss must be greater than $0');
      return;
    }
    if (sl !== undefined && sl > amt) {
      toast.error('Max loss cannot exceed the margin amount');
      return;
    }
    if (amt > balance) {
      pendingDirectionRef.current = dir;
      setShowApprovalModal(true);
      return;
    }
    setPlacingDirection(dir);
    try {
      const res = await tradesApi.createContract({
        symbol,
        direction: dir,
        amount: amt,
        leverage,
        take_profit_amount: tp,
        stop_loss_amount: sl,
        market_type: marketType,
      });
      const trade = res.trade;
      setPosition({
        id: trade.id,
        symbol: trade.symbol,
        direction: dir,
        amount: Number(trade.amount),
        leverage,
        entryPrice: Number(trade.entry_price),
        liquidationPrice: trade.contract?.liquidation_price ? Number(trade.contract.liquidation_price) : null,
        minProfit: tp ?? null,
        maxLoss: sl ?? null,
        openedAt: typeof trade.opened_at === 'string' ? Date.parse(trade.opened_at) || Date.now() : Date.now(),
      });
    } catch (err) {
      toast.error((err as Error).message ?? 'Contract trade failed');
    } finally {
      setPlacingDirection(null);
    }
  }, [amount, symbol, leverage, minProfit, maxLoss, marketType, toast]);

  const handleApproved = useCallback(async () => {
    const dir = pendingDirectionRef.current;
    if (!dir) return;
    pendingDirectionRef.current = null;
    setShowApprovalModal(false);
    const amt = Number(amount);
    const tp = minProfit ? Number(minProfit) : undefined;
    const sl = maxLoss ? Number(maxLoss) : undefined;
    if (!amt || amt < 10) {
      toast.error('Minimum amount is $10');
      return;
    }
    if (sl !== undefined && sl > amt) {
      toast.error('Max loss cannot exceed the margin amount');
      return;
    }
    setPlacingDirection(dir);
    try {
      const res = await tradesApi.createContract({
        symbol,
        direction: dir,
        amount: amt,
        leverage,
        take_profit_amount: tp,
        stop_loss_amount: sl,
        market_type: marketType,
      });
      const trade = res.trade;
      setPosition({
        id: trade.id,
        symbol: trade.symbol,
        direction: dir,
        amount: Number(trade.amount),
        leverage,
        entryPrice: Number(trade.entry_price),
        liquidationPrice: trade.contract?.liquidation_price ? Number(trade.contract.liquidation_price) : null,
        minProfit: tp ?? null,
        maxLoss: sl ?? null,
        openedAt: typeof trade.opened_at === 'string' ? Date.parse(trade.opened_at) || Date.now() : Date.now(),
      });
    } catch (err) {
      toast.error((err as Error).message ?? 'Contract trade failed');
    } finally {
      setPlacingDirection(null);
    }
  }, [amount, symbol, leverage, minProfit, maxLoss, marketType, toast]);

  const handleClose = useCallback(async (outcome: 'WIN' | 'LOSS') => {
    if (!position || closingOutcome !== null) return;
    setClosingOutcome(outcome);
    try {
      const res = await tradesApi.closeContract(position.id, outcome);
      stopPolling();
      const trade = res.trade;
      onComplete({
        symbol: trade.symbol,
        amount: String(position.amount),
        profit: Number(trade.pnl ?? 0),
        direction: position.direction,
        result: trade.result ?? (outcome === 'WIN' ? 'won' : 'lost'),
      });
      onRefresh?.();
      setPosition(null);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to close trade');
    } finally {
      setClosingOutcome(null);
    }
  }, [position, closingOutcome, stopPolling, onComplete, onRefresh, toast]);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    let inFlight = false;
    const poll = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const res = await tradesApi.getTrade(position.id);
        const trade = res.trade;
        if (trade.status === 'closed') {
          stopPolling();
          const pnl = Number(trade.pnl ?? 0);
          onComplete({
            symbol: trade.symbol,
            amount: String(position.amount),
            profit: pnl,
            direction: position.direction,
            result: trade.result ?? null,
          });
          setPosition(null);
          return;
        }
        // Re-anchor the countdown to the server's clock. Wallet/WebView
        // browsers (and phones with skewed clocks) otherwise freeze the
        // panel at "Closing" when opened_at drifts from local time.
        const serverOpenedAt = typeof trade.opened_at === 'string' ? Date.parse(trade.opened_at) : NaN;
        if (Number.isFinite(serverOpenedAt) && Math.abs(serverOpenedAt - position.openedAt) > 2000) {
          setPosition({ ...position, openedAt: serverOpenedAt });
          return;
        }
      } catch {
        // polling errors silently ignored
      } finally {
        inFlight = false;
      }
      const remaining = position.openedAt + CONTRACT_DURATION_SECONDS * 1000 - Date.now();
      if (!cancelled) {
        pollingRef.current = setTimeout(() => { void poll(); }, remaining <= 10000 ? 1000 : 5000);
      }
    };
    const first = setTimeout(() => { void poll(); }, 4000);
    pollingRef.current = first;
    // Wallet/WebView browsers pause JS timers while backgrounded or when
    // the screen locks. On refocus, reconcile immediately: poll right away
    // so the panel clears the moment the trade result is known.
    const handleVisibilityChange = () => {
      if (!document.hidden) void poll();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelled = true;
      clearTimeout(first);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [position, stopPolling, onComplete]);

  // Drives the 1-second countdown display while a position is open.
  useEffect(() => {
    if (!position) return;
    const tick = setInterval(() => setCountdownTick((v) => v + 1), 500);
    return () => clearInterval(tick);
  }, [position]);

  if (position) {
    const rawMove = position.direction === 'buy'
      ? (currentPrice - position.entryPrice)
      : (position.entryPrice - currentPrice);
    // Matches the backend pnl math exactly: margin x %move x leverage.
    const pnl = position.entryPrice > 0 ? (rawMove / position.entryPrice) * position.amount * position.leverage : 0;
    const pnlPercent = position.amount > 0 ? (pnl / position.amount) * 100 : 0;
    const isPositive = pnl >= 0;
    const countdownRemaining = Math.ceil((position.openedAt + CONTRACT_DURATION_SECONDS * 1000 - Date.now()) / 1000);
    void countdownTick; // re-render driver only
    const countdownProgress = Math.max(0, Math.min(100, ((position.openedAt + CONTRACT_DURATION_SECONDS * 1000 - Date.now()) / (CONTRACT_DURATION_SECONDS * 1000)) * 100));
    const countdownUrgent = countdownRemaining <= 10 && countdownRemaining > 0;

    return (
      <div className="h-full flex flex-col py-6">
        <div className="text-center mb-4">
          <div className="text-lg font-black text-foreground font-mono">
            ${formatCurrency(currentPrice)}
          </div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
            {position.direction === 'buy' ? 'LONG' : 'SHORT'} · {position.leverage}x · {position.symbol}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Entry</div>
            <div className="text-sm font-black text-foreground font-mono">${formatCurrency(position.entryPrice)}</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Margin</div>
            <div className="text-sm font-black text-foreground font-mono">${formatCurrency(position.amount)}</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Position Size</div>
            <div className="text-sm font-black text-foreground font-mono">${formatCurrency(positionSize)}</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-3.5 py-2.5">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Liq. Price</div>
            <div className="text-sm font-black text-destructive font-mono">
              {position.liquidationPrice ? `$${formatCurrency(position.liquidationPrice)}` : '—'}
            </div>
          </div>
        </div>

        <div className={cn(
          'relative border rounded-2xl p-5 text-center transition-all duration-500',
          isPositive ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'
        )}>
          <div className="text-muted-foreground text-[10px] tracking-widest font-black uppercase mb-1">Unrealized PnL</div>
          <div className={cn('text-3xl font-black font-mono', isPositive ? 'text-[#10b981]' : 'text-[#ef4444]')}>
            {isPositive ? '+' : '-'}${formatCurrency(Math.abs(pnl))}
          </div>
          <div className={cn('text-xs font-bold mt-1', isPositive ? 'text-[#10b981]' : 'text-[#ef4444]')}>
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
        </div>

        {(position.minProfit || position.maxLoss) && (
          <div className="mt-2 text-[10px] text-center text-muted-foreground font-bold">
            {position.minProfit ? `Min Profit: $${formatCurrency(position.minProfit)}` : ''}
            {position.minProfit && position.maxLoss ? ' · ' : ''}
            {position.maxLoss ? `Max Loss: $${formatCurrency(position.maxLoss)}` : ''}
          </div>
        )}

        <div className="mt-3 relative overflow-hidden rounded-[14px] border border-white/10 bg-surface/80 px-3.5 py-2">
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-1000 ease-linear',
              countdownUrgent ? 'bg-destructive/20' : 'bg-primary/20'
            )}
            style={{ width: `${countdownProgress}%` }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <Timer size={12} className={countdownUrgent ? 'text-destructive' : ''} />
              {countdownRemaining <= 0 ? 'Closing' : countdownUrgent ? 'Almost done' : `Auto-close · ${CONTRACT_DURATION_SECONDS}s`}
            </span>
            <span className={cn(
              'font-mono text-[13px] font-black tabular-nums',
              countdownUrgent ? 'text-destructive animate-pulse' : 'text-foreground'
            )}>
              {String(Math.floor(Math.max(0, countdownRemaining) / 60)).padStart(2, '0')}:{String(Math.max(0, countdownRemaining) % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            disabled={closingOutcome !== null}
            onClick={() => handleClose('WIN')}
            className="relative rounded-[14px] bg-emerald-600 px-3 py-2.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center justify-center gap-1.5 text-white">
              {closingOutcome === 'WIN'
                ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} />
                : <TrendingUp className="w-4 h-4" strokeWidth={4} />}
              <span className="text-[12px] font-black tracking-wider">
                {closingOutcome === 'WIN' ? 'Closing...' : 'Take Profit'}
              </span>
            </div>
          </button>
          <button
            disabled={closingOutcome !== null}
            onClick={() => handleClose('LOSS')}
            className="relative rounded-[14px] bg-red-600 px-3 py-2.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center justify-center gap-1.5 text-white">
              {closingOutcome === 'LOSS'
                ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} />
                : <TrendingDown className="w-4 h-4" strokeWidth={4} />}
              <span className="text-[12px] font-black tracking-wider">
                {closingOutcome === 'LOSS' ? 'Closing...' : 'Stop Loss'}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2.5">
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
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="relative bg-surface border border-border rounded-[14px] p-2">
        <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">Amount (Margin)</label>
        <div className="flex items-center">
          <span className="text-sm font-black text-muted-foreground mr-1">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-lg font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-between px-1 text-[10px] font-bold text-muted-foreground">
        <span>Position Size: <span className="text-foreground">${formatCurrency(positionSize)}</span></span>
        <span>Margin: <span className="text-foreground">${formatCurrency(Number(amount))}</span></span>
      </div>

      <div className="flex gap-1 bg-surface p-1 rounded-[12px] border border-border">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            onClick={() => setLeverage(lev)}
            className={cn(
              'flex-1 py-1.5 rounded-[10px] text-[10px] font-black transition-all duration-300',
              leverage === lev
                ? 'bg-primary text-black'
                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
            )}
          >
            {lev}x
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative bg-surface border border-border rounded-[14px] p-2">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">Min Profit ($)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            className="bg-transparent text-sm font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="Optional"
          />
        </div>
        <div className="flex-1 relative bg-surface border border-border rounded-[14px] p-2">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">Max Loss ($)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={maxLoss}
            onChange={(e) => setMaxLoss(e.target.value)}
            className="bg-transparent text-sm font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="Optional"
          />
        </div>
      </div>

      {(minProfit || maxLoss) && (
        <div className="text-[9px] text-center text-muted-foreground font-bold px-1">
          Auto-closes at expiry (45s) or when your {minProfit ? `profit hits $${minProfit}` : ''}{(minProfit && maxLoss) ? ' or ' : ''}{maxLoss ? `loss reaches $${maxLoss}` : ''}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={placingDirection !== null}
          onClick={() => handleSubmit('buy')}
          className="relative group rounded-[14px] bg-emerald-600 px-4 py-2.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-white">
            {placingDirection === 'buy' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingUp className="w-4 h-4" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider">{placingDirection === 'buy' ? 'Placing...' : 'LONG'}</span>
          </div>
        </button>
        <button
          disabled={placingDirection !== null}
          onClick={() => handleSubmit('sell')}
          className="relative group rounded-[14px] bg-red-600 px-4 py-2.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-white">
            {placingDirection === 'sell' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingDown className="w-4 h-4" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider">{placingDirection === 'sell' ? 'Placing...' : 'SHORT'}</span>
          </div>
        </button>
      </div>

      <TransferApprovalModal
        open={showApprovalModal}
        onClose={() => { setShowApprovalModal(false); pendingDirectionRef.current = null; }}
        onApproved={handleApproved}
        currentBalance={balance}
        requiredAmount={Number(amount)}
        targetAccount="trading"
      />
    </div>
  );
}

export const ContractControls = memo(ContractControlsBase);
