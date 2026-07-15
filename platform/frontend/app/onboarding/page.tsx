'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Target, Users, Globe, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '../../src/shared/lib/utils';

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1400, start = false, decimals = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!start) { setValue(0); return; }
    const from = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - from) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(eased * target);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
}

/* ── Stat data ── */
const STATS_SET_1 = [
  { raw: 347899, suffix: '', label: 'Total Trades', icon: BarChart3, decimals: 0 },
  { raw: 562345, suffix: '', label: 'Members', icon: Users, decimals: 0 },
  { raw: 9, suffix: '', label: 'Years of Trust', icon: Calendar, decimals: 0 },
];

const STATS_SET_2 = [
  { raw: 88.73, suffix: '%', label: 'Win Rate', icon: Target, decimals: 2 },
  { raw: 62, suffix: '', label: 'Countries', icon: Globe, decimals: 0 },
  { raw: 723, suffix: '%', label: 'Avg Balance Growth', icon: TrendingUp, decimals: 0 },
];

/* ── Animated stat card ── */
function AnimStat({ stat, index, animate }: { stat: typeof STATS_SET_1[number]; index: number; animate: boolean }) {
  const count = useCountUp(stat.raw, 1400, animate, stat.decimals);
  const Icon = stat.icon;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5 transition-all duration-700 ease-out',
        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      )}
      style={{ transitionDelay: `${200 + index * 150}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#D4AF37]/[0.05] to-transparent" />
      <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_32px_rgba(212,175,55,0.35)] transition-shadow duration-500">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
      </div>
      <div className="relative min-w-0">
        <p className="font-mono text-[1.6rem] sm:text-[2rem] font-black leading-none tracking-tight text-white tabular-nums">
          {count}{stat.suffix}
        </p>
        <p className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{stat.label}</p>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  const goNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => setStep((s) => s + 1), 50);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808] text-white" style={{ colorScheme: 'dark' }}>

      {/* ════════ Step 0: Splash ════════ */}
      {step === 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            <img src="/onboard.webp" alt="Welcome" className="w-full h-full object-cover" />
          </div>
          <div className="shrink-0 px-5 pb-8 pt-4 space-y-3">
            <button
              onClick={goNext}
              className="w-full rounded-2xl bg-[#b48608] py-3.5 text-sm font-bold text-black transition-all active:scale-[0.98] hover:shadow-[0_0_24px_rgba(180,134,8,0.3)]"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-2xl border border-white/10 py-3.5 text-sm font-bold text-white/70 transition-all active:scale-[0.98] hover:bg-white/[0.04]"
            >
              I already have an account
            </button>
          </div>
        </div>
      )}

      {/* ════════ Step 1 & 2: Stats ════════ */}
      {(step === 1 || step === 2) && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top: title */}
          <div className={cn(
            'shrink-0 pt-14 sm:pt-16 px-6 text-center transition-all duration-600',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3',
          )}>
            <div className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 mb-4 transition-all duration-500 delay-100',
              step === 1
                ? 'border-[#D4AF37]/20 bg-[#D4AF37]/10'
                : 'border-emerald-500/20 bg-emerald-500/10',
            )}>
              <span className={cn(
                'text-[9px] font-black uppercase tracking-[0.15em]',
                step === 1 ? 'text-[#D4AF37]' : 'text-emerald-400',
              )}>
                {step === 1 ? 'Proven Track Record' : 'Performance'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-[1.7rem] font-black tracking-tight leading-tight">
              {step === 1 ? (
                <>Trusted by<br /><span className="text-[#b48608]">hundreds of thousands</span></>
              ) : (
                <>Numbers that<br /><span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">speak for themselves</span></>
              )}
            </h2>
          </div>

          {/* Middle: stats (scrollable if needed) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
            <div className="flex flex-col justify-center h-full max-w-sm mx-auto space-y-3">
              {(step === 1 ? STATS_SET_1 : STATS_SET_2).map((s, i) => (
                <AnimStat key={s.label} stat={s} index={i} animate={visible} />
              ))}
            </div>
          </div>

          {/* Bottom: button + progress */}
          <div className="shrink-0 px-5 pb-8 pt-2 space-y-3">
            <button
              onClick={step === 1 ? goNext : () => router.push('/signup')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#b48608] py-3.5 text-sm font-bold text-black transition-all active:scale-[0.98] hover:shadow-[0_0_24px_rgba(180,134,8,0.3)]"
            >
              {step === 1 ? 'Continue' : 'Get Started'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex justify-center gap-1.5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 rounded-full transition-all duration-500',
                    step === i ? 'w-8 bg-[#b48608]' : 'w-3 bg-white/15',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
