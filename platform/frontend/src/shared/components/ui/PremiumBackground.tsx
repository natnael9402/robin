'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

// Pseudo-random generator for SSR-safe hydration
const random = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

function PremiumBackgroundBase() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Deep ambient glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-200/30 dark:bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-amber-200/30 dark:bg-primary/10 blur-[150px]" />

      {/* 
        The "Astrolabe" - Complex Magical Rings 
        Positioned dynamically to fill the background elegantly.
      */}
      <div className="absolute top-[10%] right-[-15%] w-[100vw] max-w-[800px] aspect-square opacity-60 dark:opacity-100">
        
        {/* Outer sweeping gradient ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-amber-300/40 dark:border-primary/20"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(212, 175, 55, 0.05) 50%, transparent 100%)',
            maskImage: 'radial-gradient(transparent 65%, black 66%)',
            WebkitMaskImage: 'radial-gradient(transparent 65%, black 66%)'
          }}
        />

        {/* Middle dashed ring rotating counter-clockwise */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[10%] rounded-full border-[1.5px] border-dashed border-amber-300/50 dark:border-primary/50 shadow-[0_0_30px_-5px_var(--primary-glow)]"
        />

        {/* Inner dotted tracking ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[22%] rounded-full border border-dotted border-amber-400/50 dark:border-primary/70"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        />

        {/* Core glowing aura */}
        <div className="absolute inset-[35%] rounded-full bg-amber-200/40 dark:bg-primary/5 blur-3xl shadow-[0_0_80px_var(--primary-glow)]" />
      </div>

      {/* Secondary abstract arc on the bottom left */}
      <motion.div
        animate={{ rotate: 180 }}
        transition={{ duration: 250, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-30%] left-[-20%] w-[120vw] max-w-[900px] aspect-square rounded-full border-2 border-amber-200/30 dark:border-primary/20"
        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
      />

      {/* 
        Sparkles / Particles 
        Using completely hardcoded values to guarantee 100% hydration match across all environments.
      */}
      <div className="absolute inset-0">
        {[
          { top: 12.34, left: 88.21, scale: 0.85, dur: 5.2, del: 0.4 },
          { top: 54.12, left: 23.45, scale: 0.62, dur: 4.1, del: 1.2 },
          { top: 32.88, left: 45.67, scale: 0.91, dur: 6.3, del: 0.8 },
          { top: 8.45, left: 12.34, scale: 0.55, dur: 3.8, del: 1.5 },
          { top: 62.11, left: 76.89, scale: 0.77, dur: 5.5, del: 0.2 },
          { top: 25.67, left: 56.78, scale: 0.95, dur: 6.8, del: 1.8 },
          { top: 41.22, left: 8.91, scale: 0.48, dur: 3.4, del: 0.6 },
          { top: 18.99, left: 91.23, scale: 0.82, dur: 4.9, del: 1.1 },
          { top: 59.45, left: 34.56, scale: 0.68, dur: 5.7, del: 0.9 },
          { top: 37.12, left: 67.89, scale: 0.74, dur: 4.5, del: 1.6 },
          { top: 15.67, left: 43.21, scale: 0.88, dur: 6.1, del: 0.3 },
          { top: 48.34, left: 82.15, scale: 0.51, dur: 3.9, del: 1.4 },
          { top: 29.81, left: 18.76, scale: 0.93, dur: 5.4, del: 0.7 },
          { top: 51.56, left: 59.32, scale: 0.64, dur: 4.2, del: 1.9 },
          { top: 22.33, left: 71.45, scale: 0.79, dur: 6.6, del: 0.5 },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-primary shadow-[0_0_12px_var(--primary-glow)]"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              scale: s.scale,
            }}
            animate={{
              opacity: [0.1, 1, 0.1],
              scale: [s.scale, s.scale * 1.5, s.scale],
            }}
            transition={{
              duration: s.dur,
              repeat: Infinity,
              delay: s.del,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const PremiumBackground = memo(PremiumBackgroundBase);
