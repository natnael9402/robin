import { createHttpClient } from './httpClient';
import { config } from '../lib/config';

const http = createHttpClient(config.apiUrl);

export interface ReferralCommission {
  id: number;
  depositAmount: number;
  commissionAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ReferralInfo {
  inviteCode: string | null;
  referralCount: number;
  totalCommissionsEarned: number;
  referredBy: { name: string; email: string } | null;
  commissions: ReferralCommission[];
}

export const referralApi = {
  getMyInfo: () =>
    http.get<ReferralInfo>('/referral/my-info'),
  generateCode: () =>
    http.post<{ inviteCode: string }>('/referral/generate-code'),
};
