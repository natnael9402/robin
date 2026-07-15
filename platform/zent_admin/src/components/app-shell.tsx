'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  MessageCircle,
  DollarSign,
  Server,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Wallet,
  Gift,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  Newspaper,
} from 'lucide-react';
import { logout, getSupportUnreadCount } from '@/lib/api';
import { cn } from '@/shared/lib/utils';
import { ThemeToggle } from './theme-toggle';

/** Poll the /ol unread support-message count so admins are notified of new questions. */
function useSupportUnread() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const tick = () => getSupportUnreadCount().then((c) => { if (alive) setCount(c); }).catch(() => {});
    tick();
    const id = setInterval(tick, 15000);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);
  return count;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  match?: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Overview', match: (p) => p === '/' },
  { href: '/users', icon: Users, label: 'Users', match: (p) => p.startsWith('/users') },
  { href: '/news', icon: Newspaper, label: 'News', match: (p) => p.startsWith('/news') },
  { href: '/kyc', icon: UserCheck, label: 'KYC Requests' },
  { href: '/loans', icon: CreditCard, label: 'Loans' },
  { href: '/deposits', icon: ArrowDownLeft, label: 'Deposits' },
  { href: '/withdrawals', icon: ArrowUpRight, label: 'Withdrawals' },
  { href: '/arbitrage/hostings', icon: Server, label: 'Arbitrage', match: (p) => p.startsWith('/arbitrage') },
  { href: '/mining/hostings', icon: Server, label: 'Mining', match: (p) => p.startsWith('/mining') },
  { href: '/wallet-addresses', icon: Wallet, label: 'Wallet Addresses' },
  { href: '/deleted-accounts', icon: Archive, label: 'Deleted Accounts' },
  { href: '/chat', icon: MessageCircle, label: 'Support Chat' },
  { href: '/referrals', icon: Gift, label: 'Referrals', match: (p) => p.startsWith('/referrals') },
];

function NavLinks({
  collapsed,
  onNavigate,
  unread = 0,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  unread?: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1.5 px-3">
      {NAV.map((item, i) => {
        const active = item.match ? item.match(pathname) : pathname === item.href;
        const Icon = item.icon;
        const badge = item.href === '/chat' && unread > 0 ? unread : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            style={{ animationDelay: `${i * 40}ms` }}
            className={cn(
              'slide-in-left animate-in group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-300',
              collapsed && 'justify-center px-0',
              active
                ? 'bg-foreground text-background shadow-glass'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
            )}
          >
            {active && !collapsed && (
              <span className="absolute -left-3 h-7 w-1.5 rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            )}
            <span className="relative shrink-0">
              <Icon size={20} className={cn('transition-transform duration-300 group-hover:scale-110', active && 'text-primary')} />
              {badge > 0 && collapsed && (
                <span className="absolute -right-1.5 -top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive ring-2 ring-surface-elevated">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                </span>
              )}
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && badge > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({
  collapsed,
  onToggleCollapse,
  onNavigate,
  unread = 0,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  unread?: number;
}) {
  return (
    <div className="flex h-full flex-col py-5">
      {/* Brand */}
      <div className={cn('mb-6 flex items-center gap-3 px-5', collapsed && 'justify-center px-0')}>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_20px_var(--primary-muted)]">
          <Zap size={20} className="fill-current" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight text-foreground">Zent Admin</p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-subtle-foreground">Control Center</p>
          </div>
        )}
      </div>

      <NavLinks collapsed={collapsed} onNavigate={onNavigate} unread={unread} />

      {/* Footer actions */}
      <div className={cn('mt-4 space-y-2 px-3', collapsed && 'px-2')}>
        <div className="h-px bg-border-light" />
        <button
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-destructive-muted',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-subtle-foreground transition-all hover:bg-surface-hover hover:text-foreground lg:flex',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapse preference
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('sidebar-collapsed') === '1');
    } catch {
      /* ignore */
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const unread = useSupportUnread();

  // The login screen renders bare — no chrome.
  if (pathname === '/login') return <>{children}</>;

  const sidebarWidth = collapsed ? 'lg:w-[88px]' : 'lg:w-72';
  const contentOffset = collapsed ? 'lg:pl-[88px]' : 'lg:pl-72';

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — fixed glass panel */}
      <aside
        className={cn(
          'glass-strong fixed inset-y-0 left-0 z-40 hidden border-r border-glass-border shadow-glass transition-[width] duration-300 ease-out lg:block',
          sidebarWidth
        )}
      >
        <SidebarInner collapsed={collapsed} onToggleCollapse={toggleCollapse} unread={unread} />
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-glass-border px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap size={16} className="fill-current" />
          </div>
          <span className="font-extrabold tracking-tight text-foreground">Zent Admin</span>
        </button>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="relative rounded-xl p-2 text-foreground transition-colors hover:bg-surface-hover"
          >
            <Menu size={22} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-surface">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-in slide-in-left bg-surface absolute inset-y-0 left-0 z-10 flex w-[280px] max-w-[80vw] flex-col border-r border-glass-border shadow-glass-lg">
            <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Zap size={16} className="fill-current" />
                </div>
                <span className="font-extrabold tracking-tight text-foreground">Zent Admin</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarInner collapsed={false} onNavigate={() => setMobileOpen(false)} unread={unread} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn('pb-4 transition-[padding] duration-300 ease-out lg:pb-0', contentOffset)}>
        {/* Desktop floating theme toggle */}
        <div className="fixed right-6 top-5 z-30 hidden lg:block">
          <ThemeToggle className="shadow-glass" />
        </div>
        {children}
      </div>
    </div>
  );
}
