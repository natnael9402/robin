import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
}

export function StatCard({ label, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3">
          <Icon className="h-5 w-5 text-zinc-900 dark:text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`text-sm font-medium ${
            trend === 'up'
              ? 'text-green-600 dark:text-green-400'
              : trend === 'down'
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">vs last month</span>
      </div>
    </div>
  );
}
