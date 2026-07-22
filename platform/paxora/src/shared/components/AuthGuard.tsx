'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import { useMounted } from '../hooks/useMounted';
import { PageLoader } from './ui/PageLoader';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useAuth();
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!storage.getToken()) router.push('/login');
  }, [mounted, isLoading, router]);

  if (!mounted || isLoading) {
    return <PageLoader />;
  }

  if (!storage.getToken()) return null;
  return <>{children}</>;
}
