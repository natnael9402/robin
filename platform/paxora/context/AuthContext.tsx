'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, User } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

const TOKEN_KEY = 'token';
const COOKIE_MAX_AGE = 2592000; // 30 days

function setTokenCookie(token: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearTokenCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const userData = await authApi.getProfile();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: any) => {
        const data = await authApi.login(credentials);
        if (typeof window !== 'undefined' && (data as any)?.access_token) {
            try {
                localStorage.setItem('token', (data as any).access_token);
                setTokenCookie((data as any).access_token);
            } catch { }
        }
        if ((data as any)?.user) {
            setUser((data as any).user);
        } else {
            try {
                await checkUser();
            } catch { }
        }
    };

    const signup = async (data: any) => {
        await authApi.signup(data);
        await login({ email: data.email, password: data.password });
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            clearTokenCookie();
        }
        try {
            await authApi.logout();
        } catch { }
        setUser(null);
        router.push('/login');
    };

    const refreshProfile = async () => {
        try {
            const profile = await authApi.getProfile();
            setUser(profile);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
