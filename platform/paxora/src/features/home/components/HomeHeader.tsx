'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { formatCurrency, displayName } from '../../../shared/lib/utils';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { Button } from '../../../shared/components/ui/Button';
import { walletApi } from '../../../shared/api';

function GuestHeader() {
  const router = useRouter();
  return (
    <header className="mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-widest text-primary text-primary-glow">PAXORA</span>
          <span className="mt-0.5 text-[6px] font-bold text-primary opacity-80">TM</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Log in</Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/signup')}>Sign up</Button>
        </div>
      </div>
      <div className="glass relative overflow-hidden rounded-3xl p-7">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <h1 className="relative text-4xl font-black leading-[1.05] tracking-tight">
          Trade crypto,
          <br />
          <span className="text-primary text-primary-glow">securely.</span>
        </h1>
        <p className="relative mt-3 max-w-xs text-sm text-muted-foreground">
          Buy, sell, and store hundreds of cryptocurrencies.
        </p>
        <div className="relative mt-5 flex gap-3">
          <Button variant="primary" size="md" onClick={() => router.push('/signup')}>Get started</Button>
          <Button variant="secondary" size="md" onClick={() => router.push('/login')}>I have an account</Button>
        </div>
      </div>
    </header>
  );
}

function HomeHeaderBase() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: balances } = useQuery({
    queryKey: ['trades', 'balances'],
    queryFn: () => walletApi.getBalances(),
    staleTime: 30_000,
  });
  const [hidden, setHidden] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toggleHidden = () => setHidden((h) => !h);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['trades', 'balances'] }),
        qc.invalidateQueries({ queryKey: ['profile'] }),
      ]);
    } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  if (!isAuthenticated) return <GuestHeader />;

  const name = displayName(user);
  const balance = balances?.total ?? 0;

  return (
    <header className="mb-8 mt-4 md:mt-0">
      {/* Top row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/pp.png" alt="Avatar" className="h-14 w-14 shrink-0 object-cover" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Welcome back</p>
            <h2 className="text-lg font-bold leading-tight text-foreground">{name} 👋</h2>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-all hover:bg-surface/80 hover:text-foreground disabled:pointer-events-none"
        >
          <style>{`@keyframes spin-refresh{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.spin-refresh{animation:spin-refresh .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
          <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 'spin-refresh' : ''}`} />
        </button>
      </div>

      {/* Balance */}
      <div className="mb-8 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Total Balance</span>
          <button
            onClick={toggleHidden}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            className="text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={toggleHidden}
          aria-label={hidden ? 'Show balance' : 'Hide balance'}
          className="transition-opacity active:opacity-70"
        >
          {hidden ? (
            <span className="flex items-center justify-center gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="h-3 w-3 rounded-full bg-foreground/30" />
              ))}
            </span>
          ) : (
            <span className="font-mono text-[2.8rem] font-black leading-none tracking-tight tabular-nums">
              ${formatCurrency(balance)}
            </span>
          )}
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/wallet')}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground"
        >
          <ArrowDownLeft className="h-5 w-5" />
          Deposit
        </button>
        <button
          onClick={() => router.push('/wallet')}
          className="flex items-center justify-center gap-2 rounded-xl border border-border py-4 text-sm font-bold text-foreground"
        >
          <ArrowUpRight className="h-5 w-5" />
          Withdraw
        </button>
      </div>
    </header>
  );
}

export const HomeHeader = memo(HomeHeaderBase);
