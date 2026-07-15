'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { authApi } from '../../shared/api';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';

export function ResetPasswordPage() {
  useDocumentTitle('Reset Password · Paxora Premium');
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const getPasswordErrors = (pw: string): string[] => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pw)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(pw)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(pw)) errors.push('one number');
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push('one special character');
    return errors;
  };

  const passwordErrors = getPasswordErrors(password);
  const passwordStrength = 5 - passwordErrors.length;

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Invalid reset link</h2>
          <p className="text-sm text-muted-foreground">This link is missing required information. Please request a new password reset.</p>
          <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error('Fill all fields');
    if (passwordErrors.length) return toast.error('Password must have ' + passwordErrors.join(', '));
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authApi.resetPassword(email, token, password);
      toast.success('Password reset successfully');
      router.push('/login');
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Set new password</h2>
          <p className="mt-2 text-sm text-muted-foreground">Choose a strong password for your account</p>
        </div>

        <form onSubmit={handle} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                leftAdornment={<Lock className="w-5 h-5" />}
                rightAdornment={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                placeholder="New password"
                required
              />
              {passwordFocused && (
                <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-destructive'
                              : passwordStrength <= 3
                                ? 'bg-warning'
                                : 'bg-success'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {[
                      { check: password.length >= 8, label: 'At least 8 characters' },
                      { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                      { check: /[a-z]/.test(password), label: 'One lowercase letter' },
                      { check: /[0-9]/.test(password), label: 'One number' },
                      { check: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
                    ].map(({ check, label }) => (
                      <li key={label} className={`text-xs flex items-center gap-1.5 ${check ? 'text-success' : 'text-muted-foreground'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${check ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              leftAdornment={<Lock className="w-5 h-5" />}
              placeholder="Confirm new password"
              required
            />
          </div>

          <Button type="submit" variant="lime" size="lg" fullWidth loading={loading}>
            Reset Password
          </Button>
        </form>

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
