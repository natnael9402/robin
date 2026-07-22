'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from './ui/PageLoader';

const KYC_EXEMPT_PATHS = ['/kyc-verification', '/onboard', '/onboarding', '/login', '/signup', '/forgot-password', '/reset-password'];

export function KycGate({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const kycStatus = user?.kycStatus;

  // Exempt paths — always render children
  if (KYC_EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return <>{children}</>;
  }

  // Still loading auth
  if (isLoading || !user) {
    return <PageLoader />;
  }

  // Unverified or rejected — redirect to KYC page
  if (kycStatus === 'unverified' || kycStatus === 'rejected') {
    return <Redirector to="/kyc-verification" />;
  }

  // Pending — redirect to pending page
  if (kycStatus === 'pending') {
    return <Redirector to="/kyc-pending" />;
  }

  // Approved/Verified — render children (full access)
  if (kycStatus === 'approved' || kycStatus === 'verified') {
    return <>{children}</>;
  }

// Fallback — render children
  return <>{children}</>;
}

function Redirector({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => { router.push(to); }, [router, to]);
  return <PageLoader />;
}
