'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { authApi } from '../../shared/api';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password · Paxora Premium');
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Check your email for the reset link');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-primary tracking-widest drop-shadow-[0_0_20px_rgba(180,134,8,0.3)] mb-4">
            PAXORA
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Reset your password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? 'If that email is registered, you will receive a password reset link shortly.'
              : 'Enter your email address and we will send you a reset link.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handle} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              leftAdornment={<Mail className="w-5 h-5" />}
              placeholder="Email address"
              required
            />

            <Button type="submit" variant="lime" size="lg" fullWidth loading={loading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              Did not receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => { setSent(false); setLoading(false); }}
                className="text-primary font-bold hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
