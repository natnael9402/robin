const TOKEN_KEY = 'token';
const USER_NAME_KEY = 'userName';
const KYC_STATUS_KEY = 'kycStatus';

const COOKIE_MAX_AGE = 15552000; // 180 days

function setTokenCookie(token: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearTokenCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function setKycStatusCookie(status: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${KYC_STATUS_KEY}=${status}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearKycStatusCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${KYC_STATUS_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export const storage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, token);
    setTokenCookie(token);
  },
  clearToken(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    clearTokenCookie();
  },
  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(USER_NAME_KEY);
  },
  setUserName(name: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USER_NAME_KEY, name);
  },
  getKycStatus(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(KYC_STATUS_KEY);
  },
  setKycStatus(status: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KYC_STATUS_KEY, status);
    setKycStatusCookie(status);
  },
  clearKycStatus(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KYC_STATUS_KEY);
    clearKycStatusCookie();
  },
};
