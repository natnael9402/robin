'use client';

import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Timer, ArrowRightLeft, ArrowRight, Coins, DollarSign, Percent } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { formatCurrency } from '../../../shared/lib/utils';
import { cn } from '../../../shared/lib/utils';
import type { TradeDirection, TradeOutcome } from '../logic/tradeMath';
import type { SpotTradeData } from './SpotControls';
import type { TradeResolution } from '../../../shared/types';

interface Props {
  open: boolean;
  onClose: () => void;
  type: TradeDirection;
  symbol: string;
  amount: string;
  profit: number;
  outcome?: TradeOutcome;
  duration?: number;
  completedAt?: number;
  tradeData?: SpotTradeData;
  resolution?: TradeResolution;
}

export function TradeSuccessModal({ open, onClose, type, symbol, amount, profit, outcome, duration, completedAt, tradeData, resolution }: Props) {
  const isWin = outcome === 'WIN';
  const isLoss = outcome === 'LOSS';
  const isSpot = outcome === 'SPOT';
  const isGood = isWin || isSpot;

  const invest = Number(amount) || 0;
  const safeProfit = Number.isFinite(profit) ? profit : 0;
  const payout = invest + safeProfit;
  const roiPercent = invest > 0 ? ((safeProfit / invest) * 100) : 0;
  const absRoi = Math.abs(roiPercent);
  const pnlLabel = isWin ? 'Profit' : isLoss ? 'Loss' : 'Returned';
  const displayProfit = Number.isFinite(profit) ? profit : 0;

  const accentColor = isWin ? '#22c55e' : isLoss ? '#ef4444' : '#3b82f6';
  const accentBg = isWin ? 'from-emerald-500/20 to-emerald-600/5' : isLoss ? 'from-red-500/20 to-red-600/5' : 'from-blue-500/20 to-blue-600/5';
  const accentBorder = isWin ? 'border-emerald-500/30' : isLoss ? 'border-red-500/30' : 'border-blue-500/30';
  const accentText = isWin ? 'text-emerald-600 dark:text-emerald-400' : isLoss ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';
  const barColor = isWin ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : 'bg-blue-500';

  const symbolShort = symbol.replace('/USD', '').replace('USDT', '');

  const timeStr = completedAt
    ? new Date(completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const fromCoin = tradeData?.from_coin ?? symbol.split('/')[0] ?? '';
  const toCoin = tradeData?.to_coin ?? symbol.split('/')[1] ?? '';
  const spot = tradeData?.spot;
  const quantity = spot?.quantity ?? (tradeData ? Number(amount) * (tradeData.exchange_rate ?? 1) : 0);
  const exchangeRate = spot?.exchange_rate ?? tradeData?.exchange_rate ?? 0;
  const fee = tradeData?.fee ?? 0;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col -mt-2 relative"
      >
        <button
          onClick={onClose}
          className="absolute -top-1 right-0 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero section */}
        <div className={cn('relative overflow-hidden rounded-2xl border p-6 mb-4 bg-gradient-to-br', accentBg, accentBorder)}>
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl"
            style={{ background: accentColor, opacity: 0.15 }}
          />
          <div
            className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl"
            style={{ background: accentColor, opacity: 0.1 }}
          />

          <div className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className={cn(
                'mb-3',
                isWin ? 'text-emerald-500' : isLoss ? 'text-red-500' : 'text-blue-500',
              )}
            >
              <span className="text-2xl font-black tracking-widest">
                {isWin ? 'WIN' : isLoss ? 'LOSS' : 'SPOT'}
            </span>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                type === 'buy'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
              )}>
                {type === 'buy' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {type === 'buy' ? 'LONG' : 'SHORT'}
              </span>
              <span className="rounded-full border border-foreground/10 bg-foreground/5 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-muted-foreground">
                {symbolShort}
              </span>
              {outcome && (
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider',
                  isWin ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : isLoss ? 'bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                )}>
                  {isWin ? 'WON' : isLoss ? 'LOST' : 'SPOT'}
                </span>
              )}
            </div>

            {/* Spot swap pair display */}
            {isSpot && fromCoin && toCoin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex items-center justify-center gap-2.5 mt-2 mb-2"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-foreground">{fromCoin}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">{Number(amount).toFixed(4)}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <span className="text-lg font-black text-foreground">{toCoin}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">{typeof quantity === 'number' ? quantity.toFixed(6) : '0'}</span>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="mt-1"
            >
              <div className={cn('text-4xl font-black font-mono tracking-tight', accentText)}>
                {displayProfit >= 0 ? '+' : '-'}${formatCurrency(Math.abs(displayProfit))}
              </div>
              <div className={cn('mt-1 text-sm font-bold', accentText)}>
                {displayProfit >= 0 ? '+' : ''}{formatCurrency(absRoi)}%
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatBox
            label={isSpot ? `Spent` : 'Investment'}
            value={`${isSpot && fromCoin !== 'USDT' ? '' : '$'}${isSpot && fromCoin !== 'USDT' ? `${invest.toFixed(4)} ${fromCoin}` : `$${formatCurrency(invest)}`}`}
          />
          <StatBox
            label={isSpot ? 'Received' : 'Payout'}
            value={`${isSpot && toCoin !== 'USDT' ? '' : '$'}${isSpot && toCoin !== 'USDT' ? `${(typeof quantity === 'number' ? quantity : 0).toFixed(6)} ${toCoin}` : `$${formatCurrency(payout)}`}`}
            accent={isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          />
          <StatBox label={pnlLabel} value={`${displayProfit >= 0 ? '+' : '-'}$${formatCurrency(Math.abs(displayProfit))}`} accent={accentText} />
          {duration ? (
            <StatBox label="Duration" value={duration >= 60 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration}s`} icon={Timer} />
          ) : (
            <StatBox label="Net Return" value={`${displayProfit >= 0 ? '+' : ''}${formatCurrency(absRoi)}%`} accent={accentText} />
          )}
        </div>

        {/* Spot-specific details */}
        {isSpot && tradeData && (
          <div className="rounded-xl border border-border bg-surface/50 p-3.5 mb-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Coins className="w-3 h-3" /> Trade Details
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <DetailRow label="Exchange Rate" value={`1 ${fromCoin} ≈ ${Number(exchangeRate || 0).toFixed(6)} ${toCoin}`} icon={ArrowRightLeft} />
              <DetailRow label="Fee" value={`${Number(fee || 0).toFixed(4)} ${fromCoin === 'USDT' ? 'USDT' : fromCoin}`} icon={Percent} />
              <DetailRow label="Market Price" value={`$${tradeData.entry_price ? formatCurrency(Number(tradeData.entry_price)) : '?'}`} icon={DollarSign} />
              <DetailRow label="Quantity" value={`${(typeof quantity === 'number' ? quantity : Number(quantity || 0)).toFixed(6)} ${toCoin}`} icon={Coins} />
            </div>
          </div>
        )}

        {/* Options-specific details */}
        {!isSpot && resolution && (
          <div className="rounded-xl border border-border bg-surface/50 p-3.5 mb-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Timer className="w-3 h-3" /> Trade Details
            </div>
            <div className="flex flex-col gap-y-2">
              <DetailRow label="Trading direction" value={type === 'buy' ? 'Buy Long' : 'Sell Short'} />
              <DetailRow label="Amount" value={`${invest.toFixed(4)}`} />
              <DetailRow label="Opening price" value={`${resolution.entry_price ? formatCurrency(resolution.entry_price) : '?'}`} />
              <DetailRow label="Closed Price" value={`${resolution.exit_price ? formatCurrency(resolution.exit_price) : '?'}`} />
              <DetailRow label="Second" value={`${duration ?? '?'}`} />
              <DetailRow label="Expected Return:" value={`${resolution.return_rate ?? resolution.expected_return ?? '?'}%`} />
              <DetailRow label="P/L" value={<span className={accentText}>{displayProfit >= 0 ? '+' : '-'} {invest ? formatCurrency(Math.abs(displayProfit)) : displayProfit.toFixed(4)}</span>} />
              <DetailRow label="Withdrawal Fee" value={`${resolution.fee ? Number(resolution.fee).toFixed(6) : '0.000000'}`} />
              <DetailRow label="position opening time" value={resolution.opened_at ? new Date(resolution.opened_at).toLocaleString('sv').replace('T', ' ') : '?'} />
              <DetailRow label="Close time" value={resolution.closed_at ? new Date(resolution.closed_at).toLocaleString('sv').replace('T', ' ') : completedAt ? new Date(completedAt).toLocaleString('sv').replace('T', ' ') : '?'} />
            </div>
          </div>
        )}


        {/* ROI bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>ROI</span>
            <span className={cn('font-mono', accentText)}>{displayProfit >= 0 ? '+' : ''}{formatCurrency(absRoi)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-foreground/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(absRoi, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className={cn('absolute inset-y-0 rounded-full', barColor)}
              style={absRoi > 100 ? { background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` } : undefined}
            />
          </div>
        </div>

        {/* Timestamp */}
        {timeStr && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <Timer className="h-3 w-3" />
            {timeStr}
          </div>
        )}
      </motion.div>
    </Modal>
  );
}

function StatBox({ label, value, accent, icon: Icon }: { label: string; value: string; accent?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className={cn('mt-0.5 font-mono text-sm font-black text-foreground truncate', accent)}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3 h-3 text-muted-foreground shrink-0" />}
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <span className="ml-auto text-[11px] font-bold text-foreground">{value}</span>
    </div>
  );
}
