import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, action, backHref, className }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className={cn('mb-6 md:mb-8', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {backHref !== undefined && (
            <button
              onClick={() => (backHref ? router.push(backHref) : router.back())}
              aria-label="Go back"
              className="shrink-0 group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-surface/60 text-foreground backdrop-blur-xl shadow-md transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-90"
            >
              <ArrowLeft className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-1 md:mb-2 tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wider">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
