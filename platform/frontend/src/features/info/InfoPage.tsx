'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ArrowRightLeft, Wallet, ShieldCheck, Zap, Clock,
  ChevronDown, ChevronUp, ArrowUpRight, CircleDollarSign,
  Users, Gem, Sparkles, Info as InfoIcon, Trophy, Target,
  DollarSign, Layers, RefreshCw, Percent,
} from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { BackButton } from '../../shared/components/ui/BackButton';
import { cn } from '../../shared/lib/utils';

const TRADE_LEVELS = [
  {
    level: 1,
    name: 'Starter',
    durations: '30s – 1m',
    minCapital: 100,
    maxCapital: 20000,
    returnRate: '15–20%',
    description: 'Perfect for beginners. Low capital, fast trades.',
  },
  {
    level: 2,
    name: 'Advanced',
    durations: '1.5m – 3m',
    minCapital: 20001,
    maxCapital: 200000,
    returnRate: '25–30%',
    description: 'For experienced traders with mid-range capital.',
  },
  {
    level: 3,
    name: 'Elite',
    durations: '5m – 11.7m',
    minCapital: 200001,
    maxCapital: 500000,
    returnRate: '35–40%',
    description: 'Maximum returns for high-capital traders.',
  },
];

const NETWORKS = [
  { name: 'TRC20', baseFee: 1, color: 'text-red-400' },
  { name: 'ERC20', baseFee: 5, color: 'text-blue-400' },
  { name: 'BEP20', baseFee: 0.5, color: 'text-yellow-400' },
  { name: 'SOL', baseFee: 0.2, color: 'text-purple-400' },
];

const WALLETS = [
  { name: 'Spot', desc: 'Buy & sell crypto, metals, stocks.', icon: Wallet },
  { name: 'Trading', desc: 'Futures with up to 125× leverage.', icon: TrendingUp },
  { name: 'Fast Trade', desc: '30–700s binary options.', icon: Zap },
];

const LEVERAGES = [2, 5, 10, 20, 50, 100, 125];

function Section({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
      <Icon className="w-3.5 h-3.5" />
      {text}
    </h2>
  );
}

function LevelCard({ level, index }: { level: typeof TRADE_LEVELS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const exampleWin = level.minCapital + (level.minCapital * 20 / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          'relative overflow-hidden rounded-[24px] border transition-all duration-300 cursor-pointer',
          open
            ? 'border-primary/30 shadow-[0_0_40px_-10px_var(--primary-glow)]'
            : 'border-white/[0.06] hover:border-primary/20 hover:shadow-[0_0_25px_-8px_var(--primary-glow)]'
        )}
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <div className="p-5">
          {/* Top row: level badge + return rate */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <span className="text-lg font-black text-primary">L{level.level}</span>
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">{level.name}</h3>
                <p className="text-[11px] text-muted-foreground font-medium">{level.durations}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary text-primary-glow">{level.returnRate}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">return</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{level.description}</p>

          {/* Capital range - inline bar */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.04] px-4 py-3">
            <DollarSign size={14} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-black text-foreground">${level.minCapital.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground font-bold">to</span>
                <span className="text-sm font-black text-foreground">${level.maxCapital.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary"
                  style={{ width: `${((index + 1) / TRADE_LEVELS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Expand */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Min Investment</p>
                      <p className="mt-1 text-xl font-black text-primary">${level.minCapital.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Max Investment</p>
                      <p className="mt-1 text-xl font-black text-primary">${level.maxCapital.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-black/20 border border-primary/20 p-4 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-primary/50">Example: ${level.minCapital.toLocaleString()} trade wins</p>
                    <p className="mt-1 text-3xl font-black text-primary text-primary-glow">${exampleWin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-[11px] font-bold text-emerald-400 mt-0.5">+${(exampleWin - level.minCapital).toLocaleString(undefined, { maximumFractionDigits: 0 })} profit</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Trade duration: <span className="font-bold text-foreground">{level.durations}</span></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom chevron */}
        <div className="border-t border-white/[0.04] py-2 flex justify-center">
          {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>
    </motion.div>
  );
}

export function InfoPage() {
  useDocumentTitle('Platform Info · Paxora Capital');

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <div className="mb-3">
          <BackButton href="/home" />
        </div>
        <PageHeader
          title="Platform Info"
          subtitle="Rules, fees & how everything works"
          action={
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <InfoIcon size={18} className="text-primary" />
            </div>
          }
        />
      </div>

      <div className="px-6 md:px-0 space-y-10 mt-4">

        {/* ─── QUICK STATS ─── */}
        <Section>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Percent, label: 'Trading Fee', value: '2%' },
              { icon: TrendingUp, label: 'Max Return', value: '40%' },
              { icon: ArrowRightLeft, label: 'Transfers', value: 'Free' },
              { icon: Gem, label: 'Deposit Bonus', value: '10%' },
            ].map((s) => (
              <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                    <s.icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-black text-foreground">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── TRADE LEVELS ─── */}
        <Section delay={0.1}>
          <SectionLabel icon={Zap} text="Trade Levels" />
          <div className="space-y-3">
            {TRADE_LEVELS.map((level, i) => (
              <LevelCard key={level.level} level={level} index={i} />
            ))}
          </div>
        </Section>

        {/* ─── FEES ─── */}
        <Section delay={0.2}>
          <SectionLabel icon={DollarSign} text="Fee Structure" />

          {/* Trading Fee */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5 mb-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Percent size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-foreground">Trading Fee</h3>
                  <p className="text-[11px] text-muted-foreground">Applied to every trade</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/20 border border-primary/15 p-5 text-center">
                <p className="text-5xl font-black text-foreground">2<span className="text-primary">%</span></p>
                <p className="mt-2 text-xs text-muted-foreground">deducted automatically</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Options', 'Contracts', 'Spot', 'Stocks'].map((t) => (
                  <span key={t} className="rounded-full bg-white/[0.04] border border-white/[0.04] px-3 py-1 text-[10px] font-bold text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Withdrawal Fee */}
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5 mb-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-500/8 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <ArrowUpRight size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-foreground">Withdrawal Fee</h3>
                  <p className="text-[11px] text-muted-foreground">Base fee + percentage</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-4 mb-3">
                <div className="text-center mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Formula</p>
                  <p className="text-lg font-black text-foreground mt-1">Base Fee + 0.05%</p>
                  <p className="text-[11px] text-muted-foreground">Capped at $20 max</p>
                </div>
                <div className="space-y-1.5">
                  {NETWORKS.map((net) => (
                    <div key={net.name} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-2">
                      <span className={cn('text-sm font-bold', net.color)}>{net.name}</span>
                      <span className="text-sm font-black text-foreground">${net.baseFee.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/10 px-3 py-2.5">
                <InfoIcon size={12} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-[11px] text-muted-foreground">0.05% only on amounts over <span className="font-bold text-foreground">$100</span></p>
              </div>
            </div>
          </div>

          {/* Bonus + Referral grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Deposit Bonus */}
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Sparkles size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-foreground">Deposit Bonus</h3>
                    <p className="text-[10px] text-muted-foreground">≥ $5,000</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4 text-center mb-3">
                  <p className="text-4xl font-black text-emerald-400">10<span className="text-2xl">%</span></p>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span className="font-bold text-foreground">$5,000</span></div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="flex justify-between"><span className="text-muted-foreground">Bonus</span><span className="font-bold text-emerald-400">+$500</span></div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="flex justify-between"><span className="font-bold text-foreground">Total</span><span className="font-black text-foreground">$5,500</span></div>
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Users size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-foreground">Referral Commission</h3>
                    <p className="text-[10px] text-muted-foreground">From referrals</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-violet-500/5 border border-violet-500/15 p-4 text-center mb-3">
                  <p className="text-4xl font-black text-violet-400">10<span className="text-2xl">%</span></p>
                </div>
                <div className="space-y-2">
                  {['Share your code', 'They deposit $5K+', 'You earn 10%'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[8px] font-black text-violet-400">{i + 1}</div>
                      <p className="text-[11px] text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ─── TRANSFERS ─── */}
        <Section delay={0.3}>
          <SectionLabel icon={ArrowRightLeft} text="Account Transfers" />

          {/* Wallet cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {WALLETS.map((w) => (
              <div key={w.name} className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 mb-3">
                  <w.icon size={18} className="text-primary" />
                </div>
                <h3 className="text-[13px] font-black text-foreground">{w.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{w.desc}</p>
              </div>
            ))}
          </div>

          {/* Flow */}
          <div className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-0">
              {WALLETS.map((w, i) => (
                <div key={w.name} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.06]">
                      <w.icon size={18} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-foreground">{w.name}</span>
                  </div>
                  {i < WALLETS.length - 1 && (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5">
                        <ArrowRightLeft size={10} className="text-primary" />
                        <span className="text-[8px] font-black text-primary">FREE</span>
                      </div>
                      <RefreshCw size={11} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-primary">Instant</span> and <span className="font-bold text-primary">fee-free</span> between any two wallets
              </p>
            </div>
          </div>
        </Section>

        {/* ─── CONTRACT RULES ─── */}
        <Section delay={0.35}>
          <SectionLabel icon={Layers} text="Contract Rules" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Yield Tiers */}
            <div className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                  <Target size={16} className="text-primary" />
                </div>
                <h3 className="text-[13px] font-black text-foreground">Yield Tiers</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Up to $5K', yield: 15 },
                  { label: '$5K – $20K', yield: 20 },
                  { label: '$20K – $40K', yield: 30 },
                  { label: '$40K+', yield: 40 },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.04] px-3.5 py-2.5">
                    <span className="text-[12px] font-bold text-foreground">{tier.label}</span>
                    <span className="text-base font-black text-primary text-primary-glow">{tier.yield}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leverage + Min Trade */}
            <div className="space-y-3">
              {/* Leverage */}
              <div className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15">
                    <Layers size={16} className="text-amber-400" />
                  </div>
                  <h3 className="text-[13px] font-black text-foreground">Leverage</h3>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {LEVERAGES.map((lev) => (
                    <div key={lev} className="flex flex-col items-center rounded-xl bg-white/[0.04] border border-white/[0.04] py-2 transition-all hover:border-primary/30">
                      <span className="text-sm font-black text-foreground">{lev}×</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 px-2.5 py-2">
                  <ShieldCheck size={11} className="mt-0.5 shrink-0 text-amber-400" />
                  <p className="text-[10px] text-muted-foreground">125× = <span className="font-bold text-destructive">0.8% move</span> liquidates you</p>
                </div>
              </div>

              {/* Minimums */}
              <div className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                    <CircleDollarSign size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-[13px] font-black text-foreground">Minimums</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { type: 'Options', min: '$100' },
                    { type: 'Contracts', min: '$10' },
                    { type: 'Spot', min: '$10' },
                  ].map((t) => (
                    <div key={t.type} className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.04] px-3.5 py-2.5">
                      <span className="text-[12px] font-bold text-muted-foreground">{t.type}</span>
                      <span className="text-base font-black text-foreground">{t.min}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
