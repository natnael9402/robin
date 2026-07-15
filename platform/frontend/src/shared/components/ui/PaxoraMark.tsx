'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/** Dark-mode brand gold (matches --primary in dark theme). */
const PAXORA_GOLD = '#D4AF37';
const PAXORA_LETTERS = ['P', 'A', 'X', 'O', 'R', 'A'];

/**
 * Animated PAXORA wordmark. Each letter flips up with a staggered 3D entrance and
 * rides a continuous shimmer wave over a soft pulsing glow. Shared by the chart
 * loader and the app-wide page (Suspense) loader so the brand motion is consistent.
 */
export function PaxoraMark({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  const fontClass = size === 'lg' ? 'text-5xl md:text-7xl' : 'text-3xl md:text-4xl';
  return (
    <div
      className={cn('relative flex items-center', className)}
      style={{ letterSpacing: '0.3em', paddingLeft: '0.3em', perspective: 700 }}
    >
      {/* ambient pulsing glow behind the wordmark */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'rgba(212,175,55,0.16)' }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.82, 1.18, 0.82] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {PAXORA_LETTERS.map((ch, i) => (
        <motion.span
          key={i}
          className={cn('relative select-none font-black', fontClass)}
          style={{ color: PAXORA_GOLD, textShadow: '0 0 22px rgba(212,175,55,0.5), 0 0 2px rgba(212,175,55,0.85)' }}
          initial={{ opacity: 1, y: 20, rotateX: -90 }}
          animate={{ opacity: [1, 0.6, 1], y: 0, rotateX: 0 }}
          transition={{
            y: { duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
            rotateX: { duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 1.6, delay: i * 0.14, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}
