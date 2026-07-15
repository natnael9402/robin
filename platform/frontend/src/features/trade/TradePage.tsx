'use client';

import Link from 'next/link';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { TrendingUp, ArrowLeftRight, FileText } from 'lucide-react';
import { cn } from '../../shared/lib/utils';

const modes = [
  {
    id: 'option',
    label: 'Options',
    href: '/trade/option',
    icon: TrendingUp,
    desc: 'Binary options with timed expiry — predict direction and earn up to 40% return.',
    color: 'from-primary to-primary-hover',
  },
  {
    id: 'spot',
    label: 'Spot',
    href: '/trade/spot',
    icon: ArrowLeftRight,
    desc: 'Instant asset swap. Buy or sell crypto at the current market price.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'contract',
    label: 'Contract',
    href: '/trade/contract',
    icon: FileText,
    desc: 'Leveraged perpetual positions with take-profit, stop-loss, and liquidation.',
    color: 'from-purple-500 to-purple-600',
  },
];

export function TradePage() {
  useDocumentTitle('Fast Trade · Paxora Capital');

  return (
    <div className="flex flex-col min-h-screen bg-background pt-24 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">Fast Trade</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Choose your trading mode
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {modes.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl p-6 transition-all duration-300',
                'hover:border-white/20 hover:bg-surface/80 hover:shadow-lg hover:-translate-y-0.5',
                'active:scale-[0.98]'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-b shadow-lg',
                m.color,
                'text-black'
              )}>
                <m.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-black text-foreground mb-1.5">{m.label}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Start Trading
                <span className="text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
