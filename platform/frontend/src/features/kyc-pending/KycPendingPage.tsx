'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { KycMotionGraphic } from '../kyc-verification/components/KycMotionGraphic';
import { useAuth } from '../../shared/contexts/AuthContext';
import { Clock, LogOut, HeadphonesIcon } from 'lucide-react';

export function KycPendingPage() {
  useDocumentTitle('Verification Pending · Paxora');
  const router = useRouter();
  const { user, logout, refresh } = useAuth();

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (user?.kycStatus === 'approved' || user?.kycStatus === 'verified') {
      router.push('/home');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-primary/20 bg-black/95 p-8 shadow-[0_15px_40px_-15px_var(--primary-glow)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-[40px]" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-[40px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <KycMotionGraphic />

          <h1 className="mt-4 text-xl font-black text-white tracking-tight">Verification Submitted</h1>
          <p className="mt-2 text-xs font-medium text-white/60 leading-relaxed max-w-[260px]">
            Your documents are being reviewed. This usually takes <strong className="text-primary">5 to 24 hours</strong>.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-white/50">
            <Clock size={14} className="shrink-0 text-primary/60" />
            <span>You will be able to access your account after verification is complete.</span>
          </div>

          <div className="mt-8 flex w-full flex-col gap-2">
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white/30 opacity-60 cursor-not-allowed"
            >
              <Clock size={15} />
              Come Back Later
            </button>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 py-3.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-[0.98]"
            >
              <LogOut size={15} />
              Logout & Wait
            </button>
          </div>

          <button
            onClick={() => window.HubSpotConversations?.widget?.open()}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 transition-colors hover:text-primary"
          >
            <HeadphonesIcon size={13} />
            Need help? Contact support
          </button>
        </div>
      </div>
    </div>
  );
}
