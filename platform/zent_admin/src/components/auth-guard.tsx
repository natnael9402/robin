'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_URL } from '../lib/api';

interface User {
  id: number;
  email: string;
  role: string;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const isLoginPage = pathname === '/login';
      const token = localStorage.getItem('token');

      if (!token) {
        if (!isLoginPage) {
          router.push('/login');
        }
        setIsLoading(false);
        setIsValidated(isLoginPage);
        return;
      }

      if (isLoginPage) {
        router.push('/users');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Invalid token');
        }

        const envelope = await res.json();
        const user: User = envelope.data ?? envelope;

        if (user.role !== 'admin') {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        setIsValidated(true);
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  if (!isValidated) return null;

  return <>{children}</>;
}
