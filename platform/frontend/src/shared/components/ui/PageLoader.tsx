'use client';

import { motion } from 'framer-motion';
import { PaxoraMark } from './PaxoraMark';

/**
 * App-wide page loader — the animated PAXORA wordmark on the app background.
 * Used as the Next.js route-level Suspense fallback (loading.tsx) for every page,
 * and as the initial app-boot state, replacing per-page skeletons/spinners.
 *
 * Fills its container (the content slot inside the shell, or the full screen on
 * unauthenticated routes) and stays vertically centered.
 */
export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-[100dvh] w-full items-center justify-center bg-background"
    >
      <PaxoraMark size="lg" />
    </motion.div>
  );
}
