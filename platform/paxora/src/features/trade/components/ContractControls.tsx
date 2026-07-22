'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { TrendingDown, TrendingUp, Loader2, Eye, EyeOff } from 'lucide-react';
import { tradesApi } from '../../../shared/api';
import { useToast } from '../../../shared/contexts/ToastContext';
import { formatCurrency, cn } from '../../../shared/lib/utils';
import { TransferApprovalModal } from './TransferApprovalModal';
import type { AssetOption } from '../logic/tradeMath';

const LEVERAGE_OPTIONS = [2, 5, 10, 20, 50, 100, 125];

interface Props {
  asset: AssetOption | null;
  balance: number;
  accountLabel?: string;
  currentPrice: number;
  onComplete: (result: { symbol: string; amount: string; profit: number; direction: 'buy' | 'sell' }) => void;
}

interface ContractPosition {
  id: number;
  symbol: string;
  direction: 'buy' | 'sell';
  amount: number;
  leverage: number;
  entryPrice: number;
  liquidationPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
}

function ContractControlsBase({ asset, balance, accountLabel = 'Balance', currentPrice, onComplete }: Props) {
  const [showBalance, setShowBalance] = useState(false);
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(10);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [placingDirection, setPlacingDirection] = useState<'buy' | 'sell' | null>(null);
  const [position, setPosition] = useState<ContractPosition | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const pendingDirectionRef = useRef<'buy' | 'sell' | null>(null);
  const toast = useToast();

  const symbol = asset ? `${asset.symbol.toUpperCase()}/USD` : '';
  const positionSize = Number(amount) * leverage;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
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
        take_profit: takeProfit ? Number(takeProfit) : undefined,
        stop_loss: stopLoss ? Number(stopLoss) : undefined,
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
        takeProfit: takeProfit ? Number(takeProfit) : null,
        stopLoss: stopLoss ? Number(stopLoss) : null,
      });
    } catch (err) {
      toast.error((err as Error).message ?? 'Contract trade failed');
    } finally {
      setPlacingDirection(null);
    }
  }, [amount, symbol, leverage, takeProfit, stopLoss, toast]);

  const handleApproved = useCallback(async () => {
    const dir = pendingDirectionRef.current;
    if (!dir) return;
    pendingDirectionRef.current = null;
    setShowApprovalModal(false);
    setPlacingDirection(dir);
    try {
      const res = await tradesApi.createContract({
        symbol,
        direction: dir,
        amount: Number(amount),
        leverage,
        take_profit: takeProfit ? Number(takeProfit) : undefined,
        stop_loss: stopLoss ? Number(stopLoss) : undefined,
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
        takeProfit: takeProfit ? Number(takeProfit) : null,
        stopLoss: stopLoss ? Number(stopLoss) : null,
      });
    } catch (err) {
      toast.error((err as Error).message ?? 'Contract trade failed');
    } finally {
      setPlacingDirection(null);
    }
  }, [amount, symbol, leverage, takeProfit, stopLoss, toast]);

  useEffect(() => {
    if (!position) return;
    pollingRef.current = setInterval(async () => {
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
          });
          setPosition(null);
        }
      } catch {
        // polling errors silently ignored
      }
    }, 5000);
    return stopPolling;
  }, [position, stopPolling, onComplete]);

  if (position) {
    const pnl = position.direction === 'buy'
      ? (currentPrice - position.entryPrice) * position.leverage
      : (position.entryPrice - currentPrice) * position.leverage;
    const pnlPercent = position.entryPrice > 0 ? (pnl / (position.amount || 1)) * 100 : 0;
    const isPositive = pnl >= 0;

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
          'relative overflow-hidden border rounded-2xl p-5 text-center backdrop-blur-2xl transition-all duration-500',
          isPositive ? 'bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-destructive/10 border-destructive/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
        )}>
          <div className="text-muted-foreground text-[10px] tracking-widest font-black uppercase mb-1">Unrealized PnL</div>
          <div className={cn('text-3xl font-black font-mono drop-shadow-md', isPositive ? 'text-[#10b981]' : 'text-[#ef4444]')}>
            {isPositive ? '+' : '-'}${formatCurrency(Math.abs(pnl))}
          </div>
          <div className={cn('text-xs font-bold mt-1', isPositive ? 'text-[#10b981]' : 'text-[#ef4444]')}>
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
        </div>

        {(position.takeProfit || position.stopLoss) && (
          <div className="mt-2 text-[10px] text-center text-muted-foreground font-bold">
            {position.takeProfit ? `TP: $${formatCurrency(position.takeProfit)}` : ''}
            {position.takeProfit && position.stopLoss ? ' · ' : ''}
            {position.stopLoss ? `SL: $${formatCurrency(position.stopLoss)}` : ''}
          </div>
        )}
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
        </div>
      </div>

      <div className="relative bg-surface/80 border border-white/10 rounded-[14px] p-2 backdrop-blur-2xl shadow-sm">
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

      <div className="flex gap-1 bg-surface/60 p-1 rounded-[12px] border border-white/5">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            onClick={() => setLeverage(lev)}
            className={cn(
              'flex-1 py-1.5 rounded-[10px] text-[10px] font-black transition-all duration-300',
              leverage === lev
                ? 'bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
            )}
          >
            {lev}x
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative bg-surface/80 border border-white/10 rounded-[14px] p-2 backdrop-blur-2xl shadow-sm">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">Take Profit</label>
          <input
            type="number"
            inputMode="decimal"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="bg-transparent text-sm font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="Optional"
          />
        </div>
        <div className="flex-1 relative bg-surface/80 border border-white/10 rounded-[14px] p-2 backdrop-blur-2xl shadow-sm">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">Stop Loss</label>
          <input
            type="number"
            inputMode="decimal"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="bg-transparent text-sm font-black text-foreground outline-none w-full tracking-tight placeholder-white/10"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={placingDirection !== null}
          onClick={() => handleSubmit('buy')}
          className="relative overflow-hidden group rounded-[14px] bg-gradient-to-b from-[#10b981] to-[#059669] px-4 py-2.5 shadow-[0_5px_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-black">
            {placingDirection === 'buy' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingUp className="w-4 h-4 drop-shadow-sm" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider drop-shadow-sm">{placingDirection === 'buy' ? 'Placing...' : 'LONG'}</span>
          </div>
        </button>
        <button
          disabled={placingDirection !== null}
          onClick={() => handleSubmit('sell')}
          className="relative overflow-hidden group rounded-[14px] bg-gradient-to-b from-[#ef4444] to-[#dc2626] px-4 py-2.5 shadow-[0_5px_15px_rgba(239,68,68,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-center gap-1.5 text-white">
            {placingDirection === 'sell' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} /> : <TrendingDown className="w-4 h-4 drop-shadow-sm" strokeWidth={4} />}
            <span className="text-[13px] font-black tracking-wider drop-shadow-sm">{placingDirection === 'sell' ? 'Placing...' : 'SHORT'}</span>
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
