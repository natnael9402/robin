// Shared display metadata for non-crypto assets (stocks/metals), which the /ol
// backend returns without friendly names or images.

export type AssetType = 'crypto' | 'stock' | 'metal' | 'forex';

export const STOCK_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla Inc.',
  NVDA: 'NVIDIA Corp.',
  MSFT: 'Microsoft Corp.',
  AMZN: 'Amazon.com Inc.',
  GOOGL: 'Alphabet Inc.',
  META: 'Meta Platforms',
};

export const METAL_DISPLAY: Record<string, { name: string; icon: string; accent: string }> = {
  XAUUSD: { name: 'Gold', icon: '🟡', accent: '#fbbf24' },
  XAGUSD: { name: 'Silver', icon: '⚪', accent: '#cbd5e1' },
  XPTUSD: { name: 'Platinum', icon: '⚪', accent: '#e5e7eb' },
  XPDUSD: { name: 'Palladium', icon: '🔘', accent: '#a3a3a3' },
};

export const CURRENCY_FLAGS: Record<string, string> = {
  EUR: 'eu', GBP: 'gb', USD: 'us', JPY: 'jp', CHF: 'ch', AUD: 'au', CAD: 'ca', NZD: 'nz',
};

export const FOREX_DISPLAY: Record<string, { name: string; base: string; quote: string; baseFlag: string; quoteFlag: string }> = {
  'EUR/USD': { name: 'Euro / US Dollar', base: 'EUR', quote: 'USD', baseFlag: 'eu', quoteFlag: 'us' },
  'GBP/USD': { name: 'Pound / US Dollar', base: 'GBP', quote: 'USD', baseFlag: 'gb', quoteFlag: 'us' },
  'USD/JPY': { name: 'Dollar / Yen', base: 'USD', quote: 'JPY', baseFlag: 'us', quoteFlag: 'jp' },
  'USD/CHF': { name: 'Dollar / Franc', base: 'USD', quote: 'CHF', baseFlag: 'us', quoteFlag: 'ch' },
  'AUD/USD': { name: 'Aussie / US Dollar', base: 'AUD', quote: 'USD', baseFlag: 'au', quoteFlag: 'us' },
  'USD/CAD': { name: 'Dollar / Loonie', base: 'USD', quote: 'CAD', baseFlag: 'us', quoteFlag: 'ca' },
  'NZD/USD': { name: 'Kiwi / US Dollar', base: 'NZD', quote: 'USD', baseFlag: 'nz', quoteFlag: 'us' },
  'EUR/GBP': { name: 'Euro / Pound', base: 'EUR', quote: 'GBP', baseFlag: 'eu', quoteFlag: 'gb' },
  'EUR/JPY': { name: 'Euro / Yen', base: 'EUR', quote: 'JPY', baseFlag: 'eu', quoteFlag: 'jp' },
  'GBP/JPY': { name: 'Pound / Yen', base: 'GBP', quote: 'JPY', baseFlag: 'gb', quoteFlag: 'jp' },
};

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/w80/${code}.png`;
}

export function getDisplayName(symbol: string, type: AssetType, fallback?: string): string {
  const s = (symbol || '').toUpperCase();
  if (type === 'metal') return METAL_DISPLAY[s]?.name ?? fallback ?? s;
  if (type === 'stock') return STOCK_NAMES[s] ?? fallback ?? s;
  if (type === 'forex') return FOREX_DISPLAY[s]?.name ?? fallback ?? s;
  return fallback ?? s;
}

export function getMetalMeta(symbol: string) {
  return METAL_DISPLAY[(symbol || '').toUpperCase()];
}

export function getForexMeta(symbol: string) {
  return FOREX_DISPLAY[(symbol || '').toUpperCase()];
}

/** Classify a raw asset by the fields present in the /ol response. */
export function inferType(raw: any): AssetType {
  const sym = String(raw?.symbol ?? raw?.id ?? '').toUpperCase();
  if (raw?.market === 'metals' || METAL_DISPLAY[sym]) return 'metal';
  if (raw?.market === 'stocks' || STOCK_NAMES[sym]) return 'stock';
  return 'crypto';
}
