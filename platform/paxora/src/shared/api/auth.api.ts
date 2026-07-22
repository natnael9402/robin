import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { User } from '../types';

const http = createHttpClient(config.apiUrl);

export interface ProfileData {
  balance: number;
  assetsValue: number;
  totalAssetsValue: number;
  level: number;
  user: User;
}

export const authApi = {
  signup: (data: { email: string; password: string; name?: string; phone?: string; captchaToken?: string; invite_code?: string }) =>
    http.post<{ access_token: string; user: User }>('/register', data, { skipAuth: true }),
  login: (data: { email?: string; phone?: string; password: string; captchaToken?: string }) =>
    http.post<{ access_token: string; user: User }>('/login', data, { skipAuth: true }),
  logout: () => Promise.resolve(),
  // The endpoint responds with { profile, balance, assets, user, ... } where the
  // identity fields (name, email, id, role) live under `user`. Flatten those onto
  // the top level so `user.name` survives a page refresh, while keeping the
  // top-level balance/assets that other callers rely on.
  getProfile: async (): Promise<User> => {
    const res = await http.get<Record<string, unknown>>('/profile/with-user-data');
    const u = (res.user ?? {}) as Record<string, unknown>;
    const p = (res.profile ?? {}) as Record<string, unknown>;
    return {
      ...u,
      ...res,
      name: (u.name ?? res.name) as string | undefined,
      email: (u.email ?? res.email) as string | undefined,
      balance: Number(res.balance ?? u.balance ?? 0),
      kycStatus: (p.kyc_status ?? u.kyc_status ?? 'unverified') as User['kycStatus'],
    } as User;
  },
  getProfileData: async (): Promise<ProfileData> => {
    const res = await http.get<Record<string, unknown>>('/profile/with-user-data');
    const u = (res.user ?? {}) as Record<string, unknown>;
    const p = (res.profile ?? {}) as Record<string, unknown>;
    return {
      balance: Number(res.balance ?? 0),
      assetsValue: Number(res.assets_value ?? 0),
      totalAssetsValue: Number(res.total_assets_value ?? 0),
      level: Number(p.level ?? 1),
      user: {
        ...u,
        ...res,
        name: (u.name ?? res.name) as string | undefined,
        email: (u.email ?? res.email) as string | undefined,
        balance: Number(res.balance ?? u.balance ?? 0),
        level: Number(p.level ?? 1),
      } as User,
    };
  },
  getWithdrawalPinStatus: () =>
    http.get<{ hasPin: boolean }>('/withdrawal-password/status'),
  changePassword: (oldPassword: string, newPassword: string) =>
    http.post<void>('/change-password', { current_password: oldPassword, password: newPassword, password_confirmation: newPassword }),
  forgotPassword: (email: string) =>
    http.post<void>('/forgot-password', { email }, { skipAuth: true }),
  resetPassword: (email: string, token: string, password: string) =>
    http.post<void>('/reset-password', { email, token, password, password_confirmation: password }, { skipAuth: true }),
  setWithdrawalPassword: (password: string, currentPassword?: string) =>
    http.post<void>('/withdrawal-password/set', {
      password,
      password_confirmation: password,
      ...(currentPassword ? { current_password: currentPassword } : {}),
    }),
  resetWithdrawalPassword: (accountPassword: string, newPassword: string) =>
    http.post<void>('/withdrawal-password/reset', {
      password: accountPassword,
      new_password: newPassword,
      password_confirmation: newPassword,
    }),
   enableGoogleAuth: () =>
    http.post<{ google_auth_enabled: boolean; google_auth_secret: string }>('/profile/google-auth'),
  deleteAccount: (password: string, reason?: string) =>
    http.post<void>('/profile/delete-account', { password, reason }),
};