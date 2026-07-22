'use client';

import { useState, useEffect, use } from 'react';
import { assetsApi } from '@/lib/api';
import { marketApi, walletApi, type NormalizedAsset } from '../../../../../src/shared/api';
import { TrendingUp, TrendingDown, Activity, Wallet, ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AssetChart } from '../../../../../src/shared/components/ui/AssetChart';
import { getMetalMeta } from '../../../../../src/shared/lib/assetMeta';
import { safeNumber, formatCurrency, cn } from '../../../../../src/shared/lib/utils';
import { reanchorSeries, buildAnchoredSeries } from '../../../../../src/shared/lib/series';
import { TransferApprovalModal } from '../../../../../src/features/trade/components/TransferApprovalModal';
import { TradeSuccessModal } from '@/components/modals/TradeSuccessModal';

type Range = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

const RANGE_LIMITS: Record<Range, { interval: string; limit: number }> = {
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

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = use(params);
    const router = useRouter();
    const [stock, setStock] = useState<NormalizedAsset | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [range, setRange] = useState<Range>('1h');

    const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
    const [tradeShares, setTradeShares] = useState('');
    const [balances, setBalances] = useState<{ spot: number; trading: number; fast_trade: number }>({ spot: 0, trading: 0, fast_trade: 0 });
    const [portfolioItem, setPortfolioItem] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const refreshUserData = async (sym?: string) => {
        try {
            const [bal, portfolio] = await Promise.all([walletApi.getBalances(), assetsApi.getPortfolio()]);
            setBalances({ spot: safeNumber(bal?.spot), trading: safeNumber(bal?.trading), fast_trade: safeNumber(bal?.fast_trade) });
            const target = (sym ?? stock?.symbol ?? '').toUpperCase();
            setPortfolioItem((portfolio || []).find((p: any) => p.symbol === target));
        } catch (e) {
            console.error(e);
        }
    };

    // Load the asset once.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const found = await marketApi.getStockDetail(symbol);
                if (!active) return;
                setStock(found);
                if (found) refreshUserData(found.symbol);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [symbol]);

    // (Re)load history when range or asset changes.
    useEffect(() => {
        if (!stock) return;
        let active = true;
        setChartLoading(true);
        const market = stock.type === 'metal' ? 'metals' : 'stocks';
        const { interval, limit } = RANGE_LIMITS[range];
        marketApi
            .getStockHistory(stock.symbol, interval, market, limit)
            .then((hist: any[]) => {
                if (!active) return;
                const formatted = (hist || []).map((item: any) => ({
                    time: item.timestamp ?? item[0] ?? Date.now(),
                    open: safeNumber(item.open ?? item.price ?? item[1]),
                    high: safeNumber(item.high ?? item.price ?? item[1]),
                    low: safeNumber(item.low ?? item.price ?? item[1]),
                    close: safeNumber(item.close ?? item.price ?? item[1]),
                }));
                setHistory(formatted);
            })
            .finally(() => active && setChartLoading(false));
        return () => { active = false; };
    }, [stock, range]);

    const price = safeNumber(stock?.price);
    const changePercent = safeNumber(stock?.changePercent);
    const isPositive = changePercent >= 0;
    const metalMeta = stock ? getMetalMeta(stock.symbol) : undefined;

    // Always render a coherent chart that agrees with the live price.
    const chartSeries = chartLoading
        ? []
        : history.length > 0
            ? reanchorSeries(history, price)
            : buildAnchoredSeries(price, changePercent, range);

    const numShares = safeNumber(tradeShares, 0);
    const estUsdAmount = numShares * price;
    const holdingShares = safeNumber(portfolioItem?.amount);
    const holdingValue = holdingShares * price;

    const isStock = stock?.type === 'stock';
    const userBalance = isStock ? balances.fast_trade : balances.spot;
    const tradeTargetAccount = isStock ? 'fast_trade' : 'spot';

    const handleTrade = async () => {
        if (!stock || numShares <= 0) return;
        if (tradeMode === 'buy' && estUsdAmount > userBalance) {
            setShowTransferModal(true);
            return;
        }
        if (tradeMode === 'sell' && numShares > holdingShares) {
            setShowTransferModal(true);
            return;
        }
        setProcessing(true);
        try {
            await new Promise((r) => setTimeout(r, 1200));
            const sym = stock.symbol.toUpperCase();
            
            if (stock.type === 'stock') {
                if (tradeMode === 'buy') await assetsApi.buyStock(sym, numShares, price);
                else await assetsApi.sellStock(sym, numShares, price);
            } else {
                // Metals or other
                const mt: any = stock.type === 'crypto' ? 'crypto' : stock.type === 'metal' ? 'metals' : 'stocks';
                if (tradeMode === 'buy') await assetsApi.buy(sym, mt, estUsdAmount, price, stock.name, mt);
                else await assetsApi.sell(sym, estUsdAmount, price, stock.name, mt, mt);
            }
            
            setShowSuccessModal(true);
            await refreshUserData(sym);
        } catch (e: any) {
            alert(e.message || 'Trade failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 pt-24 text-center text-muted-foreground">Loading…</div>;
    if (!stock) return (
        <div className="flex flex-col items-center gap-3 p-8 pt-24 text-center text-muted-foreground">
            <p>Asset not found</p>
            <button onClick={() => router.push('/market')} className="text-sm font-semibold text-primary">Go to market</button>
        </div>
    );

    return (
        <div className="relative mx-auto max-w-6xl px-0 pb-40 pt-20 md:px-4 lg:px-6 lg:pb-24 lg:pt-24">
            {/* Asset identity */}
            <div className="mb-8 flex flex-col items-center justify-center px-5 md:px-0">
                {stock.image ? (
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <img src={stock.image} alt={stock.name} className="h-full w-full object-contain" />
                    </div>
                ) : metalMeta ? (
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-hover text-4xl shadow-[0_0_40px_rgba(255,255,255,0.06)]">
                        {metalMeta.icon}
                    </div>
                ) : (
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 text-2xl font-black uppercase text-primary">
                        {stock.symbol.slice(0, 3)}
                    </div>
                )}
                <h1 className="mb-1 text-center font-heading text-4xl font-black tracking-tight text-foreground lg:text-5xl">{stock.name}</h1>
                <span className="font-mono text-lg uppercase tracking-widest text-muted-foreground">{stock.symbol}</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Chart + price */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="mb-2 flex flex-col items-center justify-center gap-2 px-5 md:px-0">
                        <div className="font-mono text-4xl font-bold tracking-tighter text-foreground lg:text-5xl">
                            ${formatCurrency(price)}
                        </div>
                        <div className={`flex items-center gap-2 text-lg font-medium ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                            {isPositive ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                            {isPositive ? '+' : '-'}{Math.abs(changePercent).toFixed(2)}%
                        </div>
                    </div>

                    <div className="rounded-none border-x-0 border-y border-border bg-surface/50 p-4 md:rounded-2xl md:border lg:p-6">
                        <div className="mb-5">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <Activity className="size-5 text-primary" /> Price History
                            </h2>
                        </div>
                        <div key={range} className="chart-fadein w-auto -mx-4 md:mx-0">
                            <AssetChart data={chartSeries} trend={isPositive ? 'up' : 'down'} />
                        </div>
                        <div className="flex justify-center z-20 mt-3">
                            <div className="bg-surface/60 p-1 rounded-[20px] flex gap-1 border border-white/10 backdrop-blur-xl shadow-md w-full max-w-md mx-auto justify-between flex-wrap">
                                {(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'] as Range[]).map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={cn(
                                            'flex-1 min-w-[40px] py-1 sm:py-2 rounded-2xl text-[9px] sm:text-xs font-black transition-all duration-300',
                                            range === r
                                                ? 'bg-gradient-to-b from-primary to-primary-hover text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade panel */}
                <div className="px-5 md:px-0 lg:col-span-1">
                    <div className="sticky top-24 h-fit rounded-3xl border border-border bg-surface p-6">
                        <h2 className="mb-6 font-heading text-xl font-bold">Trade {stock.name}</h2>

                        <div className="mb-6 flex rounded-xl border border-border bg-background p-1">
                            <button
                                onClick={() => { setTradeMode('buy'); setTradeShares(''); }}
                                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                                    tradeMode === 'buy' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Long (Buy)
                            </button>
                            <button
                                onClick={() => { setTradeMode('sell'); setTradeShares(''); }}
                                className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
                                    tradeMode === 'sell' ? 'bg-destructive text-foreground shadow-lg shadow-red-500/20' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Short (Sell)
                            </button>
                        </div>

                        {/* Balance chip */}
                        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Wallet size={14} /> {tradeMode === 'buy' ? 'Available' : 'Holdings'}
                            </span>
                            <span className="font-mono text-sm font-bold text-foreground">
                                {tradeMode === 'buy'
                                    ? `$${formatCurrency(userBalance)}`
                                    : `${holdingShares.toFixed(6)} ${stock.symbol}`}
                            </span>
                        </div>

                        {/* Amount input */}
                        <div className="relative mb-6">
                            <input
                                type="number"
                                value={tradeShares}
                                onChange={(e) => setTradeShares(e.target.value)}
                                placeholder="0"
                                className={`w-full rounded-xl border bg-background py-4 pl-4 pr-16 text-lg font-bold text-foreground transition-colors focus:outline-none ${
                                    tradeMode === 'buy' ? 'border-border focus:border-primary' : 'border-border focus:border-destructive'
                                }`}
                            />
                            <button
                                onClick={() => {
                                    const maxShares = tradeMode === 'buy' ? (price > 0 ? userBalance / price : 0) : holdingShares;
                                    setTradeShares(String(maxShares.toFixed(6)));
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-muted-foreground hover:text-foreground"
                            >
                                Max
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="mb-6 space-y-3 rounded-xl bg-background/40 p-4 text-sm">
                            <Row label="Price" value={`$${formatCurrency(price)}`} />
                            <Row label="Shares" value={`${numShares.toFixed(6)}`} />
                            <Row label="Est. Total" value={`$${formatCurrency(estUsdAmount)}`} strong />
                        </div>

                        <button
                            onClick={handleTrade}
                            disabled={processing || numShares <= 0}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                                tradeMode === 'buy'
                                    ? 'bg-primary text-primary-foreground shadow-primary/10 hover:bg-primary-hover'
                                    : 'bg-destructive text-foreground shadow-red-500/10 hover:bg-red-600'
                            }`}
                        >
                            {processing ? 'Processing…' : (<>{tradeMode === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}</>)}
                        </button>
                    </div>
                </div>
            </div>

            <TransferApprovalModal
                open={showTransferModal}
                onClose={() => setShowTransferModal(false)}
                onApproved={() => { setShowTransferModal(false); refreshUserData(); }}
                targetAccount={tradeTargetAccount}
                currentBalance={userBalance}
                requiredAmount={tradeMode === 'buy' ? estUsdAmount : holdingValue}
            />
            <TradeSuccessModal
                isOpen={showSuccessModal}
                onClose={() => { setShowSuccessModal(false); setTradeShares(''); }}
                type={tradeMode}
                symbol={stock.symbol}
                amount={tradeShares}
                outcome="SPOT"
            />
        </div>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-mono ${strong ? 'font-bold text-foreground' : 'text-foreground'}`}>{value}</span>
        </div>
    );
}
