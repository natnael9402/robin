'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cpu, Server, Landmark, BarChart3,
  PieChart, Gift, Newspaper, Info
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface AppItem {
  name: string;
  icon: typeof Cpu;
  href: string;
}

const APPS: AppItem[] = [
  { name: 'AI Arbitrage', icon: Cpu, href: '/arbitrage' },
  { name: 'Mining pool', icon: Server, href: '/mining' },
  { name: 'Referral', icon: Gift, href: '/referral' },
  { name: 'Loans', icon: Landmark, href: '/loans' },
  { name: 'Futures', icon: BarChart3, href: '/options' },
  { name: 'Assets', icon: PieChart, href: '/assets' },
  { name: 'News', icon: Newspaper, href: '/news' },
  { name: 'Info', icon: Info, href: '/info' },
];

function AppGridBase() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="mb-10 grid grid-cols-4 gap-x-4 gap-y-8 md:mb-16 md:grid-cols-8 md:gap-y-10 lg:grid-cols-8">
      {APPS.map((app) => {
        const Icon = app.icon;
        return (
          <button
            key={app.name}
            onClick={() => router.push(app.href)}
            className="group flex flex-col items-center gap-3 transition-transform duration-300 active:scale-95"
          >
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-linear-to-br from-[#60A5FA] to-[#2563EB] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_-8px_var(--primary-glow)] ring-1 ring-[#3B82F6]/30">
              <Icon className="h-6 w-6 text-[#08110A] transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
            </div>
            
            <span className="max-w-full px-1 text-center text-[12px] font-bold tracking-wide text-primary/80 transition-colors group-hover:text-primary">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const AppGrid = memo(AppGridBase);
