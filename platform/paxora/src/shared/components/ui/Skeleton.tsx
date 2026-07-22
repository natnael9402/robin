import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-surface rounded-xl', className)} />;
}

export function SkeletonList({ rows = 3, rowClassName }: { rows?: number; rowClassName?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn('h-20', rowClassName)} />
      ))}
    </div>
  );
}
