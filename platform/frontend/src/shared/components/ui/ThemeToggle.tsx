'use client';

import { useTheme } from '../../../shared/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "glass flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform active:scale-95",
        className
      )}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
