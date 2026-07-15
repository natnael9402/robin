'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Zap, Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/api';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      router.push('/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card padding="lg" elevated className="animate-rise w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_30px_var(--primary-muted)]">
            <Zap size={26} className="fill-current" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to the Zent Admin Control Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive-muted rounded-lg text-center" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="Email address"
              required
              leftAdornment={<Mail className="h-5 w-5" />}
              autoComplete="email"
              disabled={loading}
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Password"
              required
              leftAdornment={<Lock className="h-5 w-5" />}
              rightAdornment={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="flex items-center text-zinc-400 transition-colors hover:text-foreground" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}