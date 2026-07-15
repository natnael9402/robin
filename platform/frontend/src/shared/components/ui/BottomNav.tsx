'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, LineChart, CandlestickChart, Wallet, User } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthGate } from '../../contexts/AuthGateContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from '../NotificationBell';

const tabs = [
  { href: '/home', label: 'Home', icon: Home, gated: false },
  { href: '/market', label: 'Market', icon: LineChart, gated: false },

  { href: '/trade', label: 'Trade', icon: CandlestickChart, gated: true },
  { href: '/wallet', label: 'Wallet', icon: Wallet, gated: true },
  { href: '/profile', label: 'Profile', icon: User, gated: true },
];

// Nav slides/fades up on mount, then staggers each item in.
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 16, stiffness: 320 } },
};

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const check = () => setModalOpen(document.body.classList.contains('modal-open'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 220, delay: 0.05 }}
      className={cn(
        "fixed bottom-5 inset-x-5 z-40 bg-surface/80 backdrop-blur-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] rounded-[2rem] md:bg-transparent md:backdrop-blur-none md:shadow-none md:bottom-0 md:inset-x-0 md:rounded-none md:right-auto md:w-64 md:h-[100dvh] md:flex md:flex-col md:pt-6 md:px-4 transition-all border-none",
        modalOpen && "hidden md:flex"
      )}
    >
      {/* Desktop Logo and Theme Toggle in Sidebar */}
      <div className="hidden md:flex items-start justify-between px-4 mb-10">
        <div className="flex items-start gap-0.5">
          <span className="text-2xl font-black text-primary tracking-widest text-primary-glow">
            PAXORA
          </span>
          <span className="text-[8px] font-bold text-primary mt-0.5 opacity-80">TM</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell className="w-8 h-8" />
          <ThemeToggle className="w-8 h-8" />
        </div>
      </div>

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex items-center justify-around py-2.5 px-2 md:py-0 md:flex-col md:gap-2 md:items-stretch md:justify-start"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const go = () => {
            if (tab.gated) requireAuth(() => router.push(tab.href));
            else router.push(tab.href);
          };
          return (
            <motion.li key={tab.href} variants={itemVariants} className="flex-1 md:flex-none">
              <motion.button
                onClick={go}
                whileTap={{ scale: 0.82 }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                className="w-full flex flex-col md:flex-row md:items-center items-center gap-1 md:gap-4 py-2 px-1 relative rounded-2xl group"
              >
                {/* Desktop: full-width pill behind icon + label */}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="hidden md:block absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 shadow-[0_4px_12px_-4px_var(--primary-glow)] rounded-xl"
                    transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                  />
                )}
                <div className="relative flex items-center justify-center">
                  {/* Mobile: circular highlight around the icon */}
                  {active && (
                    <motion.div
                      layoutId="nav-circle"
                      className="md:hidden absolute -inset-2.5 rounded-full bg-gradient-to-b from-primary/25 to-primary/10 border border-primary/30 shadow-[0_4px_16px_-2px_var(--primary-glow)]"
                      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'w-[22px] h-[22px] relative z-10 transition-all duration-300',
                      active
                        ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)] scale-110'
                        : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                    )}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] md:text-sm font-semibold capitalize transition-colors relative z-10 leading-tight',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {tab.label}
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.nav>
  );
}
