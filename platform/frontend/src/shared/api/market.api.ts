import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import { safeNumber } from '../lib/utils';
import { getDisplayName, inferType, type AssetType } from '../lib/assetMeta';
import type { MarketCoin, Stock } from '../types';

const http = createHttpClient(config.apiUrl);

const STOCK_SYMBOLS = ['AAPL','TSLA','NVDA','MSFT','AMZN','GOOGL','META'];
const STOCK_LOGOS: Record<string, string> = {
  AAPL: 'https://s3-symbol-logo.tradingview.com/apple--big.svg',
  TSLA: 'https://s3-symbol-logo.tradingview.com/tesla--big.svg',
  NVDA: 'https://s3-symbol-logo.tradingview.com/nvidia--big.svg',
  MSFT: 'https://s3-symbol-logo.tradingview.com/microsoft--big.svg',
  AMZN: 'https://s3-symbol-logo.tradingview.com/amazon--big.svg',
  GOOGL: 'https://s3-symbol-logo.tradingview.com/alphabet--big.svg',
  META: 'https://s3-symbol-logo.tradingview.com/meta-platforms--big.svg',
};
const METAL_CODES = [
  { code: 'XAU', id: 'XAUUSD', name: 'Gold' },
  { code: 'XAG', id: 'XAGUSD', name: 'Silver' },
  { code: 'XPT', id: 'XPTUSD', name: 'Platinum' },
  { code: 'XPD', id: 'XPDUSD', name: 'Palladium' },
];
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 'EUR', quote: 'USD' },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', base: 'GBP', quote: 'USD' },
  { symbol: 'USD/JPY', name: 'Dollar / Yen', base: 'USD', quote: 'JPY' },
  { symbol: 'USD/CHF', name: 'Dollar / Franc', base: 'USD', quote: 'CHF' },
  { symbol: 'AUD/USD', name: 'Aussie / US Dollar', base: 'AUD', quote: 'USD' },
  { symbol: 'USD/CAD', name: 'Dollar / Loonie', base: 'USD', quote: 'CAD' },
  { symbol: 'NZD/USD', name: 'Kiwi / US Dollar', base: 'NZD', quote: 'USD' },
  { symbol: 'EUR/GBP', name: 'Euro / Pound', base: 'EUR', quote: 'GBP' },
  { symbol: 'EUR/JPY', name: 'Euro / Yen', base: 'EUR', quote: 'JPY' },
  { symbol: 'GBP/JPY', name: 'Pound / Yen', base: 'GBP', quote: 'JPY' },
];

export interface NormalizedAsset {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  changePercent: number;
  priceChange24h?: number;
  marketCap?: number;
  volume?: number;
  high24h?: number;
  low24h?: number;
  sparkline?: number[];
  type: AssetType;
  raw: any;
}

export function normalizeAsset(raw: any, type?: AssetType): NormalizedAsset {
  if (!raw) return null as any;
  const resolvedType = type ?? inferType(raw);
  const symbol = String(raw.symbol ?? raw.id ?? '').toUpperCase();
  const price = safeNumber(raw.current_price ?? raw.price);
  const changePercent = safeNumber(
    raw.price_change_percentage_24h_in_currency ??
      raw.price_change_percentage_24h ??
      raw.changePercent ??
      raw.change
  );
  return {
    id: String(raw.id ?? symbol.toLowerCase()),
    symbol,
    name: getDisplayName(symbol, resolvedType, raw.name),
    image: raw.image,
    price,
    changePercent,
    priceChange24h: raw.price_change_24h != null ? safeNumber(raw.price_change_24h) : price * (changePercent / 100),
    marketCap: raw.market_cap != null ? safeNumber(raw.market_cap) : undefined,
    volume: raw.total_volume != null ? safeNumber(raw.total_volume) : undefined,
    high24h: raw.high_24h != null ? safeNumber(raw.high_24h) : undefined,
    low24h: raw.low_24h != null ? safeNumber(raw.low_24h) : undefined,
    sparkline: raw.sparkline_in_7d?.price ?? undefined,
    type: resolvedType,
    raw,
  };
}

// ── Direct-fetch fallbacks when the backend is unreachable ──────────────

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchCryptoFallback(): Promise<NormalizedAsset[]> {
  try {
    const res = await fetchWithTimeout(
      `${config.coingeckoUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true`,
      15000,
    );
    if (!res.ok) return getHardcodedCrypto();
    const data = await res.json();
    const list = (data || []).map((c: any) => normalizeAsset(c, 'crypto'));
    return list.length > 0 ? list : getHardcodedCrypto();
  } catch {
    return getHardcodedCrypto();
  }
}

async function fetchStocksFallback(): Promise<NormalizedAsset[]> {
  try {
    const res = await fetchWithTimeout(
      `https://api.marketdata.app/v1/stocks/quotes/${STOCK_SYMBOLS.join(',')}/`,
      15000,
    );
    if (!res.ok) return getHardcodedStocks();
    const data = await res.json();
    if (data.s !== 'ok' || !Array.isArray(data.symbol) || data.symbol.length === 0) return getHardcodedStocks();
    const lastArr = data.last || [];
    const cpArr = data.changepct || [];
    return data.symbol.map((sym: string, i: number) =>
      normalizeAsset(
        {
          id: sym,
          symbol: sym,
          name: sym,
          price: lastArr[i] || 0,
          changePercent: cpArr[i] !== undefined ? cpArr[i] : 0,
          image: STOCK_LOGOS[sym] || null,
        },
        'stock',
      ),
    );
  } catch {
    return getHardcodedStocks();
  }
}

function getHardcodedCrypto(): NormalizedAsset[] {
  const coins = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 118000 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3200 },
    { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 680 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 170 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 2.4 },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', price: 1 },
    { id: 'staked-ether', symbol: 'STETH', name: 'Lido Staked Ether', price: 3200 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.24 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.75 },
    { id: 'tron', symbol: 'TRX', name: 'TRON', price: 0.28 },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', price: 35 },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 15 },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7 },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', price: 0.55 },
  ];
  return coins.map((c) =>
    normalizeAsset({ id: c.id, symbol: c.symbol, name: c.name, price: c.price, changePercent: 0 }, 'crypto'),
  );
}

function getHardcodedStocks(): NormalizedAsset[] {
  const prices: Record<string, number> = {
    AAPL: 315, TSLA: 408, NVDA: 211, MSFT: 385, AMZN: 245, GOOGL: 357, META: 669,
  };
  return STOCK_SYMBOLS.map((sym) =>
    normalizeAsset(
      { id: sym, symbol: sym, name: sym, price: prices[sym] ?? 0, changePercent: 0, image: STOCK_LOGOS[sym] || null },
      'stock',
    ),
  );
}

async function fetchMetalsFallback(): Promise<NormalizedAsset[]> {
  try {
    const results = await Promise.allSettled(
      METAL_CODES.map((m) =>
        fetchWithTimeout(`https://api.gold-api.com/price/${m.code}`, 10000)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d) => ({ id: m.id, symbol: m.id, name: m.name, price: d.price, changePercent: 0 })),
      ),
    );
    const valid = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value?.price > 0)
      .map((r) => normalizeAsset(r.value, 'metal'));
    if (valid.length > 0) return valid;
    return getHardcodedMetals();
  } catch {
    return getHardcodedMetals();
  }
}

function getHardcodedMetals(): NormalizedAsset[] {
  return [
    { id: 'XAUUSD', symbol: 'XAUUSD', name: 'Gold', price: 4122.00, changePercent: 0, priceChange24h: 0, type: 'metal' as AssetType, raw: {} },
    { id: 'XAGUSD', symbol: 'XAGUSD', name: 'Silver', price: 60.00, changePercent: 0, priceChange24h: 0, type: 'metal' as AssetType, raw: {} },
    { id: 'XPTUSD', symbol: 'XPTUSD', name: 'Platinum', price: 1634.00, changePercent: 0, priceChange24h: 0, type: 'metal' as AssetType, raw: {} },
    { id: 'XPDUSD', symbol: 'XPDUSD', name: 'Palladium', price: 1282.00, changePercent: 0, priceChange24h: 0, type: 'metal' as AssetType, raw: {} },
  ];
}

const HARDCODED_FOREX_RATES: Record<string, number> = {
  'EUR/USD': 1.0856, 'GBP/USD': 1.2734, 'USD/JPY': 157.42, 'USD/CHF': 0.8641,
  'AUD/USD': 0.6489, 'USD/CAD': 1.3712, 'NZD/USD': 0.6012, 'EUR/GBP': 0.8525,
  'EUR/JPY': 170.83, 'GBP/JPY': 200.41,
};

function getHardcodedForex(): NormalizedAsset[] {
  return FOREX_PAIRS.map((p) =>
    normalizeAsset(
      { id: p.symbol, symbol: p.symbol, name: p.name, price: HARDCODED_FOREX_RATES[p.symbol] ?? 1, changePercent: 0 },
      'forex',
    ),
  );
}

let _lastForexFetch = 0;
let _forexCache: NormalizedAsset[] | null = null;

async function fetchForexFallback(): Promise<NormalizedAsset[]> {
  const now = Date.now();
  if (_forexCache && now - _lastForexFetch < 300_000) return _forexCache;
  try {
    const currencies = ['EUR','GBP','USD','JPY','CHF','AUD','CAD','NZD'];
    const res = await fetchWithTimeout(`https://open.er-api.com/v6/latest/USD`, 10000);
    if (!res.ok) return getHardcodedForex();
    const data = await res.json();
    if (!data || data.result !== 'success' || !data.rates) return getHardcodedForex();
    const rates = data.rates;
    const items = FOREX_PAIRS.map((p) => {
      let price: number;
      if (p.base === 'USD') price = rates[p.quote] ?? 1;
      else if (p.quote === 'USD') price = 1 / (rates[p.base] ?? 1);
      else price = (rates[p.quote] ?? 1) / (rates[p.base] ?? 1);
      return normalizeAsset(
        { id: p.symbol, symbol: p.symbol, name: p.name, price: Math.round(price * 10000) / 10000, changePercent: 0 },
        'forex',
      );
    });
    _forexCache = items;
    _lastForexFetch = now;
    return items;
  } catch {
    return getHardcodedForex();
  }
}

// ── Consumer helpers ──────────────────────────────────────────────────

const CACHE_PREFIX = 'paxora_market_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
    return data; // serve stale, refresh in background
  } catch { return null; }
}

function setCache(key: string, data: unknown) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

async function tryBackend<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

export const marketApi = {
  getUnifiedList: () =>
    tryBackend(
      () => http.get<any>('/market/list'),
      async () => {
        const [crypto, stocks, metals] = await Promise.all([
          fetchCryptoFallback(),
          fetchStocksFallback(),
          fetchMetalsFallback(),
        ]);
        return { crypto, stocks, metals };
      },
    ).catch(() => ({ crypto: [] as NormalizedAsset[], stocks: [] as NormalizedAsset[], metals: [] as NormalizedAsset[] })),

  getCrypto: () =>
    tryBackend(
      async () => {
        const res = await http.get<any>('/market/list');
        const list = (res.crypto || []).map((c: any) => normalizeAsset(c, 'crypto'));
        if (list.length > 0) setCache('crypto', list);
        return list.length > 0 ? list : (getCached<NormalizedAsset[]>('crypto') ?? await fetchCryptoFallback());
      },
      async () => {
        const list = await fetchCryptoFallback();
        if (list.length > 0) setCache('crypto', list);
        return list;
      },
    ).catch(() => getCached<NormalizedAsset[]>('crypto') ?? getHardcodedCrypto()),

  getStocks: () =>
    tryBackend(
      async () => {
        const res = await http.get<any>('/market/list');
        const list = (res.stocks || []).map((s: any) => normalizeAsset(s, 'stock'));
        if (list.length > 0) setCache('stocks', list);
        return list.length > 0 ? list : (getCached<NormalizedAsset[]>('stocks') ?? await fetchStocksFallback());
      },
      async () => {
        const list = await fetchStocksFallback();
        if (list.length > 0) setCache('stocks', list);
        return list;
      },
    ).catch(() => getCached<NormalizedAsset[]>('stocks') ?? getHardcodedStocks()),

  getMetals: () =>
    tryBackend(
      async () => {
        const res = await http.get<any>('/market/list');
        const list = (res.metals || []).map((m: any) => normalizeAsset(m, 'metal'));
        if (list.length > 0) setCache('metals', list);
        return list.length > 0 ? list : (getCached<NormalizedAsset[]>('metals') ?? await fetchMetalsFallback());
      },
      async () => {
        const list = await fetchMetalsFallback();
        if (list.length > 0) setCache('metals', list);
        return list;
      },
    ).catch(() => getCached<NormalizedAsset[]>('metals') ?? getHardcodedMetals()),

  getForex: () =>
    fetchForexFallback().catch(() => getHardcodedForex()),

  getCryptoDetail: (id: string) =>
    tryBackend(
      () =>
        http
          .get<any>('/market/list')
          .then((res) => {
            const found = (res.crypto || []).find(
              (c: any) => c.id === id || String(c.symbol).toLowerCase() === id.toLowerCase(),
            );
            return found ? normalizeAsset(found, 'crypto') : null;
          }),
      async () => {
        const all = await fetchCryptoFallback();
        return all.find((c) => c.id === id || c.symbol.toLowerCase() === id.toLowerCase()) || null;
      },
    ).catch(() => null),

  getStockDetail: (symbol: string) =>
    tryBackend(
      () =>
        http
          .get<any>('/market/list')
          .then((res) => {
            const pool = [...(res.stocks || []), ...(res.metals || [])];
            const found = pool.find(
              (s: any) =>
                String(s.symbol).toUpperCase() === symbol.toUpperCase() ||
                String(s.id).toUpperCase() === symbol.toUpperCase(),
            );
            return found ? normalizeAsset(found) : null;
          }),
      async () => {
        const [stocks, metals] = await Promise.all([fetchStocksFallback(), fetchMetalsFallback()]);
        const pool = [...stocks, ...metals];
        return pool.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase()) || null;
      },
    ).catch(() => null),

  getAssetDetail: (idOrSymbol: string) =>
    tryBackend(
      () =>
        http
          .get<any>('/market/list')
          .then((res) => {
            const pool = [...(res.crypto || []), ...(res.stocks || []), ...(res.metals || [])];
            const key = idOrSymbol.toLowerCase();
            const found = pool.find(
              (a: any) => String(a.id).toLowerCase() === key || String(a.symbol).toLowerCase() === key,
            );
            return found ? normalizeAsset(found) : null;
          }),
      async () => {
        const [crypto, stocks, metals] = await Promise.all([
          fetchCryptoFallback(),
          fetchStocksFallback(),
          fetchMetalsFallback(),
        ]);
        const pool = [...crypto, ...stocks, ...metals];
        const key = idOrSymbol.toLowerCase();
        return pool.find((a) => a.id.toLowerCase() === key || a.symbol.toLowerCase() === key) || null;
      },
    ).catch(() => null),

  getCryptoHistory: (id: string, interval = '1h', limit = 100) =>
    http
      .get<any>('/market/historical', { query: { symbol: id, market: 'crypto', interval, limit } })
      .then((data) => data || [])
      .catch(() => []),

  getStockHistory: (symbol: string, interval = '15m', market: 'stocks' | 'metals' = 'stocks', limit = 100) =>
    http
      .get<any>('/market/historical', { query: { symbol, market, interval, limit } })
      .then((data) => data || [])
      .catch(() => []),
};

export type { MarketCoin, Stock };
