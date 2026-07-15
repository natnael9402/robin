'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BackButton({ href, className }: { href?: string; className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Go back"
      className={cn(
        'glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-foreground transition-transform active:scale-95 hover:scale-105',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}
