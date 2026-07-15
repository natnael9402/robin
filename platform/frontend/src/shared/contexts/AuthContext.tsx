'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setTokenProvider, ApiError } from '../api';
import { storage } from '../lib/storage';
import type { User } from '../types';
import { useMounted } from '../hooks/useMounted';
import { nukeHubspot } from '../components/HubSpotIdentify';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewSignup: boolean;
  login: (identifier: string, password: string, captchaToken?: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, captchaToken?: string, phone?: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearNewSignup: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const router = useRouter();
  const lastRefreshRef = useRef<number>(0);

  useEffect(() => {
    setTokenProvider(() => storage.getToken());
    // Re-sync cookies from localStorage on mount (cookies can disappear independently)
    const existingToken = storage.getToken();
    if (existingToken) {
      storage.setToken(existingToken);
    }
    const existingKyc = storage.getKycStatus();
    if (existingKyc) {
      storage.setKycStatus(existingKyc);
    }
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!storage.getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    if (!force && Date.now() - lastRefreshRef.current < 30_000) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      lastRefreshRef.current = Date.now();
      if (profile.name) storage.setUserName(profile.name);
      if (profile.kycStatus) storage.setKycStatus(profile.kycStatus);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        storage.clearToken();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) refresh();
  }, [mounted, refresh]);

  const login = useCallback(async (identifier: string, password: string, captchaToken?: string) => {
    const isEmail = identifier.includes('@');
    const res = await authApi.login({ [isEmail ? 'email' : 'phone']: identifier, password, captchaToken });
    storage.setToken(res.access_token);
    // Let refresh() fetch the profile (which includes kycStatus) and set the user state & cookie
    await refresh();
  }, [refresh]);

  const clearNewSignup = useCallback(() => setIsNewSignup(false), []);

  const signup = useCallback(async (email: string, password: string, name?: string, captchaToken?: string, phone?: string, referralCode?: string) => {
    const payload = {
      email,
      password,
      name,
      ...(phone ? { phone } : {}),
      ...(referralCode ? { invite_code: referralCode } : {}),
    };
    console.log('SIGNUP PAYLOAD:', JSON.stringify(payload));
    const newUser = await authApi.signup(payload);
    if (newUser) {
      await login(email || phone || '', password);
      setIsNewSignup(true);
    }
  }, [login]);

  const logout = useCallback(async () => {
    nukeHubspot();
    try { await authApi.logout(); } catch { /* noop */ }
    storage.clearToken();
    storage.clearKycStatus();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user && !!storage.getToken(),
    isNewSignup,
    login,
    signup,
    logout,
    refresh,
    clearNewSignup,
  }), [user, isLoading, isNewSignup, login, signup, logout, refresh, clearNewSignup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
