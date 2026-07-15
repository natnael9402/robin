import { createHttpClient } from './httpClient';
import { config } from '../lib/config';

const http = createHttpClient(config.apiUrl);

export interface DepositAddress {
  currency: string;
  network: string;
  address: string;
  qrCode?: string | null;
  notes?: string | null;
}

// The backend groups addresses as { CURRENCY: { NETWORK: { address, network, qrCode, currency, notes } } }.
type GroupedAddresses = Record<string, Record<string, DepositAddress>>;

export const depositApi = {
  /**
   * Fetches the active deposit addresses configured by admins.
   * Returns a flat list. Throws ApiError (status 403) if the user's KYC isn't approved.
   */
  getAddresses: async (): Promise<DepositAddress[]> => {
    const res = await http.get<{ addresses: GroupedAddresses }>('/deposit/addresses');
    const grouped = res?.addresses ?? {};
    const list: DepositAddress[] = [];
    for (const currency of Object.keys(grouped)) {
      for (const network of Object.keys(grouped[currency])) {
        const entry = grouped[currency][network];
        list.push({
          currency: entry.currency ?? currency,
          network: entry.network ?? network,
          address: entry.address,
          qrCode: entry.qrCode ?? null,
          notes: entry.notes ?? null,
        });
      }
    }
    return list;
  },
};
