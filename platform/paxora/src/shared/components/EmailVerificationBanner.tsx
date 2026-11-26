'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Mail, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HIDDEN_PATHS = [
  '/login',
  '/signup',
  '/onboard',
  '/onboarding',
  '/kyc-pending',
  '/kyc-verification',
  '/verify-email',
  '/profile',
  '/forgot-password',
  '/reset-password',
];

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [user?.email]);

  if (!isAuthenticated || !user?.email || user.emailVerifiedAt || dismissed) return null;
  if (HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[90] border-b border-primary/20 bg-black/95 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 text-xs sm:text-sm">
        <Mail className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-white/70">
          Confirm your email to secure your account.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/verify-email?email=${encodeURIComponent(user.email!)}`)}
          className="font-bold text-primary underline underline-offset-2 hover:text-primary-hover"
        >
          Verify now
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss email verification reminder"
          className="ml-1 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
