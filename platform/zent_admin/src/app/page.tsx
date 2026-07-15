'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, ShieldCheck, Activity, CreditCard, Server, Bell,
  ArrowUpRight, RefreshCw, Check, X, Wallet, UserCheck,
  CheckCircle2, AlertTriangle, ChevronRight, Banknote,
} from 'lucide-react';
import {
  getUsers, getPendingVerifications, getPendingTransactions, getPendingLoans,
  getOpenTrades, getArbitrageHostings, getAllDeposits, getMiningHostings,
  approveTransaction, rejectTransaction, approveVerification, rejectVerification,
  approveLoan, rejectLoan, forceTradeOutcome,
} from '@/lib/api';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { cn, formatDate } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;
type QueueTab = 'deposits' | 'kyc' | 'loans' | 'trades';

const money = (v: any) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compact = (v: any) => {
  const n = Number(v || 0);
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return money(n);
};

export default function OverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [tab, setTab] = useState<QueueTab>('deposits');

  const [users, setUsers] = useState<any[]>([]);
  const [kyc, setKyc] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [hostings, setHostings] = useState<any[]>([]);
  const [minings, setMinings] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const load = useCallback(async (soft = false) => {
    soft ? setRefreshing(true) : setLoading(true);
    const [u, k, d, l, t, h, m, ad] = await Promise.all([
      getUsers().catch(() => []),
      getPendingVerifications().catch(() => []),
      getPendingTransactions().catch(() => []),
      getPendingLoans().catch(() => []),
      getOpenTrades().catch(() => []),
      getArbitrageHostings().catch(() => []),
      getMiningHostings().catch(() => []),
      getAllDeposits().catch(() => []),
    ]);
    setUsers(Array.isArray(u) ? u : (u as any)?.data ?? []);
    setKyc(Array.isArray(k) ? k : []);
    setDeposits(Array.isArray(d) ? d : []);
    setLoans(Array.isArray(l) ? l : (l as any)?.data ?? []);
    setTrades(Array.isArray(t) ? t : []);
    setHostings(Array.isArray(h) ? h : (h as any)?.data ?? []);
    setMinings(Array.isArray(m) ? m : (m as any)?.data ?? []);
    setAllDeposits(Array.isArray(ad) ? ad : []);
    soft ? setRefreshing(false) : setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Derived metrics ----
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const admins = users.filter((u) => (u.role ?? (u.isAdmin ? 'admin' : 'user')) === 'admin').length;
    const totalBalance = users.reduce((s, u) => {
      const ab = u.accountBalances?.find((b: any) => b.type === 'fast_trade');
      return s + (ab ? Number(ab.balance || 0) : Number(u.balance || 0));
    }, 0);
    const pendingKyc = kyc.length;
    const pendingDeposits = deposits.length;
    const pendingDepositVol = deposits.reduce((s, d) => s + Number(d.amount || 0), 0);
    const pendingLoans = loans.length;
    const pendingLoanVol = loans.reduce((s, l) => s + Number(l.amount || 0), 0);
    const openTrades = trades.length;
    const openTradeVol = trades.reduce((s, t) => s + Number(t.amount || 0), 0);
    const activeArb = hostings.filter((h) => (h.status ?? 'running') === 'running').length;
    const activeMining = minings.filter((m) => (m.status ?? 'running') === 'running').length;
    const approvedDepositVol = allDeposits
      .filter((d) => d.status === 'approved')
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    const pendingActions = pendingKyc + pendingDeposits + pendingLoans;
    return { totalUsers, admins, totalBalance, pendingKyc, pendingDeposits, pendingDepositVol, pendingLoans, pendingLoanVol, openTrades, openTradeVol, activeArb, activeMining, approvedDepositVol, pendingActions };
  }, [users, kyc, deposits, loans, trades, hostings, minings, allDeposits]);

  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 6),
    [users]
  );

  // ---- Queue actions (wired to /ol) ----
  const act = async (fn: () => Promise<any>, msg: string) => {
    try { await fn(); notify('success', msg); load(true); }
    catch { notify('error', 'Action failed'); }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl p-4 lg:p-8 lg:pt-16">
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-surface-hover" />
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </main>
    );
  }

  const heroCards = [
    { label: 'Total Users', value: String(stats.totalUsers), sub: `${stats.admins} admins`, icon: Users, href: '/users' },
    { label: 'Platform Balance', value: compact(stats.totalBalance), sub: 'Total user liability', icon: Wallet, href: '/users' },
    { label: 'Pending Actions', value: String(stats.pendingActions), sub: 'Awaiting review', icon: Bell, href: undefined },
    { label: 'Open Trades', value: String(stats.openTrades), sub: `${money(stats.openTradeVol)} at risk`, icon: Activity, href: undefined },
  ];

  const miniStats = [
    { label: 'Pending KYC', value: String(stats.pendingKyc), icon: ShieldCheck, href: '/kyc' },
    { label: 'Pending Deposits', value: String(stats.pendingDeposits), hint: money(stats.pendingDepositVol), icon: DollarSign, href: '/deposits' },
    { label: 'Pending Loans', value: String(stats.pendingLoans), hint: money(stats.pendingLoanVol), icon: CreditCard, href: '/loans' },
    { label: 'Active Arbitrage', value: String(stats.activeArb), icon: Server, href: '/arbitrage/hostings' },
    { label: 'Active Mining', value: String(stats.activeMining), icon: Server, href: '/mining/hostings' },
    { label: 'Deposit Volume', value: compact(stats.approvedDepositVol), icon: Banknote, href: '/deposits' },
    { label: 'Verified Admins', value: String(stats.admins), icon: UserCheck, href: '/users' },
  ];

  const queueTabs: { key: QueueTab; label: string; count: number }[] = [
    { key: 'deposits', label: 'Deposits', count: stats.pendingDeposits },
    { key: 'kyc', label: 'KYC', count: stats.pendingKyc },
    { key: 'loans', label: 'Loans', count: stats.pendingLoans },
    { key: 'trades', label: 'Open Trades', count: stats.openTrades },
  ];

  return (
    <div className="min-h-screen pb-20">
      {toast && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-[600] -translate-x-1/2">
          <div className={cn('glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glass-lg',
            toast.type === 'success' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive')}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <main className="animate-rise mx-auto w-full max-w-7xl p-4 lg:p-8 lg:pt-16">
        <PageHeader
          title="Overview"
          subtitle="Real-time operational snapshot of your platform."
          action={
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-border-light bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <button
                onClick={() => load(true)}
                className="flex items-center gap-2 rounded-full border border-border-light bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-hover"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          }
        />

        {/* Hero KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroCards.map((c) => {
            const Comp: any = c.href ? Link : 'div';
            return (
              <Comp key={c.label} {...(c.href ? { href: c.href } : {})}
                className={cn('group relative overflow-hidden rounded-3xl border border-glass-border bg-surface p-5 shadow-glass transition-all', c.href && 'hover:-translate-y-0.5')}>
                {/* Subtle, uniform brand wash — same color on every card */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary opacity-[0.10] blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_18px_var(--primary-muted)]">
                    <c.icon size={22} />
                  </div>
                  {c.href && <ArrowUpRight size={18} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
                </div>
                <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-foreground">{c.value}</p>
                <p className="relative mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="relative mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
              </Comp>
            );
          })}
        </div>

        {/* Mini stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {miniStats.map((s) => (
            <Link key={s.label} href={s.href} className="group rounded-2xl border border-border-light bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-hover text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon size={18} />
              </div>
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              {s.hint && <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{s.hint}</p>}
            </Link>
          ))}
        </div>

        {/* Action queue + side rail */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Queue */}
          <Card padding="none" className="overflow-hidden lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2 border-b border-border-light p-3">
              {queueTabs.map((q) => (
                <button key={q.key} onClick={() => setTab(q.key)}
                  className={cn('flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                    tab === q.key ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground')}>
                  {q.label}
                  <span className={cn('rounded-full px-1.5 text-[11px] font-bold', tab === q.key ? 'bg-background/20' : 'bg-surface-hover')}>{q.count}</span>
                </button>
              ))}
            </div>

            <div className="divide-y divide-border-light">
              {tab === 'deposits' && (deposits.length === 0
                ? <Empty label="No pending deposits" />
                : deposits.slice(0, 8).map((d) => (
                  <QueueRow key={d.id} title={money(d.amount)} subtitle={`${d.user?.name ?? `User #${d.userId ?? d.user_id ?? '—'}`} · ${d.paymentMethod ?? d.currency ?? 'deposit'}`} date={d.createdAt}
                    actions={<>
                      <ActBtn tone="success" onClick={() => act(() => approveTransaction(d.id), 'Deposit approved')}><Check size={15} /></ActBtn>
                      <ActBtn tone="destructive" onClick={() => act(() => rejectTransaction(d.id), 'Deposit rejected')}><X size={15} /></ActBtn>
                    </>} />
                )))}

              {tab === 'kyc' && (kyc.length === 0
                ? <Empty label="No pending KYC submissions" />
                : kyc.slice(0, 8).map((k) => (
                  <QueueRow key={k.id} title={k.user?.name ?? `User #${k.userId ?? '—'}`} subtitle={`${(k.documentType ?? 'document').replace('_', ' ')} · ${k.documentNumber ?? '—'}`} date={k.createdAt}
                    actions={<>
                      <ActBtn tone="success" onClick={() => act(() => approveVerification(k.id), 'KYC approved')}><Check size={15} /></ActBtn>
                      <ActBtn tone="destructive" onClick={() => act(() => rejectVerification(k.id), 'KYC rejected')}><X size={15} /></ActBtn>
                    </>} />
                )))}

              {tab === 'loans' && (loans.length === 0
                ? <Empty label="No pending loans" />
                : loans.slice(0, 8).map((l) => (
                  <QueueRow key={l.id} title={money(l.amount)} subtitle={`User #${l.userId ?? l.user_id ?? '—'} · ${l.duration ?? '—'} term`} date={l.createdAt}
                    actions={<>
                      <ActBtn tone="success" onClick={() => act(() => approveLoan(l.id), 'Loan approved')}><Check size={15} /></ActBtn>
                      <ActBtn tone="destructive" onClick={() => act(() => rejectLoan(l.id), 'Loan rejected')}><X size={15} /></ActBtn>
                    </>} />
                )))}

              {tab === 'trades' && (trades.length === 0
                ? <Empty label="No open trades" />
                : trades.slice(0, 8).map((t) => (
                  <QueueRow key={t.id} title={`${t.symbol ?? t.assetSymbol ?? 'Trade'} · ${money(t.amount)}`} subtitle={`User #${t.userId ?? t.user_id ?? '—'} · ${t.type ?? t.direction ?? '—'}`} date={t.openedAt ?? t.opened_at ?? t.createdAt}
                    actions={<>
                      <button onClick={() => act(() => forceTradeOutcome(t.id, 'WIN'), 'Trade forced WIN')} className="rounded-lg bg-success-muted px-2.5 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success/20">WIN</button>
                      <button onClick={() => act(() => forceTradeOutcome(t.id, 'LOSS'), 'Trade forced LOSS')} className="rounded-lg bg-destructive-muted px-2.5 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20">LOSS</button>
                    </>} />
                )))}
            </div>
          </Card>

          {/* Recent users */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
              <h3 className="flex items-center gap-2 font-bold text-foreground"><Users size={18} className="text-muted-foreground" /> Recent Users</h3>
              <Link href="/users" className="flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground">View all <ChevronRight size={14} /></Link>
            </div>
            <div className="divide-y divide-border-light">
              {recentUsers.length === 0 ? <Empty label="No users yet" /> : recentUsers.map((u) => (
                <button key={u.id} onClick={() => router.push(`/users/${u.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-active text-sm font-bold text-primary-foreground">
                    {(u.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{u.name || 'No Name'}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{money(u.accountBalances?.find((b: any) => b.type === 'fast_trade')?.balance ?? u.balance)}</p>
                    {(u.role === 'admin' || u.isAdmin) && <StatusBadge status="admin" size="xs" />}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function QueueRow({ title, subtitle, date, actions }: { title: string; subtitle: string; date?: string; actions: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-hover">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{title}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {date && <span className="hidden font-mono text-[11px] text-subtle-foreground sm:block">{formatDate(date)}</span>}
        {actions}
      </div>
    </div>
  );
}

function ActBtn({ tone, onClick, children }: { tone: 'success' | 'destructive'; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
      tone === 'success' ? 'bg-success-muted text-success hover:bg-success/20' : 'bg-destructive-muted text-destructive hover:bg-destructive/20')}>
      {children}
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <CheckCircle2 size={28} className="text-subtle-foreground opacity-40" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
