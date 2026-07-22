'use client';

import { useRef, useEffect, useState } from 'react';
import { createChart, AreaSeries, CandlestickSeries, ColorType, CrosshairMode, type IChartApi, type ISeriesApi, type SeriesOptionsMap, type Time } from 'lightweight-charts';
import { LineChart, CandlestickChart as CandlesIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

type ChartMode = 'area' | 'candles';

interface Props {
  data: { time: number; price: number }[];
  strikePrice?: number;
  color?: string;
  height?: number | string;
  intervalSec: number;
}

const CHART_CANDLE_COUNT = 80;

// Generate a realistic price path backward from basePrice so the
// last candle's close ALWAYS equals basePrice — no disconnect with the live stream.
function generatePricePath(basePrice: number, intervalSec: number, count: number) {
  const dailyVol = 0.015;
  const volScale = Math.sqrt(intervalSec / 86400);
  const vol = dailyVol * volScale;
  const drift = 0.0002 * volScale;

  const prices: number[] = [basePrice];
  for (let i = 1; i < count; i++) {
    const ret = drift + (Math.random() - 0.5) * vol;
    prices.unshift(prices[0] / (1 + ret));
  }
  return prices;
}

function generateSyntheticCandles(
  basePrice: number,
  intervalSec: number,
  count: number,
  anchorSec: number
) {
  const now = Math.floor(anchorSec / intervalSec) * intervalSec;
  const prices = generatePricePath(basePrice, intervalSec, count);
  const candles: { time: Time; open: number; high: number; low: number; close: number }[] = [];

  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * intervalSec;
    const open = prices[Math.max(0, i - 1)] ?? basePrice;
    const close = prices[i];
    const rng = Math.abs(close - open) * (0.4 + Math.random() * 0.8);
    const wick = rng * (0.1 + Math.random() * 0.4);
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick * (0.3 + Math.random() * 0.7);
    candles.push({ time: t as Time, open, high: Math.max(high, low + 0.01), low, close });
  }
  return candles;
}

function generateSyntheticAreaPoints(
  basePrice: number,
  intervalSec: number,
  count: number,
  anchorSec: number
) {
  const now = Math.floor(anchorSec / intervalSec) * intervalSec;
  const prices = generatePricePath(basePrice, intervalSec, count);
  const points: { time: Time; value: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * intervalSec;
    points.push({ time: t as Time, value: prices[i] });
  }
  return points;
}

function precisionFromPrice(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 1) return 4;
  if (price >= 0.01) return 6;
  return 8;
}

export function PriceChartImpl({ data, strikePrice, color = '#10b981', height = '25vh', intervalSec }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<keyof SeriesOptionsMap> | null>(null);
  const [mode, setMode] = useState<ChartMode>('candles');

  const initDoneRef = useRef(false);
  const wasEmptyRef = useRef(false);
  const prevModeRef = useRef<ChartMode>('candles');
  const prevColorRef = useRef(color);
  const prevIntervalRef = useRef(intervalSec);
  const candleRef = useRef<{ time: number; open: number; high: number; low: number; close: number } | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const needsReset =
    mode !== prevModeRef.current ||
    color !== prevColorRef.current ||
    intervalSec !== prevIntervalRef.current;

  // Effect 1: create chart once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 300,
      layout: {
        background: { type: ColorType.Solid, color: '#0d1520' },
        textColor: '#5b6472',
        fontSize: 11,
        fontFamily: 'inherit',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(255,255,255,0.12)', width: 1, style: 2, labelBackgroundColor: '#2a362e' },
        horzLine: { color: 'rgba(255,255,255,0.12)', width: 1, style: 2, labelBackgroundColor: '#2a362e' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        scaleMargins: { top: 0.15, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: intervalSec < 3600,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      initDoneRef.current = false;
      candleRef.current = null;
    };
  }, [height]);

  // Effect 2: series lifecycle + data updates
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!data.length) {
      wasEmptyRef.current = true;
      return;
    }

    chart.applyOptions({
      timeScale: { secondsVisible: intervalSec < 3600 },
    });

    // Mode, color, or interval toggle — recreate series
    if (needsReset) {
      if (seriesRef.current) {
        try { chart.removeSeries(seriesRef.current); } catch { /* ok */ }
        seriesRef.current = null;
      }
      initDoneRef.current = false;
      prevModeRef.current = mode;
      prevColorRef.current = color;
      prevIntervalRef.current = intervalSec;
    }

    // Asset switch
    if (wasEmptyRef.current) {
      if (seriesRef.current) {
        try { chart.removeSeries(seriesRef.current); } catch { /* ok */ }
        seriesRef.current = null;
      }
      initDoneRef.current = false;
      wasEmptyRef.current = false;
    }

    // Create series if needed
    if (!seriesRef.current) {
      const prec = precisionFromPrice(data[0]?.price ?? 100);
      if (mode === 'area') {
        seriesRef.current = chart.addSeries(AreaSeries, {
          lineColor: color,
          topColor: color + '40',
          bottomColor: color + '05',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          priceFormat: { type: 'price', precision: prec, minMove: 1 / Math.pow(10, prec) },
        });
      } else {
        seriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
      }
    }

    // Bulk initial setData
    if (!initDoneRef.current) {
      const pt = data[0];
      if (!pt || pt.price <= 0) return;
      const anchorSec = Math.floor(pt.time / 1000);
      if (mode === 'area') {
        const points = generateSyntheticAreaPoints(pt.price, intervalSec, CHART_CANDLE_COUNT, anchorSec);
        if (points.length) {
          (seriesRef.current as ISeriesApi<'Area'>).setData(points);
          initDoneRef.current = true;
          lastUpdateTimeRef.current = Number(points[points.length - 1].time);
        }
      } else {
        const candles = generateSyntheticCandles(pt.price, intervalSec, CHART_CANDLE_COUNT, anchorSec);
        if (candles.length) {
          (seriesRef.current as ISeriesApi<'Candlestick'>).setData(candles);
          initDoneRef.current = true;
          const last = candles[candles.length - 1];
          candleRef.current = { time: Number(last.time), open: last.open, high: last.high, low: last.low, close: last.close };
          lastUpdateTimeRef.current = Number(last.time);
        }
      }
      chart.timeScale().fitContent();
      return;
    }

    // Real-time update
    const pt = data[0];
    if (!pt || pt.time <= 0 || pt.price <= 0) return;

    const ptSec = Math.floor(pt.time / 1000);
    const rawCandleTime = Math.floor(ptSec / intervalSec) * intervalSec;

    if (mode === 'area') {
      const useTime = Math.max(rawCandleTime, lastUpdateTimeRef.current);
      if (useTime > lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = useTime;
      }
      (seriesRef.current as ISeriesApi<'Area'>).update({ time: useTime as Time, value: pt.price });
    } else {
      if (candleRef.current && rawCandleTime === candleRef.current.time) {
        candleRef.current.high = Math.max(candleRef.current.high, pt.price);
        candleRef.current.low = Math.min(candleRef.current.low, pt.price);
        candleRef.current.close = pt.price;
        (seriesRef.current as ISeriesApi<'Candlestick'>).update({
          time: candleRef.current.time as Time,
          open: candleRef.current.open,
          high: candleRef.current.high,
          low: candleRef.current.low,
          close: candleRef.current.close,
        });
      } else if (candleRef.current && rawCandleTime < candleRef.current.time) {
        candleRef.current.high = Math.max(candleRef.current.high, pt.price);
        candleRef.current.low = Math.min(candleRef.current.low, pt.price);
        candleRef.current.close = pt.price;
        (seriesRef.current as ISeriesApi<'Candlestick'>).update({
          time: candleRef.current.time as Time,
          open: candleRef.current.open,
          high: candleRef.current.high,
          low: candleRef.current.low,
          close: candleRef.current.close,
        });
      } else {
        candleRef.current = { time: rawCandleTime, open: pt.price, high: pt.price, low: pt.price, close: pt.price };
        lastUpdateTimeRef.current = rawCandleTime;
        (seriesRef.current as ISeriesApi<'Candlestick'>).update({
          time: rawCandleTime as Time,
          open: pt.price,
          high: pt.price,
          low: pt.price,
          close: pt.price,
        });
      }
    }
  }, [data, mode, color, intervalSec]);

  return (
    <div className="relative w-full" style={{ background: '#0d1520', borderRadius: 'inherit', overflow: 'hidden', minHeight: height }}>
      <div ref={containerRef} style={{ width: '100%', height }} />

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 max-w-[90%] flex-wrap justify-end">
        <div className="flex gap-0.5 rounded-full border border-white/10 bg-black/40 p-0.5 backdrop-blur">
          <button
            onClick={() => setMode('area')}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
              mode === 'area' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LineChart size={13} />
            <span className="hidden sm:inline">Area</span>
          </button>
          <button
            onClick={() => setMode('candles')}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
              mode === 'candles' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CandlesIcon size={13} />
            <span className="hidden sm:inline">Candles</span>
          </button>
        </div>
      </div>
    </div>
  );
}
