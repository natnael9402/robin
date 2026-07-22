'use client';

import { useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useCryptoMarket, useStockMarket, useMetalsMarket } from '../market/hooks/useMarket';
import { useTradeBalances } from './hooks/useTradeBalances';
import { usePriceStream } from './hooks/usePriceStream';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { TradeAssetSelector } from './components/TradeAssetSelector';
import { PriceDisplay } from './components/PriceDisplay';
import { ContractControls } from './components/ContractControls';
import { AssetPickerModal } from './components/AssetPickerModal';
import { TradeSuccessModal } from './components/TradeSuccessModal';
import { ChartSkeleton } from '../../shared/components/ui/ChartSkeleton';
import { cn } from '../../shared/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useToast } from '../../shared/contexts/ToastContext';
import { TIME_INTERVALS, type AssetOption, type TradeDirection } from './logic/tradeMath';

export function TradeContractPage() {
  useDocumentTitle('Contract · PAXORA');
  const toast = useToast();
  const queryClient = useQueryClient();
  const balances = useTradeBalances();
  const crypto = useCryptoMarket();
  const stocks = useStockMarket();
  const metals = useMetalsMarket();
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [intervalSec, setIntervalSec] = useState(3600);
  const [successModal, setSuccessModal] = useState<{ open: boolean; type: TradeDirection; symbol: string; amount: string; profit: number; outcome?: 'WIN' | 'LOSS' | 'SPOT'; completedAt?: number }>({
    open: false,
    type: 'buy',
    symbol: '',
    amount: '',
    profit: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const initialPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (successModal.open) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [successModal.open]);

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

  const handleAssetSelect = (asset: AssetOption) => {
    setSelectedAsset(asset);
    stream.reset(asset.current_price);
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
      toast.success('Balance updated');
    } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background pt-12 sm:pt-20 md:max-w-[1600px] md:mx-auto w-full">

      <div className="px-3 sm:px-6 mb-1 sm:mb-2 shrink-0 relative z-20 md:px-10 xl:px-16">
        <PageHeader
          title="Contract Trade"
          backHref="/trade"
          action={
            <div className="flex items-center gap-2">
              <TradeAssetSelector
                asset={currentAsset}
                onClick={() => setPickerOpen(true)}
              />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-all hover:bg-surface/80 hover:text-foreground disabled:pointer-events-none"
              >
                <style>{`@keyframes spin-refresh{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.spin-refresh{animation:spin-refresh .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
                <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 'spin-refresh' : ''}`} />
              </button>
            </div>
          }
        />
      </div>

      <div className="flex flex-col md:flex-row md:gap-8 flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full px-3 sm:px-6 md:px-10 xl:px-16 pb-80 md:pb-10">
        <div className="flex-1 min-h-[0px] shrink-0 relative z-10 pt-1 sm:pt-8 flex flex-col gap-2 sm:gap-3 pb-2">
          {hasValidPrice ? (
            <PriceDisplay
              price={stream.price}
              displayPrice={currentAsset?.current_price}
              points={stream.items}
              intervalSec={intervalSec}
            />
          ) : (
            <ChartSkeleton />
          )}

          <div className="flex justify-center z-20">
            <div className="bg-surface p-1 rounded-xl flex gap-1 border border-border w-full max-w-sm mx-auto justify-between">
              {TIME_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntervalSec(opt.value)}
                  className={cn(
                    'flex-1 py-1 sm:py-2 rounded-lg text-[9px] sm:text-xs font-bold transition-all',
                    intervalSec === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-4 bottom-[84px] z-50 md:static md:inset-auto md:bottom-auto md:w-[400px] bg-surface border border-border rounded-2xl p-4 md:p-6 transition-all flex-none shrink-0 md:mt-4 mx-auto max-w-lg md:max-w-none w-auto">
          <ContractControls
            asset={currentAsset}
            balance={balances.data?.tradingBalance ?? 0}
            accountLabel="Trading"
            currentPrice={stream.price}
            onComplete={(res) => {
              setSuccessModal({
                open: true,
                type: res.direction,
                symbol: res.symbol,
                amount: res.amount,
                profit: res.profit,
                outcome: res.profit >= 0 ? 'WIN' : 'LOSS',
                completedAt: Date.now(),
              });
              queryClient.invalidateQueries({ queryKey: ['trades', 'balances'] });
            }}
          />
        </div>
      </div>

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
        completedAt={successModal.completedAt}
      />
    </div>
  );
}
