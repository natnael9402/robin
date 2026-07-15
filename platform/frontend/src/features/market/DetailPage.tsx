'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { marketApi, assetsApi, walletApi, type NormalizedAsset } from '../../shared/api';
import { AssetChart } from '../../shared/components/ui/AssetChart';
import { Button } from '../../shared/components/ui/Button';
import { formatCurrency, safeNumber, cn } from '../../shared/lib/utils';
import { reanchorSeries, buildAnchoredSeries } from '../../shared/lib/series';
import { useToast } from '../../shared/contexts/ToastContext';
import { useState } from 'react';
import { Input } from '../../shared/components/ui/Input';
import { Modal } from '../../shared/components/ui/Modal';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { PageLoader } from '../../shared/components/ui/PageLoader';
import { TransferApprovalModal } from '../trade/components/TransferApprovalModal';
import { useParams } from 'next/navigation';

type RangeOption = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

const RANGE_LIMITS: Record<RangeOption, { interval: string; limit: number }> = {
  '1m':  { interval: '1m',  limit: 60 },
  '5m':  { interval: '5m',  limit: 60 },
  '15m': { interval: '15m', limit: 100 },
  '30m': { interval: '30m', limit: 100 },
  '1h':  { interval: '1h',  limit: 100 },
  '4h':  { interval: '4h',  limit: 100 },
  '1d':  { interval: '1d',  limit: 60 },
  '1w':  { interval: '1w',  limit: 52 },
  '1M':  { interval: '1M',  limit: 24 },
};

function formatCompact(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function RangeSelector({ value, onChange }: { value: RangeOption; onChange: (r: RangeOption) => void }) {
  const ranges: RangeOption[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];
  return (
    <div className="flex justify-center z-20">
      <div className="bg-surface/60 p-1 rounded-[20px] flex gap-1 border border-white/10 backdrop-blur-xl shadow-md w-full max-w-md mx-auto justify-between flex-wrap">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onChange(range)}
            className={cn(
              'flex-1 min-w-[40px] py-1 sm:py-2 rounded-2xl text-[9px] sm:text-xs font-black transition-all duration-300',
              value === range
                ? 'bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}

function AssetHeader({ item, isLoading }: { item: NormalizedAsset | null; isLoading?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const change = safeNumber(item?.changePercent);
  const positive = change >= 0;

  if (isLoading || !item) {
    return (
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center gap-3">
        {item.image && !imgError ? (
          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-full bg-white" onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 text-xs font-black uppercase text-primary">
            {item.symbol?.slice(0, 3)}
          </div>
        )}
        <div>
          <h1 className="text-xl font-black text-foreground">{item.name}</h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.symbol}</p>
        </div>
      </div>
      <div className="mb-1 font-mono text-4xl font-black text-foreground">${formatCurrency(item.price)}</div>
      <div className={cn('flex items-center gap-1.5 text-sm', positive ? 'text-primary' : 'text-destructive')}>
        {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>
          {positive ? '+' : '-'}${Math.abs(safeNumber(item.priceChange24h)).toFixed(2)} ({positive ? '+' : '-'}
          {Math.abs(change).toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

function StatGrid({ item }: { item: NormalizedAsset }) {
  const stats = [
    { label: 'Market Cap', value: formatCompact(item.marketCap) },
    { label: '24h Volume', value: formatCompact(item.volume) },
    { label: '24h High', value: item.high24h != null ? `$${item.high24h.toFixed(2)}` : '—' },
    { label: '24h Low', value: item.low24h != null ? `$${item.low24h.toFixed(2)}` : '—' },
  ];
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-border bg-surface p-3">
          <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
          <div className="font-mono text-sm font-black text-foreground">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ChartArea({
  history,
  prices,
  selectedRange,
  trend,
}: {
  history: { isLoading: boolean; isError: boolean };
  prices: any[];
  selectedRange: RangeOption;
  trend: 'up' | 'down';
}) {
  const height = 300;
  if (history.isError) {
    return (
      <div className="mb-4 flex w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground md:rounded-2xl" style={{ height }}>
        Chart data unavailable
      </div>
    );
  }
  return (
    <div key={selectedRange} className="chart-fadein mb-4">
      <AssetChart data={history.isLoading ? [] : prices} trend={trend} />
    </div>
  );
}

export function CryptoDetailPage({ params: _params }: { params: Promise<{ id: string }> }) {
  useDocumentTitle('Crypto · Paxora Capital');
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';
  return <Detail id={id as string} />;
}

function Detail({ id }: { id: string }) {
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedRange, setSelectedRange] = useState<RangeOption>('1h');

  const detail = useQuery({
    queryKey: ['market', 'crypto', id],
    queryFn: () => marketApi.getCryptoDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });

  // Use the ticker symbol (e.g. BTC) rather than the CoinGecko id (bitcoin) so the
  // backend can pull REAL Binance klines; the id only yields synthetic data.
  const historySymbol = detail.data?.symbol ?? id;
  const history = useQuery({
    queryKey: ['market', 'crypto', historySymbol, 'history', selectedRange],
    queryFn: () => {
      const { interval, limit } = RANGE_LIMITS[selectedRange];
      return marketApi.getCryptoHistory(historySymbol, interval, limit);
    },
    enabled: !!detail.data,
    staleTime: 60_000,
  });

  if (detail.isLoading) {
    return <PageLoader />;
  }

  if (!detail.data) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 pt-20 text-muted-foreground">
        <p>Asset not found</p>
        <a href="/market" className="text-sm font-semibold text-primary">Go to market</a>
      </div>
    );
  }

  const item = detail.data;
  const positive = safeNumber(item.changePercent) >= 0;
  const rawPrices = (history.data || []).map((h: any) => ({
    time: h.timestamp ?? h[0] ?? Date.now(),
    open: safeNumber(h.open ?? h.price ?? h[1]),
    high: safeNumber(h.high ?? h.price ?? h[1]),
    low: safeNumber(h.low ?? h.price ?? h[1]),
    close: safeNumber(h.close ?? h.price ?? h[1]),
  }));
  // Guarantee a coherent chart: re-anchor real/synthetic history to the live price,
  // or build an anchored series when the backend returns nothing.
  const prices = rawPrices.length > 0
    ? reanchorSeries(rawPrices, item.price)
    : (history.isLoading ? [] : buildAnchoredSeries(item.price, item.changePercent, selectedRange));

  return (
    <div className="mx-auto max-w-screen-lg px-0 pb-52 pt-20 md:px-6">
      <div className="px-5 md:px-0">
        <AssetHeader item={item} />
      </div>
      <div className="mt-4 -mx-0 md:mx-0">
        <ChartArea history={history} prices={prices} selectedRange={selectedRange} trend={positive ? 'up' : 'down'} />
      </div>
      <div className="mt-3 px-5 md:px-0">
        <RangeSelector value={selectedRange} onChange={setSelectedRange} />
      </div>
      <div className="px-5 md:px-0">
      <StatGrid item={item} />
      <TradePanel
        price={item.price}
        onBuy={() => { setTradeType('buy'); setTradeOpen(true); }}
        onSell={() => { setTradeType('sell'); setTradeOpen(true); }}
      />
      <TradeModal
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        type={tradeType}
        symbol={item.symbol}
        name={item.name}
        price={item.price}
      />
    </div>
    </div>
  );
}

function TradePanel({ price, onBuy, onSell }: { price: number; onBuy: () => void; onSell: () => void }) {
  // Sits ABOVE the floating BottomNav on mobile
  return (
    <div className="fixed inset-x-4 bottom-[104px] z-20 md:bottom-8 md:left-[calc(16rem+2rem)] md:right-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between rounded-[32px] bg-surface/70 p-2.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-3xl border border-border-light">
        <div className="pl-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Price</div>
          <div className="font-mono text-lg font-black text-foreground">${formatCurrency(price)}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" className="rounded-[24px] px-7 py-6 text-sm font-black shadow-lg shadow-destructive/20 hover:-translate-y-1 transition-all" onClick={onSell}>Sell</Button>
          <Button variant="lime" className="rounded-[24px] px-7 py-6 text-sm font-black shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all" onClick={onBuy}>Buy</Button>
        </div>
      </div>
    </div>
  );
}

function TradeModal({
  open,
  onClose,
  type,
  symbol,
  name,
  price,
}: {
  open: boolean;
  onClose: () => void;
  type: 'buy' | 'sell';
  symbol: string;
  name: string;
  price: number;
}) {
  const [amount, setAmount] = useState('100');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadOpen, setLoadOpen] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();

  // Live balance + holdings for premium context inside the modal.
  const balancesQuery = useQuery({ queryKey: ['trades', 'balances'], queryFn: () => walletApi.getBalances(), enabled: open, staleTime: 30_000 });
  const portfolio = useQuery({ queryKey: ['assets', 'portfolio'], queryFn: () => assetsApi.getPortfolio(), enabled: open, staleTime: 30_000 });

  const balance = safeNumber(balancesQuery.data?.spot ?? 0);
  const holding = safeNumber((portfolio.data || []).find((p: any) => p.symbol === symbol.toUpperCase())?.amount);
  const holdingValue = holding * price;
  const available = type === 'buy' ? balance : holdingValue;

  const numAmount = safeNumber(amount, NaN);
  const valid = !isNaN(numAmount) && numAmount > 0;
  const estQty = valid && price > 0 ? numAmount / price : 0;
  const insufficient = valid && numAmount > available;

  const handle = async () => {
    if (!valid) { setValidationError('Please enter a valid amount'); return; }
    if (insufficient) { setValidationError(type === 'buy' ? 'Insufficient balance' : 'Not enough holdings'); return; }
    setValidationError(null);
    try {
      if (type === 'buy') await assetsApi.buy(symbol.toUpperCase(), 'crypto', numAmount, price, name, 'crypto');
      else await assetsApi.sell(symbol.toUpperCase(), numAmount, price, name, 'crypto', 'crypto');
      toast.success(`${type === 'buy' ? 'Bought' : 'Sold'} ${symbol.toUpperCase()}`);
      qc.invalidateQueries({ queryKey: ['assets', 'portfolio'] });
      qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title={`${type === 'buy' ? 'Buy' : 'Sell'} ${symbol.toUpperCase()}`}>
      <div className="space-y-6 pt-2">
        {/* Glowing Balance indicator */}
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-surface to-background border border-white/5 p-4 shadow-inner">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Wallet size={14} className="text-primary" />
              {type === 'buy' ? 'Available Balance' : `${symbol.toUpperCase()} Holdings`}
            </div>
            <div className="font-mono text-base font-black text-foreground drop-shadow-md">
              {type === 'buy' ? `$${formatCurrency(available)}` : `${holding.toFixed(6)}`}
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Price</div>
          <div className="font-mono text-4xl font-black text-foreground tracking-tighter">${formatCurrency(price)}</div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-xl pointer-events-none rounded-[20px]" />
          <div className="relative bg-surface/80 border border-white/10 rounded-[24px] p-2 backdrop-blur-md">
            <Input
              label="Amount (USD)"
              type="number"
              value={amount}
              className="font-mono text-2xl font-black h-16 bg-transparent border-none shadow-none focus-visible:ring-0 px-4"
              leftAdornment={<span className="font-mono font-black text-muted-foreground text-2xl pl-2">$</span>}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAmount(e.target.value); setValidationError(null); }}
            />
            <button
              type="button"
              onClick={() => { setAmount(String(available.toFixed(2))); setValidationError(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-primary/20 text-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-primary/30 transition-colors"
            >
              Max
            </button>
          </div>
          {validationError && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-destructive animate-pulse">
              <AlertTriangle size={14} /> {validationError}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-3 rounded-[20px] bg-background/50 border border-white/5 p-5 text-sm backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs font-bold tracking-wide">Est. {type === 'buy' ? 'quantity' : 'proceeds'}</span>
            <span className="font-mono font-bold text-foreground">
              {type === 'buy' ? `${estQty.toFixed(6)} ${symbol.toUpperCase()}` : `$${formatCurrency(numAmount || 0)}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs font-bold tracking-wide">Network fee</span>
            <span className="font-mono font-bold text-primary">Free</span>
          </div>
          <div className="w-full h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="text-foreground font-black">Total</span>
            <span className="font-mono text-lg font-black text-foreground">${formatCurrency(numAmount || 0)}</span>
          </div>
        </div>

        {insufficient && type === 'buy' ? (
          <button
            onClick={() => setLoadOpen(true)}
            className="w-full rounded-[24px] py-5 text-lg font-black transition-all duration-300 relative overflow-hidden group bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 tracking-wide flex items-center justify-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Load Funds to Buy
            </span>
          </button>
        ) : (
          <button
            onClick={handle}
            disabled={insufficient}
            className={cn(
              "w-full rounded-[24px] py-5 text-lg font-black transition-all duration-300 relative overflow-hidden group",
              insufficient ? "bg-surface text-muted-foreground border border-border cursor-not-allowed" : 
              type === 'buy' 
                ? "bg-gradient-to-b from-[#10b981] to-[#059669] text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-[0.98]" 
                : "bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_40px_rgba(239,68,68,0.5)] hover:-translate-y-1 active:scale-[0.98]"
            )}
          >
            {!insufficient && <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />}
            <span className="relative z-10 tracking-wide">
              {insufficient ? (type === 'buy' ? 'Insufficient Balance' : 'Not Enough Holdings') : `Confirm ${type === 'buy' ? 'Buy' : 'Sell'}`}
            </span>
          </button>
        )}
      </div>

      <TransferApprovalModal
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        onApproved={() => { setLoadOpen(false); qc.invalidateQueries({ queryKey: ['trades', 'balances'] }); }}
        targetAccount="spot"
        currentBalance={balance}
        requiredAmount={numAmount || 0}
      />
    </Modal>
  );
}
