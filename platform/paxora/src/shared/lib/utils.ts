import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | undefined | null, decimals = 2): string {
  const num = typeof value === 'string' ? Number(value) : Number(value);
  if (!Number.isFinite(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number | undefined, decimals = 2): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0.00';
  return Math.abs(num).toFixed(decimals);
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function initials(name: string | undefined, email: string | undefined): string {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.split('@')[0].charAt(0).toUpperCase();
  return 'U';
}

export function displayName(user: { name?: string; email?: string } | null | undefined): string {
  if (!user) return 'User';
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  return 'User';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCompact(value: number | string | undefined | null): string {
  const num = typeof value === 'string' ? Number(value) : value ?? 0;
  if (!Number.isFinite(num)) return '0';
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}
