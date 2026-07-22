'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { createChart, AreaSeries, CandlestickSeries, ColorType, CrosshairMode, type IChartApi, type ISeriesApi, type SeriesOptionsMap, type Time } from 'lightweight-charts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { PaxoraMark } from './PaxoraMark';
import { LineChart, CandlestickChart as CandlesIcon } from 'lucide-react';

function ChartLoader({ height }: { height: number | string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-none md:rounded-2xl"
      style={{ height, background: 'radial-gradient(130% 130% at 50% 45%, #12222e 0%, #0d1520 68%)' }}
    >
      <PaxoraMark size="md" />
    </motion.div>
  );
}

type ChartMode = 'area' | 'candles';

export interface CandlestickData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface AssetChartProps {
  data: CandlestickData[];
  height?: number | string;
  trend?: 'up' | 'down';
  defaultMode?: ChartMode;
  showToggle?: boolean;
}

function toUnix(t: number | string): number {
  if (typeof t === 'number') return t < 1e11 ? t : Math.floor(t / 1000);
  return Math.floor(new Date(t).getTime() / 1000);
}

export function AssetChart({ data, height = '25vh', trend, defaultMode = 'candles', showToggle = true }: AssetChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<keyof SeriesOptionsMap> | null>(null);
  const [mode, setMode] = useState<ChartMode>(defaultMode);

  const hasData = data && data.length > 0;

  const resolvedTrend = useMemo<'up' | 'down'>(() => {
    if (trend) return trend;
    if (!data || data.length < 2) return 'up';
    return data[data.length - 1].close >= data[0].close ? 'up' : 'down';
  }, [trend, data]);

  const color = resolvedTrend === 'up' ? '#10b981' : '#ef4444';

  useEffect(() => {
    const el = wrapperRef.current;
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
        secondsVisible: false,
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
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current) {
      try { chart.removeSeries(seriesRef.current); } catch { /* ok */ }
      seriesRef.current = null;
    }

    if (!hasData) return;

    const candles = data
      .map((d) => ({
        time: toUnix(d.time) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
      .sort((a, b) => Number(a.time) - Number(b.time))
      .filter((d, i, arr) => i === 0 || Number(d.time) !== Number(arr[i - 1].time));

    if (mode === 'area') {
      const series = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: color + '80',
        bottomColor: color + '05',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      series.setData(candles.map((c) => ({ time: c.time, value: c.close })));
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      series.setData(candles);
      seriesRef.current = series;
    }

    chart.timeScale().fitContent();
  }, [data, mode, color, hasData]);

  return (
    <div
      className="relative rounded-none md:rounded-2xl"
      style={{ background: '#0d1520', overflow: 'hidden', minHeight: height }}
    >
      <div ref={wrapperRef} style={{ width: '100%', height, visibility: hasData ? 'visible' : 'hidden' }} />

      <AnimatePresence>
        {!hasData && <ChartLoader key="paxora-loader" height={height} />}
      </AnimatePresence>

      {hasData && (
        <motion.div
          key="chart-body"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="absolute right-3 top-3 z-10"
        >
          {showToggle && (
            <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur">
              <button
                onClick={() => setMode('area')}
                aria-label="Area chart"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  mode === 'area' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LineChart size={15} />
              </button>
              <button
                onClick={() => setMode('candles')}
                aria-label="Candlestick chart"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  mode === 'candles' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <CandlesIcon size={15} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
