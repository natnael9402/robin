import { safeNumber } from './utils';

export interface OHLC {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Re-anchor a candle series so its final close lands on `targetPrice`. Upstream
 * history (esp. synthetic fallbacks) can drift far from the live quote; scaling the
 * whole series by a single factor keeps the shape but makes the chart agree with the
 * price shown on the page. No-op when the series already ends near the target.
 */
export function reanchorSeries(series: OHLC[], targetPrice: number): OHLC[] {
  if (!series || series.length === 0 || !Number.isFinite(targetPrice) || targetPrice <= 0) return series || [];
  const lastClose = safeNumber(series[series.length - 1].close);
  if (lastClose <= 0) return series;
  const drift = Math.abs(lastClose - targetPrice) / targetPrice;
  if (drift < 0.12) return series; // already coherent
  const factor = targetPrice / lastClose;
  return series.map((c) => ({
    time: c.time,
    open: safeNumber(c.open) * factor,
    high: safeNumber(c.high) * factor,
    low: safeNumber(c.low) * factor,
    close: safeNumber(c.close) * factor,
  }));
}

/**
 * Build a believable OHLC walk that starts ~`changePercent` ago and ends exactly at
 * `price`. Used only when the backend returns no history at all, so the chart is never
 * empty and always matches the live quote.
 */
export function buildAnchoredSeries(price: number, changePercent: number, interval: string = '1h', points = 60): OHLC[] {
  const p = safeNumber(price, 100) || 100;
  const start = p / (1 + safeNumber(changePercent) / 100);
  const out: OHLC[] = [];
  const now = Date.now();

  let durationMs = 60 * 60_000;
  if (interval === '1m') durationMs = 60_000;
  else if (interval === '5m') durationMs = 5 * 60_000;
  else if (interval === '15m') durationMs = 15 * 60_000;
  else if (interval === '30m') durationMs = 30 * 60_000;
  else if (interval === '1h') durationMs = 60 * 60_000;
  else if (interval === '4h') durationMs = 4 * 60 * 60_000;
  else if (interval === '1d') durationMs = 24 * 60 * 60_000;
  else if (interval === '1w') durationMs = 7 * 24 * 60 * 60_000;
  else if (interval === '1M') durationMs = 30 * 24 * 60 * 60_000;
  const stepMs = durationMs / points;

  // Incorporate durationMs into the seed so different time filters generate different chart shapes
  let seed = Math.round(p * 100) + points + Math.floor(durationMs / 60000); 
  const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  };
  
  const walk = [0];
  for (let i = 1; i < points; i++) {
      walk.push(walk[i-1] + (random() - 0.5));
  }
  const walkEnd = walk[points - 1];

  let prevClose = start;

  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * stepMs;
    const progress = i / (points - 1);
    
    const linear = start + (p - start) * progress;
    const bridge = walk[i] - walkEnd * progress;
    
    // Scale amplitude relative to price to look believable.
    // Scale it down a bit based on points so it doesn't get wildly large.
    const amplitude = (p * 0.005) * (15 / Math.sqrt(points)); 
    
    const close = i === points - 1 ? p : linear + bridge * amplitude;
    const open = prevClose;
    
    const high = Math.max(open, close) + random() * (p * 0.001);
    const low = Math.min(open, close) - random() * (p * 0.001);
    
    out.push({ time: t, open, high, low, close });
    prevClose = close;
  }
  return out;
}
