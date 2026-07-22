'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, Zap, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { formatCurrency, initials, displayName } from '../../../shared/lib/utils';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useToast } from '../../../shared/contexts/ToastContext';
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

const QUICK = [
  { label: 'Deposit', icon: ArrowDownLeft, href: '/wallet' },
  { label: 'Withdraw', icon: ArrowUpRight, href: '/wallet' },
  { label: 'Trade', icon: Zap, href: '/trade' },
];

function HomeHeaderBase() {
  const { user, isAuthenticated, refresh } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: balances } = useQuery({
    queryKey: ['trades', 'balances'],
    queryFn: () => walletApi.getBalances(),
    staleTime: 30_000,
  });
  // Balance starts hidden on every visit for privacy; tap to reveal.
  const [hidden, setHidden] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toggleHidden = () => setHidden((h) => !h);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await refresh();
      await qc.invalidateQueries({ queryKey: ['trades', 'balances'] });
      toast.success('Everything up to date');
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
      </div>

      {/* Premium balance card */}
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-surface via-surface to-primary/[0.07] p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)] dark:ring-primary/20">
        {/* top sheen */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent dark:via-primary/20" />
        {/* ambient glow orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-primary/10 blur-[60px]" />

        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Total Balance</span>
            <button
              onClick={toggleHidden}
              aria-label={hidden ? 'Show balance' : 'Hide balance'}
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh balance"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-all hover:bg-primary/10 hover:text-primary disabled:pointer-events-none"
            >
              <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
              <RefreshCw className={`h-3.5 w-3.5 transition-transform ${refreshing ? 's' : ''}`} />
            </button>
          </div>

          {/* Balance — tap anywhere to reveal/hide */}
          <button
            onClick={toggleHidden}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            className="flex h-12 w-full items-center text-left transition-opacity active:opacity-70"
          >
            {hidden ? (
              <span className="flex items-center gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 rounded-full bg-linear-to-br from-foreground/60 to-foreground/30 shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                  />
                ))}
              </span>
            ) : (
              <span className="font-mono text-[2.8rem] font-black leading-none tracking-tight dark:text-white text-black tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300">
                ${formatCurrency(balance)}
              </span>
            )}
          </button>

          {/* Quick actions */}
          <div className="mt-7 grid grid-cols-3 gap-3">
            {QUICK.map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="group/q flex flex-col items-center justify-center gap-2.5 rounded-[24px] bg-black/5 py-5 ring-1 ring-black/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/10 hover:shadow-[0_8px_24px_-8px_var(--primary-glow)] hover:ring-primary/20 active:scale-95 dark:bg-black/40 dark:ring-white/5 dark:hover:bg-black/60"
              >
                <Icon className="h-5 w-5 text-primary transition-all duration-300 group-hover/q:scale-110 group-hover/q:text-primary-hover" strokeWidth={2} />
                <span className="text-[13px] font-semibold tracking-wide text-primary/90 transition-colors group-hover/q:text-primary">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export const HomeHeader = memo(HomeHeaderBase);
