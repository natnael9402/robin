'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail, MailCheck, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { authApi, ApiError } from '../../shared/api';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { getSiteId, getSiteName } from '../../shared/lib/config';

type VerifyStatus = 'loading' | 'success' | 'already' | 'invalid' | 'expired' | 'sent' | 'idle';

export function VerifyEmailPage() {
  const siteId = getSiteId();
  const siteName = getSiteName();
  useDocumentTitle(`Verify Email · ${siteName}`);

  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { user, refresh } = useAuth();
  const token = params.get('token');
  const queryEmail = params.get('email') || '';
  const queryStatus = params.get('status');

  const [status, setStatus] = useState<VerifyStatus>(() => {
    if (token) return 'loading';
    if (queryStatus === 'success') return 'success';
    if (queryStatus === 'already') return 'already';
    if (queryStatus === 'invalid') return 'invalid';
    if (queryStatus === 'expired') return 'expired';
    return queryEmail ? 'sent' : 'idle';
  });
  const [email, setEmail] = useState(queryEmail);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setStatus('loading');
    authApi.verifyEmail(token)
      .then((result) => {
        if (cancelled) return;
        setStatus(result.alreadyVerified ? 'already' : 'success');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '';
        setStatus(message.toLowerCase().includes('expired') ? 'expired' : 'invalid');
      });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (status === 'success' || status === 'already') void refresh(true);
  }, [status, refresh]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (!email.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setSending(true);
    try {
      const result = await authApi.resendVerification({ email: email.trim(), site: siteId });
      toast.success(result.sent ? 'Verification email sent' : 'If that account exists, a link is on its way');
      setStatus('sent');
      setCooldown(60);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error('Could not send the email. Please try again.');
    } finally {
      setSending(false);
    }
  }, [email, siteId, toast]);

  const kycPending = user?.kycStatus === 'pending';
  const returnTarget = kycPending ? '/kyc-pending' : '/home';
  const returnLabel = kycPending ? 'Back to verification status' : 'Continue to dashboard';
  const needsResend = status === 'invalid' || status === 'expired' || status === 'idle';

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-500 sm:p-8">
        <div className="mb-7 text-center">
          <img src="/email-logo.png" alt={siteName} className="mx-auto w-40" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Account security</p>
        </div>

        {status === 'loading' && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-5 text-xl font-bold text-foreground">Verifying your email…</h1>
            <p className="mt-2 text-sm text-muted-foreground">This only takes a moment.</p>
          </div>
        )}

        {(status === 'success' || status === 'already') && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {status === 'already' ? 'Already verified' : 'Email verified!'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {status === 'already'
                ? 'This email address was verified already. You are all set.'
                : `Your ${siteName} account is confirmed. We will send important updates to your inbox.`}
            </p>
            <div className="mt-7 space-y-3">
              <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => router.push(returnTarget)}>
                {returnLabel}
              </Button>
              <Button fullWidth size="md" variant="ghost" onClick={() => router.push('/profile')}>View my profile</Button>
            </div>
          </div>
        )}

        {status === 'sent' && (
          <div className="py-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">Check your inbox</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We sent a verification link to <span className="font-semibold text-foreground">{email || 'your email address'}</span>.
              Confirm your email while your identity review is in progress — the link is valid for 24 hours.
            </p>
            <div className="mt-6 rounded-2xl border border-white/5 bg-background/60 p-4 text-left">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Did not get it? Check your spam folder, or send a fresh link below.
              </p>
              <div className="mt-3 flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button onClick={resend} loading={sending} disabled={cooldown > 0} variant="secondary" size="md">
                  {cooldown > 0 ? `${cooldown}s` : 'Resend'}
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <Button fullWidth variant="ghost" size="md" onClick={() => router.push(returnTarget)}>{returnLabel}</Button>
            </div>
          </div>
        )}

        {needsResend && (
          <div className="py-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
              {status === 'idle' ? <Mail className="h-8 w-8 text-primary" /> : <AlertCircle className="h-8 w-8 text-destructive" />}
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {status === 'expired' ? 'This link expired' : status === 'invalid' ? 'Link not valid' : 'Verify your email'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {status === 'expired'
                ? 'Verification links are valid for 24 hours. Request a fresh one and we will send it right away.'
                : status === 'invalid'
                  ? 'This link may have already been used. Request a fresh verification email below.'
                  : 'Enter the email address you used to sign up and we will send a verification link.'}
            </p>
            <form
              className="mt-6 space-y-3 text-left"
              onSubmit={(event) => { event.preventDefault(); void resend(); }}
            >
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" fullWidth size="lg" loading={sending} disabled={cooldown > 0} leftIcon={<RefreshCw className="h-4 w-4" />}>
                {cooldown > 0 ? `Try again in ${cooldown}s` : 'Send verification email'}
              </Button>
            </form>
            <div className="mt-6">
              <Button fullWidth variant="ghost" size="md" onClick={() => router.push('/login')}>Back to sign in</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
