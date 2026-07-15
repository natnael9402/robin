'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

interface AuthGateContextValue {
  requireAuth: (action?: () => void) => void;
  promptAuth: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | undefined>(undefined);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const promptAuth = useCallback(() => setOpen(true), []);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isAuthenticated) {
        action?.();
        return;
      }
      setOpen(true);
    },
    [isAuthenticated]
  );

  const value = useMemo<AuthGateContextValue>(() => ({ requireAuth, promptAuth }), [requireAuth, promptAuth]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} size="sm">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary primary-glow">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">Create an account to continue</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign up or log in to trade, deposit and manage your portfolio.</p>
          </div>
          <div className="w-full space-y-3 mt-2">
            <Button variant="primary" size="lg" fullWidth onClick={() => go('/signup')}>
              Sign up
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => go('/login')}>
              Log in
            </Button>
          </div>
        </div>
      </Modal>
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used within AuthGateProvider');
  return ctx;
}
