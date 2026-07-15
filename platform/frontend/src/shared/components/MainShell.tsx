'use client';

import { usePathname } from 'next/navigation';
import { useMounted } from '../hooks/useMounted';
import { BottomNav } from './ui/BottomNav';
import { HubSpotIdentify } from './HubSpotIdentify';
import { ThemeToggle } from './ui/ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { BackButton } from './ui/BackButton';
import { PageLoader } from './ui/PageLoader';

export function MainShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const pathname = usePathname();

  if (!mounted) {
    return <PageLoader />;
  }

  const hideLogo = pathname === '/home' || pathname.startsWith('/market/stock') || pathname.startsWith('/market/crypto');
  const showBack = pathname === '/trade' || pathname.startsWith('/market/stock') || pathname.startsWith('/market/crypto') || pathname.startsWith('/profile') || pathname.startsWith('/verification');

  return (
    <div className="min-h-[100dvh] text-foreground pb-24 md:pb-0 md:pl-64 relative transition-all">
      <div className="fixed top-2 left-6 right-6 z-50 md:hidden">
        <div className="grid grid-cols-3 items-center">
          <div className="flex justify-start">
            {!hideLogo ? (
              <div className="flex items-start gap-0.5">
                <span className="text-xl font-black text-primary tracking-widest text-primary-glow">PAXORA</span>
                <span className="text-[6px] font-bold text-primary mt-0.5 opacity-80">TM</span>
              </div>
            ) : showBack ? <BackButton /> : null}
          </div>
          <div className="flex justify-center">
            {pathname === '/home' && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base font-black text-[#D4AF37] tracking-[0.2em]">PAXORA</span>
                <span className="text-[6px] font-semibold dark:text-white text-black tracking-[0.15em] uppercase whitespace-nowrap">Welcome to Premium</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </div>
      {showBack && <div className="fixed top-6 left-[calc(16rem+1.5rem)] z-50 hidden md:block"><BackButton /></div>}

      {/* Paxora brand — top center on home page */}
      {pathname === '/home' && (
        <div className="fixed top-1 left-1/2 -translate-x-1/2 z-50 hidden md:block">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-base font-black text-[#D4AF37] tracking-[0.2em]">PAXORA</span>
            <span className="text-[6px] font-semibold dark:text-white text-black tracking-[0.15em] uppercase whitespace-nowrap">Welcome to Premium</span>
          </div>
        </div>
      )}

      {children}
      <BottomNav />
      <HubSpotIdentify />
    </div>
  );
}
