'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { useCryptoMarket, useStockMarket, useMetalsMarket } from '../market/hooks/useMarket';
import { useTradeBalances } from './hooks/useTradeBalances';
import { useActiveTrade } from './hooks/useActiveTrade';
import { usePriceStream } from './hooks/usePriceStream';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { TradeAssetSelector } from './components/TradeAssetSelector';
import { PriceDisplay } from './components/PriceDisplay';
import { TradeControls } from './components/TradeControls';
import { ActiveTradePanel } from './components/ActiveTradePanel';
import { AssetPickerModal } from './components/AssetPickerModal';
import { TransferApprovalModal } from './components/TransferApprovalModal';
import { TradeSuccessModal } from './components/TradeSuccessModal';
import { DepositModal } from '../../shared/components/DepositModal';
import { ChartSkeleton } from '../../shared/components/ui/ChartSkeleton';
import { cn, formatCurrency } from '../../shared/lib/utils';
import { OPTION_TRADE_RULES, TIME_INTERVALS, type AssetOption, type TradeDirection, type TradeDuration } from './logic/tradeMath';

export function TradeOptionPage() {
  useDocumentTitle('Binary Option · Paxora Premium');
  const toast = useToast();
  const queryClient = useQueryClient();
  const balances = useTradeBalances();
  const crypto = useCryptoMarket();
  const stocks = useStockMarket();
  const metals = useMetalsMarket();
  const trade = useActiveTrade();
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState<TradeDuration>(30);
  const [successModal, setSuccessModal] = useState<{ open: boolean; type: TradeDirection; symbol: string; amount: string; profit: number; outcome?: 'WIN' | 'LOSS' | 'SPOT'; duration?: number; completedAt?: number; resolution?: any }>({
    open: false,
    type: 'buy',
    symbol: '',
    amount: '',
    profit: 0,
  });
  const [loadOpen, setLoadOpen] = useState(false);
  const [loadTradeIntent, setLoadTradeIntent] = useState<TradeDirection | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [intervalSec, setIntervalSec] = useState(3600);
  const initialPriceRef = useRef<number | null>(null);

  const mapAsset = (a: any, type: 'crypto' | 'stock' | 'metal'): AssetOption => ({
    id: `${type}:${a.symbol ?? a.id}`,
    symbol: a.symbol,
    name: a.name,
    image: a.image ?? '',
    current_price: a.price,
    price_change_percentage_24h_in_currency: a.changePercent,
    type,
  });

  const assets: AssetOption[] = [
    ...(crypto.data ?? []).map((a) => mapAsset(a, 'crypto')),
    ...(stocks.data ?? []).map((a) => mapAsset(a, 'stock')),
    ...(metals.data ?? []).map((a) => mapAsset(a, 'metal')),
  ];
  const currentAsset = selectedAsset ?? (assets.length > 0 ? assets[0] : null);
  const hasValidPrice = currentAsset && currentAsset.current_price > 0 && initialPriceRef.current !== null;
  const stream = usePriceStream(hasValidPrice ? currentAsset.current_price : 0);

  useEffect(() => {
    if (currentAsset && initialPriceRef.current === null) {
      initialPriceRef.current = currentAsset.current_price;
      stream.reset(currentAsset.current_price);
    }
  }, [currentAsset, stream]);

  useEffect(() => {
    if (!trade.active) return;
    if (trade.timeLeft <= 0 && !trade.isResolving) {
      const dur = trade.active.duration;
      trade.resolve().then((res) => {
        if (!res) return;
        setSuccessModal({
          open: true,
          type: trade.active!.type,
          symbol: trade.active!.assetSymbol,
          amount: String(trade.active!.initialAmount),
          profit: res.profit,
          outcome: res.status,
          duration: dur,
          completedAt: Date.now(),
          resolution: res,
        });
        queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
      });
    }
  }, [trade, queryClient]);

  useEffect(() => {
    if (successModal.open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [successModal.open]);

  const handleAssetSelect = (asset: AssetOption) => {
    setSelectedAsset(asset);
    stream.reset(asset.current_price);
  };

  const handleDurationChange = (d: TradeDuration) => {
    setDuration(d);
    const rule = OPTION_TRADE_RULES[d];
    if (rule) {
      if (amount < rule.minCapital) {
        setAmount(rule.minCapital);
      } else if (amount > rule.maxCapital) {
        setAmount(rule.maxCapital);
      }
    }
  };

  const handleTrade = async (type: TradeDirection) => {
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!currentAsset) {
      toast.error('Select an asset first');
      return;
    }
    const rule = OPTION_TRADE_RULES[duration];
    if (rule && (amount < rule.minCapital || amount > rule.maxCapital)) {
      toast.error(`Amount must be between $${rule.minCapital.toLocaleString()} and $${rule.maxCapital.toLocaleString()} for ${duration}s trades`);
      return;
    }

    const fastTradeBal = balances.data?.fastTradeBalance ?? 0;
    const needed = amount - fastTradeBal;
    if (needed > 0) {
      setLoadTradeIntent(type);
      setDepositAmount(needed);
      setLoadOpen(true);
      return;
    }

    const symbol = currentAsset.symbol.toUpperCase();
    const visualStrike = stream.price;
    const marketType = currentAsset.type === 'metal' ? 'metals' : currentAsset.type === 'stock' ? 'stocks' : currentAsset.type;
    await trade.start({ assetSymbol: symbol, visualStrikePrice: visualStrike, amount, duration, type, marketType });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background pt-12 sm:pt-20 relative overflow-hidden md:max-w-[1600px] md:mx-auto w-full">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      <div className="px-3 sm:px-6 mb-1 sm:mb-2 shrink-0 relative z-20 md:px-10 xl:px-16">
        <PageHeader
          title="Binary Option"
          backHref="/trade"
          action={!trade.active ? (
            <TradeAssetSelector
              asset={currentAsset}
              onClick={() => setPickerOpen(true)}
            />
          ) : undefined}
        />
      </div>

      <div className="flex flex-col md:flex-row md:gap-8 flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full px-3 sm:px-6 md:px-10 xl:px-16 pb-80 md:pb-10">
        <div className="flex-1 min-h-[0px] shrink-0 relative z-10 pt-1 sm:pt-8 flex flex-col gap-2 sm:gap-3 pb-2">
          {hasValidPrice ? (
            <PriceDisplay
              price={stream.price}
              displayPrice={currentAsset?.current_price}
              points={stream.items}
              strikePrice={trade.active?.visualStrikePrice}
              intervalSec={intervalSec}
            />
          ) : (
            <ChartSkeleton />
          )}
          
          {/* Chart Timeframe Filter under the Chart */}
          <div className="flex justify-center z-20">
            <div className="bg-surface/60 p-1 rounded-[20px] flex gap-1 border border-white/10 backdrop-blur-xl shadow-md w-full max-w-sm mx-auto justify-between">
              {TIME_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntervalSec(opt.value)}
                  className={cn(
                    'flex-1 py-1 sm:py-2 rounded-2xl text-[9px] sm:text-xs font-black transition-all duration-300',
                    intervalSec === opt.value
                      ? 'bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-4 bottom-[84px] z-50 md:static md:inset-auto md:bottom-auto md:w-[400px] bg-surface/90 md:bg-surface/50 border border-white/10 md:border-border-light rounded-[32px] md:rounded-3xl p-4 md:p-6 backdrop-blur-3xl md:backdrop-blur-sm shadow-[0_16px_40px_-12px rgba(0,0,0,0.5)] md:shadow-none transition-all flex-none shrink-0 md:mt-4 mx-auto max-w-lg md:max-w-none w-auto">
          {trade.active && trade.active.initialAmount ? (
            <ActiveTradePanel
              timeLeft={trade.timeLeft}
              payout={trade.currentPayout}
              stake={trade.active.initialAmount}
              entryPrice={trade.active.visualStrikePrice}
              currentPrice={stream.price}
              returnRate={OPTION_TRADE_RULES[trade.active.duration]?.returnRate ?? 0}
              totalDuration={trade.active.duration}
            />
          ) : (
            <TradeControls
              amount={amount}
              duration={duration}
              placingDirection={trade.placingDirection}
              balance={balances.data?.fastTradeBalance ?? 0}
              accountLabel="Binary Option"
              onAmountChange={setAmount}
              onDurationChange={handleDurationChange}
              onTrade={handleTrade}
            />
          )}
        </div>
      </div>

      <TransferApprovalModal
        open={loadOpen}
        onClose={() => {
          setLoadOpen(false);
          setLoadTradeIntent(null);
        }}
        onApproved={() => {
          if (loadTradeIntent) {
            handleTrade(loadTradeIntent);
            setLoadTradeIntent(null);
          }
        }}
        onDeposit={(shortfall) => {
          setDepositAmount(shortfall);
          setDepositOpen(true);
        }}
        targetAccount="fast_trade"
        currentBalance={balances.data?.fastTradeBalance ?? 0}
        requiredAmount={Number(amount)}
      />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={(deposited) => {
          setDepositOpen(false);
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
          toast.success(`$${formatCurrency(deposited)} deposited successfully`);
          if (loadTradeIntent) {
            handleTrade(loadTradeIntent);
            setLoadTradeIntent(null);
          }
        }}
        prefillAmount={depositAmount}
      />

      <AssetPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        assets={assets}
        selectedId={currentAsset?.id}
        onSelect={handleAssetSelect}
      />

      <TradeSuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal((p) => ({ ...p, open: false }))}
        type={successModal.type}
        symbol={successModal.symbol}
        amount={successModal.amount}
        profit={successModal.profit}
        outcome={successModal.outcome}
        duration={successModal.duration}
        completedAt={successModal.completedAt}
        resolution={successModal.resolution}
      />
    </div>
  );
}
