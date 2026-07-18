'use client';

import { motion } from 'framer-motion';
import { 
  Shield, Target, Users, TrendingUp, Globe, Award, 
  Lock, Zap, ChevronRight, Star, ArrowUpRight, Gem,
  Sparkles, Clock, BarChart3
} from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { BackButton } from '../../shared/components/ui/BackButton';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { cn } from '../../shared/lib/utils';

const CORE_VALUES = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'Bank-grade encryption and multi-factor authentication protect every transaction.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Target,
    title: 'Precision Trading',
    description: 'Advanced algorithms and real-time analytics for optimal trade execution.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built by traders, for traders. Our community shapes every feature we build.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-second order execution with zero slippage on all trade types.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

const MILESTONES = [
  { year: '2024', event: 'Platform Launch', description: 'Paxora Premium goes live with spot and futures trading.' },
  { year: '2025', event: 'Fast Trade Release', description: 'Introduced binary options with up to 40% returns.' },
  { year: '2025', event: 'Global Expansion', description: 'Expanded to 50+ countries with multi-currency support.' },
  { year: '2026', event: 'Version 2.0', description: 'Complete platform redesign with premium features.' },
];

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

export function AboutUsPage() {
  useDocumentTitle('About Us · Paxora Premium');

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none px-6 pt-16 pb-2 md:pt-10 md:px-0">
        <div className="mb-3">
          <BackButton href="/profile" />
        </div>
        <PageHeader
          title="About Us"
          subtitle="The story behind Paxora Premium"
          action={
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Star size={18} className="text-[#D4AF37]" />
            </div>
          }
        />
      </div>

      <div className="px-6 md:px-0 space-y-10 mt-4">

        {/* Hero */}
        <Section>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0a0a0f] to-[#111118] border border-[#D4AF37]/10 p-8 shadow-[0_20px_60px_-20px_rgba(212,175,55,0.15)]">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#D4AF37]/5 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-[#D4AF37]/5 blur-[80px]" />
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-1.5 mb-6">
                <Sparkles size={12} className="text-[#D4AF37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Version 2.0</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-4">
                PAXORA PREMIUM
              </h1>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                A next-generation trading platform built for serious investors. 
                We combine institutional-grade technology with an intuitive interface 
                to deliver exceptional trading experiences.
              </p>
              <div className="flex justify-center gap-6 mt-8">
                {[
                  { value: '50+', label: 'Countries' },
                  { value: '100K+', label: 'Traders' },
                  { value: '$2B+', label: 'Volume' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xl font-black text-[#D4AF37]" style={{ textShadow: '0 0 12px rgba(212,175,55,0.4)' }}>{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Mission */}
        <Section delay={0.1}>
          <SectionLabel icon={Target} text="Our Mission" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/8 blur-3xl" />
            <div className="relative">
              <blockquote className="text-lg font-bold text-foreground leading-relaxed">
                "To democratize access to premium trading tools and empower every 
                investor with the technology, education, and support needed to 
                navigate global markets with confidence."
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                  <Award size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Paxora Premium</p>
                  <p className="text-[11px] text-muted-foreground">Founded 2024</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Core Values */}
        <Section delay={0.2}>
          <SectionLabel icon={Gem} text="Core Values" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORE_VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5 h-full">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
                  <div className="relative">
                    <div className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-2xl border mb-4',
                      value.bg, value.border
                    )}>
                      <value.icon size={20} className={value.color} />
                    </div>
                    <h3 className="text-[15px] font-black text-foreground mb-2">{value.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* What We Offer */}
        <Section delay={0.3}>
          <SectionLabel icon={BarChart3} text="What We Offer" />
          <div className="rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
            <div className="space-y-3">
              {[
                { icon: TrendingUp, title: 'Spot & Futures Trading', desc: 'Trade crypto, metals, stocks with up to 125× leverage', color: 'text-primary' },
                { icon: Zap, title: 'Fast Trade Options', desc: '30–700 second binary options with up to 40% returns', color: 'text-amber-400' },
                { icon: Lock, title: 'Secure Wallets', desc: 'Three dedicated accounts: Spot, Trading, and Fast Trade', color: 'text-blue-400' },
                { icon: Globe, title: 'Multi-Network Support', desc: 'Deposit and withdraw via TRC20, ERC20, BEP20, and SOL', color: 'text-violet-400' },
                { icon: Users, title: 'Referral Program', desc: 'Earn 10% commission from every qualified referral', color: 'text-emerald-400' },
                { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock assistance from our expert team', color: 'text-rose-400' },
              ].map((item, i) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.04] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.06]">
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-black text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Timeline */}
        <Section delay={0.35}>
          <SectionLabel icon={Clock} text="Our Journey" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-surface/60 backdrop-blur-xl p-5">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
              <div className="space-y-6">
                {MILESTONES.map((milestone, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <span className="text-[10px] font-black text-primary">{milestone.year.slice(2)}</span>
                    </div>
                    <div className="min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[13px] font-black text-foreground">{milestone.event}</h4>
                        <span className="text-[9px] font-bold text-primary/60">{milestone.year}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section delay={0.4}>
          <SectionLabel icon={ArrowUpRight} text="Get in Touch" />
          <div className="rounded-[24px] border border-[#D4AF37]/20 bg-[#D4AF37]/5 backdrop-blur-xl p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mx-auto mb-4">
              <Globe size={24} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">paxorapremiumlab.com</h3>
            <p className="text-[12px] text-muted-foreground mb-2 max-w-sm mx-auto">
              Have questions? Our support team is available 24/7 to help you 
              with anything you need.
            </p>
            <a
              href="mailto:Info@paxorapremiumlab.com"
              className="text-[12px] font-bold text-[#D4AF37] mb-4 inline-block hover:underline"
            >
              Info@paxorapremiumlab.com
            </a>
            <div>
              <a
                href="mailto:Info@paxorapremiumlab.com"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-black text-black transition-all hover:bg-[#D4AF37]/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              >
                Contact Support
                <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
