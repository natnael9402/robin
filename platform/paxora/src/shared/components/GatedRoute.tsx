'use client';

import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMounted } from '../hooks/useMounted';
import { Button } from './ui/Button';
import { useAuthGate } from '../contexts/AuthGateContext';
import { PageLoader } from './ui/PageLoader';

export function GatedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { promptAuth } = useAuthGate();
  const mounted = useMounted();

  if (!mounted || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-8 gap-5">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary primary-glow">
          <Lock className="w-9 h-9" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Members only</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">Log in or create an account to access this page.</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <Button variant="primary" size="lg" fullWidth onClick={promptAuth}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
