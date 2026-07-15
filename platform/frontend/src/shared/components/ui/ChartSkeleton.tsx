'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const BARS = [
  { h: 32, w: 8 },
  { h: 52, w: 8 },
  { h: 24, w: 8 },
  { h: 64, w: 8 },
  { h: 40, w: 8 },
  { h: 16, w: 8 },
  { h: 56, w: 8 },
  { h: 72, w: 8 },
  { h: 36, w: 8 },
  { h: 20, w: 8 },
  { h: 48, w: 8 },
  { h: 60, w: 8 },
  { h: 28, w: 8 },
  { h: 44, w: 8 },
  { h: 68, w: 8 },
  { h: 38, w: 8 },
  { h: 54, w: 8 },
  { h: 22, w: 8 },
  { h: 50, w: 8 },
  { h: 70, w: 8 },
  { h: 34, w: 8 },
  { h: 58, w: 8 },
  { h: 42, w: 8 },
  { h: 18, w: 8 },
  { h: 62, w: 8 },
  { h: 46, w: 8 },
  { h: 30, w: 8 },
  { h: 66, w: 8 },
  { h: 26, w: 8 },
];

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-[#0d1520]', className)} style={{ height: '25vh', minHeight: 250 }}>
      <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-4 pb-8">
        {BARS.map((bar, i) => {
          const isUp = i % 3 !== 0;
          return (
            <motion.div
              key={i}
              className="relative rounded-[1px]"
              style={{
                width: bar.w,
                height: bar.h,
                backgroundColor: isUp ? '#10b981' : '#ef4444',
                opacity: 0.15,
                borderRadius: 1,
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: bar.h,
                opacity: [0.08, 0.2, 0.08],
              }}
              transition={{
                height: { duration: 0.5, delay: i * 0.03, ease: 'easeOut' },
                opacity: { duration: 1.8, delay: i * 0.05, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          );
        })}
      </div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: 'rgba(16,185,129,0.12)' }}
              animate={{ opacity: [0.1, 0.35, 0.1], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative flex items-center gap-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((ch, i) => (
                <motion.span
                  key={i}
                  className="relative select-none text-xs font-black tracking-[0.15em]"
                  style={{
                    color: '#10b981',
                    textShadow: '0 0 14px rgba(16,185,129,0.35)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: [0.3, 1, 0.3], y: 0 }}
                  transition={{
                    y: { duration: 0.35, delay: 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 1.4, delay: i * 0.1, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>
          </div>
          <motion.span
            className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Fetching live prices
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
