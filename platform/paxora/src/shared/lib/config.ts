const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.paxorapremiumlab.com/api';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
const HUBSPOT_API_KEY = process.env.NEXT_PUBLIC_HUBSPOT_API_KEY || '';

export type SiteId = 'premium' | 'lab';

/** Both customer apps share this codebase; the hostname decides which brand emails use. */
export function getSiteId(): SiteId {
  if (typeof window !== 'undefined' && window.location.hostname.includes('paxoralab')) return 'lab';
  return process.env.NEXT_PUBLIC_SITE_ID === 'lab' ? 'lab' : 'premium';
}

export function getSiteName(): string {
  return getSiteId() === 'lab' ? 'PAXORA' : 'Paxora Premium';
}

export const config = {
  apiUrl: API_URL,
  coingeckoUrl: COINGECKO_API_URL,
  turnstileSiteKey: TURNSTILE_SITE_KEY,
  hubspotApiKey: HUBSPOT_API_KEY,
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchInterval: 30_000,
  chartTickMs: 100,
  chartMaxPoints: 1800,
  balances: { crypto: 50, stock: 50 },
};

export type MarketType = 'crypto' | 'stock';
