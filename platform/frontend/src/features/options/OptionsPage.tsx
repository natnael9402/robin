'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Zap, Shield, Target, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { tradesApi, authApi, walletApi, type NormalizedAsset } from '../../shared/api';
import { useCryptoMarket } from '../market/hooks/useMarket';
import { formatCurrency, safeNumber, cn } from '../../shared/lib/utils';
import { QuickLoadModal } from '../trade/components/QuickLoadModal';
import { DepositModal } from '../../shared/components/DepositModal';

const LEVERAGE_PRESETS = [2, 5, 10, 20, 50, 100];

export function OptionsPage() {
  useDocumentTitle('Contracts · Paxora Capital');
  const toast = useToast();
  const qc = useQueryClient();
  const router = useRouter();
  const crypto = useCryptoMarket();

  const [showBalance, setShowBalance] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  const profile = useQuery({ queryKey: ['profile'], queryFn: () => authApi.getProfile(), staleTime: 30_000 });
  const balances = useQuery({
    queryKey: ['trades', 'balances'],
    queryFn: () => walletApi.getBalances(),
    staleTime: 30_000,
  });
  const positions = useQuery({
    queryKey: ['trades', 'contracts'],
    queryFn: () => tradesApi.getUserTrades({ type: 'contract', status: 'open', per_page: 50 }),
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const balance = safeNumber(balances.data?.trading ?? 0);

  // Form state
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(10);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const assets: NormalizedAsset[] = useMemo(() => crypto.data ?? [], [crypto.data]);
  const currentAsset = useMemo(() => assets.find(a => a.symbol.toUpperCase() === selectedSymbol.toUpperCase()) ?? assets[0], [assets, selectedSymbol]);
  const price = safeNumber(currentAsset?.price);

  const numAmount = safeNumber(amount, 0);
  const positionSize = numAmount * leverage;
  const estLiquidation = direction === 'buy'
    ? price * (1 - 1 / leverage * 0.95)
    : price * (1 + 1 / leverage * 0.95);

  const handleSubmit = async () => {
    if (numAmount <= 0) { toast.error('Enter a valid margin'); return; }
    if (numAmount > balance) {
      setDepositAmount(numAmount);
      setDepositOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      await tradesApi.createContract({
        symbol: `${selectedSymbol.toUpperCase()}/USD`,
        direction,
        amount: numAmount,
        leverage,
        take_profit: takeProfit ? Number(takeProfit) : undefined,
        stop_loss: stopLoss ? Number(stopLoss) : undefined,
        market_type: 'crypto',
      });
      toast.success(`${leverage}x ${direction.toUpperCase()} opened!`);
      qc.invalidateQueries({ queryKey: ['trades', 'contracts'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      setAmount('100');
      setTakeProfit('');
      setStopLoss('');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to open contract');
    } finally {
      setSubmitting(false);
    }
  };

  const positionsList = (positions.data as any)?.trades?.data ?? [];

  return (
    <div className="px-4 pt-24 pb-32 md:max-w-6xl md:mx-auto w-full min-h-[calc(100dvh-96px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Futures Trading</h1>
        <p className="text-sm text-muted-foreground mt-1">Leveraged contracts up to 100×</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── ORDER FORM ── */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="relative rounded-[28px] bg-surface/60 border border-white/5 p-6 backdrop-blur-xl shadow-2xl">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

            {/* Asset selector */}
            <button
              onClick={() => setPickerOpen(!pickerOpen)}
              className="w-full flex items-center justify-between rounded-[20px] bg-background/60 border border-white/5 p-3.5 mb-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {currentAsset?.image && <img src={currentAsset.image} className="w-8 h-8 rounded-full" alt="" />}
                <div className="text-left">
                  <div className="text-sm font-black text-foreground">{currentAsset?.symbol?.toUpperCase() ?? '...'}</div>
                  <div className="text-[10px] text-muted-foreground">{currentAsset?.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-foreground">${formatCurrency(price)}</div>
              </div>
            </button>

            {/* Quick asset picker dropdown */}
            {pickerOpen && (
              <div className="absolute left-4 right-4 top-[100px] z-50 max-h-48 overflow-y-auto rounded-[16px] bg-surface border border-white/10 shadow-2xl backdrop-blur-2xl">
                {assets.slice(0, 20).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedSymbol(a.symbol); setPickerOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {a.image && <img src={a.image} className="w-6 h-6 rounded-full" alt="" />}
                    <span className="text-sm font-bold text-foreground">{a.symbol.toUpperCase()}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">${formatCurrency(a.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Direction Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                onClick={() => setDirection('buy')}
                className={cn(
                  'py-3 rounded-[16px] text-sm font-black transition-all duration-300',
                  direction === 'buy'
                    ? 'bg-gradient-to-b from-[#10b981] to-[#059669] text-black shadow-[0_8px_20px_rgba(16,185,129,0.3)]'
                    : 'bg-background/60 text-muted-foreground border border-white/5 hover:text-foreground'
                )}
              >
                <TrendingUp className="w-4 h-4 inline mr-1.5" />Long
              </button>
              <button
                onClick={() => setDirection('sell')}
                className={cn(
                  'py-3 rounded-[16px] text-sm font-black transition-all duration-300',
                  direction === 'sell'
                    ? 'bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)]'
                    : 'bg-background/60 text-muted-foreground border border-white/5 hover:text-foreground'
                )}
              >
                <TrendingDown className="w-4 h-4 inline mr-1.5" />Short
              </button>
            </div>

            {/* Margin Input */}
            <div className="mb-5">
              <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase block mb-2">Margin (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-muted-foreground">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background/60 border border-white/5 rounded-[16px] py-3.5 pl-10 pr-16 font-mono text-lg font-bold text-foreground outline-none focus:border-primary/30 transition-colors"
                  placeholder="0"
                />
                <button
                  onClick={() => setAmount(String(balance.toFixed(2)))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary/20 text-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider hover:bg-primary/30 transition-colors"
                >
                  Max
                </button>
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Balance:</span>
                  <span className="text-foreground font-bold">{showBalance ? `$${formatCurrency(balance)}` : '****'}</span>
                  <button
                    onClick={() => setShowBalance((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <button
                  onClick={() => setLoadOpen(true)}
                  className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  Load
                </button>
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Leverage</label>
                <span className="text-primary font-mono font-black text-lg">{leverage}×</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-2 bg-background/60 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.5)] [&::-webkit-slider-thumb]:appearance-none"
              />
              <div className="flex justify-between mt-2 gap-1.5">
                {LEVERAGE_PRESETS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLeverage(l)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all',
                      leverage === l
                        ? 'bg-primary/20 text-primary'
                        : 'bg-background/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {l}×
                  </button>
                ))}
              </div>
            </div>

            {/* TP / SL */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1 mb-1.5">
                  <Target size={10} className="text-primary" /> Take Profit
                </label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-background/60 border border-white/5 rounded-xl py-2.5 px-3 font-mono text-sm text-foreground outline-none focus:border-primary/30 transition-colors placeholder-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-1 mb-1.5">
                  <Shield size={10} className="text-destructive" /> Stop Loss
                </label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-background/60 border border-white/5 rounded-xl py-2.5 px-3 font-mono text-sm text-foreground outline-none focus:border-destructive/30 transition-colors placeholder-white/10"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-[16px] bg-background/40 border border-white/5 p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs font-bold">Position Size</span>
                <span className="font-mono font-bold text-foreground">${formatCurrency(positionSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs font-bold">Entry Price</span>
                <span className="font-mono font-bold text-foreground">${formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs font-bold">Est. Liquidation</span>
                <span className="font-mono font-bold text-destructive">${formatCurrency(estLiquidation)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || numAmount <= 0}
              className={cn(
                'w-full rounded-[20px] py-4 text-base font-black transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:pointer-events-none',
                direction === 'buy'
                  ? 'bg-gradient-to-b from-[#10b981] to-[#059669] text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] active:scale-[0.98]'
                  : 'bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_40px_rgba(239,68,68,0.5)] active:scale-[0.98]'
              )}
            >
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Open {leverage}× {direction === 'buy' ? 'Long' : 'Short'}
              </span>
            </button>
          </div>
        </div>

        {/* ── POSITIONS PANEL ── */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
          <button
            onClick={() => router.push('/options/positions')}
            className="w-full rounded-[28px] bg-surface/60 border border-white/5 p-6 backdrop-blur-xl shadow-2xl text-left group relative overflow-hidden cursor-pointer transition-all hover:bg-surface/80 hover:border-primary/20 active:scale-[0.99]"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full pointer-events-none transition-all group-hover:bg-primary/10" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">Open Positions</h2>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">
                    {positionsList.length > 0
                      ? `${positionsList.length} active contract${positionsList.length !== 1 ? 's' : ''}`
                      : 'View and manage your contracts'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {positionsList.length > 0 && (
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full">{positionsList.length}</span>
                )}
                <ArrowRight className="w-5 h-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
              </div>
            </div>
          </button>

        </div>
      </div>
      <QuickLoadModal
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        targetAccount="trading"
        balances={{
          spot: balances.data?.spot ?? 0,
          trading: balances.data?.trading ?? 0,
          fast_trade: balances.data?.fast_trade ?? 0,
        }}
      />
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={(deposited) => {
          setDepositOpen(false);
          qc.invalidateQueries({ queryKey: ['profile'] });
          qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
          toast.success(`$${formatCurrency(deposited)} deposited successfully`);
        }}
        prefillAmount={depositAmount}
      />
    </div>
  );
}
