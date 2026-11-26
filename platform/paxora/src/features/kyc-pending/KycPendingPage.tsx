'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { KycMotionGraphic } from '../kyc-verification/components/KycMotionGraphic';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { authApi, ApiError } from '../../shared/api';
import { Button } from '../../shared/components/ui/Button';
import { getSiteId } from '../../shared/lib/config';
import { CheckCircle2, Clock, HeadphonesIcon, LogOut, Mail, MailCheck, RefreshCw } from 'lucide-react';

export function KycPendingPage() {
  useDocumentTitle('Verification Pending · Paxora');
  const router = useRouter();
  const toast = useToast();
  const { user, logout, refresh } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const refreshStatus = useCallback(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    refreshStatus();
    const interval = window.setInterval(refreshStatus, 10_000);
    window.addEventListener('focus', refreshStatus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshStatus);
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (user?.kycStatus === 'approved' || user?.kycStatus === 'verified') {
      router.push('/home');
    }
  }, [user, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const email = user?.email?.trim();
  const emailVerified = Boolean(user?.emailVerifiedAt);

  const resend = useCallback(async () => {
    if (!email) {
      toast.error('Add your email in your profile first');
      return;
    }
    setResending(true);
    try {
      const result = await authApi.resendVerification({ email, site: getSiteId() });
      toast.success(result.sent ? 'Verification email sent' : 'If that account exists, a link is on its way');
      setCooldown(60);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error('Could not send the email. Please try again.');
    } finally {
      setResending(false);
    }
  }, [email, toast]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-primary/20 bg-black/95 p-8 shadow-[0_15px_40px_-15px_var(--primary-glow)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-[40px]" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/10 blur-[40px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <KycMotionGraphic />

          <h1 className="mt-4 text-xl font-black text-white tracking-tight">You&apos;re almost set</h1>
          <p className="mt-2 text-xs font-medium text-white/60 leading-relaxed max-w-[280px]">
            Your account is created. Complete the quick email step below while we review your identity documents.
          </p>

          <div className="mt-6 w-full space-y-2 text-left">
            <div className="flex items-center gap-2 rounded-2xl border border-success/15 bg-success/5 px-4 py-3 text-xs text-white/70">
              <CheckCircle2 size={15} className="shrink-0 text-success" />
              <span className="font-semibold text-success">Account created</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-white/60">
              <Clock size={15} className="shrink-0 text-primary/70" />
              <span>
                <strong className="font-semibold text-white/80">Identity review in progress</strong>
                <br />
                Usually 5 to 24 hours.
              </span>
            </div>
          </div>

          <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
            {email ? (
              emailVerified ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <MailCheck size={16} className="text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-success">Email verified</p>
                    <p className="mt-0.5 break-all text-[11px] leading-relaxed text-white/50">{email}</p>
                    <p className="mt-1 text-[11px] text-white/40">Your account is ready when approval finishes.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Mail size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">Confirm your email</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">
                        We sent a link to <span className="font-semibold text-white/70 break-all">{email}</span>.
                        Open it while your ID is reviewed.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={resending}
                      disabled={cooldown > 0}
                      leftIcon={<RefreshCw size={13} />}
                      className="flex-1"
                      onClick={resend}
                    >
                      {cooldown > 0 ? `${cooldown}s` : 'Resend'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
                    >
                      Open verification page
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Mail size={16} className="text-white/60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Add an email address</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">
                    Add an email in your profile to receive account updates.
                  </p>
                  <button
                    onClick={() => router.push('/profile')}
                    className="mt-2 text-[11px] font-bold text-primary hover:underline"
                  >
                    Go to profile
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex w-full flex-col gap-2">
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
