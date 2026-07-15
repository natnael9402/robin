'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Theme = 'light' | 'dark';

/** Reads the theme the no-flash script already applied to <html>. */
function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle({ className, label = false }: { className?: string; label?: boolean }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      className={cn(
        'group relative inline-flex items-center gap-2.5 rounded-full border border-glass-border bg-glass-bg',
        'px-3 py-2 text-sm font-semibold text-foreground transition-all duration-300',
        'hover:bg-surface-hover hover:shadow-glass active:scale-95',
        className
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
        <Sun
          size={18}
          className={cn(
            'absolute transition-all duration-300',
            mounted && isDark ? 'translate-y-6 opacity-0 rotate-90' : 'translate-y-0 opacity-100 rotate-0'
          )}
        />
        <Moon
          size={18}
          className={cn(
            'absolute transition-all duration-300',
            mounted && isDark ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-6 opacity-0 -rotate-90'
          )}
        />
      </span>
      {label && <span>{isDark ? 'Dark' : 'Light'}</span>}
    </button>
  );
}
