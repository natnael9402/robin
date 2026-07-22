'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { ArrowRight, ArrowLeftRight, Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { tradesApi } from '../../../shared/api';
import { useToast } from '../../../shared/contexts/ToastContext';
import { formatCurrency } from '../../../shared/lib/utils';
import { TransferApprovalModal } from './TransferApprovalModal';
import type { AssetOption } from '../logic/tradeMath';
import type { UserAsset } from '../../../shared/types';

export interface SpotTradeData {
  id: number;
  amount: number;
  fee: number;
  from_coin: string | null;
  to_coin: string | null;
  exchange_rate: number | null;
  entry_price: number;
  pnl: number;
  symbol: string;
  direction: 'buy' | 'sell';
  spot?: { quantity: number; market_price: number; exchange_rate: number | null; from_coin: string | null; to_coin: string | null };
  created_at: string;
}

interface Props {
  asset: AssetOption | null;
  balance: number;
  accountLabel?: string;
  onComplete: (result: { symbol: string; amount: string; profit: number; direction: 'buy' | 'sell'; tradeData?: SpotTradeData }) => void;
  allAssets: AssetOption[];
  portfolio: UserAsset[];
}

function SpotControlsBase({ asset, balance, accountLabel = 'Balance', onComplete, allAssets, portfolio }: Props) {
  const [fromCoin, setFromCoin] = useState('USDT');
  const [toCoin, setToCoin] = useState(asset?.symbol?.toUpperCase() ?? 'ETH');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const toast = useToast();

  const fromOptions = useMemo(() => {
    const coins = [{ symbol: 'USDT', label: 'USDT', balance }];
    for (const p of portfolio) {
      if (p.amount > 0) {
        coins.push({ symbol: p.symbol, label: `${p.symbol}`, balance: p.amount });
      }
    }
    return coins;
  }, [portfolio, balance]);

  const fromBalance = useMemo(() => {
    const found = fromOptions.find((c) => c.symbol === fromCoin);
    return found ? found.balance : 0;
  }, [fromOptions, fromCoin]);

  const toOptions = useMemo(() => {
    return allAssets.filter((a) => a.symbol.toUpperCase() !== fromCoin);
  }, [allAssets, fromCoin]);

  const currentPrice = useMemo(() => {
    const found = allAssets.find((a) => a.symbol.toUpperCase() === toCoin);
    return found?.current_price ?? 0;
  }, [allAssets, toCoin]);

  const exchangeRate = useMemo(() => {
    if (!currentPrice || currentPrice <= 0) return 0;
    if (fromCoin === 'USDT') return 1 / currentPrice;
    if (toCoin === 'USDT') return currentPrice;
    const fromPrice = allAssets.find((a) => a.symbol.toUpperCase() === fromCoin)?.current_price ?? 0;
    if (!fromPrice) return 0;
    return fromPrice / currentPrice;
  }, [fromCoin, toCoin, currentPrice, allAssets]);

  const numericAmount = Number(amount) || 0;
  const quantity = numericAmount * exchangeRate;

  const direction = fromCoin === 'USDT' ? 'buy' : 'sell';

  const swapCoins = useCallback(() => {
    const prevFrom = fromCoin;
    const prevTo = toCoin;
    if (prevTo !== 'USDT' && fromOptions.some((c) => c.symbol === prevTo)) {
      setFromCoin(prevTo);
    } else {
      setFromCoin('USDT');
    }
    setToCoin(prevFrom);
  }, [fromCoin, toCoin, fromOptions]);

  const handleSubmit = useCallback(async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter an amount');
      return;
    }
    if (fromCoin === toCoin) {
      toast.error('Source and target must be different');
      return;
    }
    if (fromCoin !== 'USDT' && amt > fromBalance) {
      setShowApproval(true);
      return;
    }
    if (fromCoin === 'USDT' && amt > balance) {
      setShowApproval(true);
      return;
    }
    setLoading(true);
    try {
      const res = await tradesApi.createSpot({
        symbol: `${toCoin}/USD`,
        direction,
        amount: amt,
        from_coin: fromCoin,
        to_coin: toCoin,
        exchange_rate: currentPrice || undefined,
      });
      const spotProfit = Number.isFinite(res.trade.pnl) ? Number(res.trade.pnl) : 0;
      onComplete({ symbol: `${fromCoin}/${toCoin}`, amount, profit: spotProfit, direction, tradeData: res.trade });
    } catch (err) {
      toast.error((err as Error).message ?? 'Spot trade failed');
    } finally {
      setLoading(false);
    }
  }, [amount, fromCoin, toCoin, fromBalance, balance, direction, currentPrice, onComplete, toast]);

  const handleApproved = useCallback(async () => {
    setShowApproval(false);
    setLoading(true);
    try {
      const res = await tradesApi.createSpot({
        symbol: `${toCoin}/USD`,
        direction,
        amount: Number(amount),
        from_coin: fromCoin,
        to_coin: toCoin,
        exchange_rate: currentPrice || undefined,
      });
      const spotProfit = Number.isFinite(res.trade.pnl) ? Number(res.trade.pnl) : 0;
      onComplete({ symbol: `${fromCoin}/${toCoin}`, amount, profit: spotProfit, direction, tradeData: res.trade });
    } catch (err) {
      toast.error((err as Error).message ?? 'Spot trade failed');
    } finally {
      setLoading(false);
    }
  }, [amount, fromCoin, toCoin, direction, currentPrice, onComplete, toast]);

  return (
    <div className="flex flex-col space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{accountLabel}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-black text-foreground">
            {showBalance ? `$${formatCurrency(balance)}` : '****'}
          </span>
          <button onClick={() => setShowBalance((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
            {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-surface/60 p-1 rounded-[12px] border border-white/5">
        <div className="flex-1 py-1.5 rounded-[10px] text-[10px] font-black text-center text-foreground bg-white/5">
          SWAP
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative bg-surface/80 border border-white/10 rounded-[14px] p-2 backdrop-blur-2xl shadow-sm">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">From</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFromPicker(true)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-sm font-black text-foreground">{fromCoin}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="flex-1 flex items-center">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-lg font-black text-foreground outline-none w-full tracking-tight placeholder-white/10 text-right"
                placeholder="0"
              />
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold mt-1">
            Available: {fromCoin === 'USDT' ? `$${formatCurrency(fromBalance)}` : `${fromBalance.toFixed(4)} ${fromCoin}`}
          </div>
        </div>

        <div className="flex justify-center -my-1 z-10">
          <button
            onClick={swapCoins}
            className="bg-surface border border-white/10 rounded-full p-1.5 hover:bg-white/10 transition-colors shadow-md"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="relative bg-surface/80 border border-white/10 rounded-[14px] p-2 backdrop-blur-2xl shadow-sm">
          <label className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block mb-0.5">To</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowToPicker(true)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-sm font-black text-foreground">{toCoin}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            <div className="flex-1 text-right">
              <span className="text-lg font-mono font-black text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                {quantity > 0 ? quantity.toFixed(6) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground">
        <span>Rate: 1 {fromCoin} ≈ {exchangeRate > 0 ? exchangeRate.toFixed(6) : '?'} {toCoin}</span>
        <ArrowRight className="w-3 h-3" />
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="relative overflow-hidden group rounded-[14px] px-4 py-2.5 shadow-[0_5px_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-b from-primary to-primary-hover"
      >
        <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center justify-center gap-1.5 text-black">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={4} />
          ) : (
            <span className="text-[13px] font-black tracking-wider drop-shadow-sm text-black">
              {loading ? 'Swapping...' : `Swap ${fromCoin} → ${toCoin}`}
            </span>
          )}
        </div>
      </button>

      <TransferApprovalModal
        open={showApproval}
        onClose={() => setShowApproval(false)}
        onApproved={handleApproved}
        currentBalance={balance}
        requiredAmount={Number(amount)}
        targetAccount="spot"
      />

      {showFromPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowFromPicker(false)}>
          <div className="bg-surface border border-white/10 rounded-t-3xl w-full max-w-md p-4 max-h-[50vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-black text-foreground mb-3">Select Source Coin</div>
            {fromOptions.map((opt) => (
              <button
                key={opt.symbol}
                onClick={() => { setFromCoin(opt.symbol); setShowFromPicker(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  fromCoin === opt.symbol ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-foreground'
                }`}
              >
                <span className="font-bold">{opt.symbol}</span>
                <span className="text-sm text-muted-foreground">
                  {opt.symbol === 'USDT' ? `$${formatCurrency(opt.balance)}` : `${opt.balance.toFixed(4)}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showToPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setShowToPicker(false)}>
          <div className="bg-surface border border-white/10 rounded-t-3xl w-full max-w-md p-4 max-h-[50vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-black text-foreground mb-3">Select Target Coin</div>
            {toOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setToCoin(opt.symbol.toUpperCase()); setShowToPicker(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  toCoin === opt.symbol.toUpperCase() ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-foreground'
                }`}
              >
                <span className="font-bold">{opt.symbol.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const SpotControls = memo(SpotControlsBase);
