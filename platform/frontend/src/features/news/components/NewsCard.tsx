'use client';

import Link from 'next/link';
import { NewsArticle } from '../api/news.api';
import { Card } from '../../../shared/components/ui/Card';
import { cn } from '../../../shared/lib/utils';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export function NewsCard({ article, featured }: NewsCardProps) {
  return (
    <Link href={`/news/${article.slug}`}>
      <Card
        hover
        glow
        className={cn(
          'group overflow-hidden',
          featured ? 'md:col-span-2 md:row-span-2' : ''
        )}
      >
        {article.image_url && (
          <div className={cn(
            'relative overflow-hidden',
            featured ? 'h-48 md:h-64' : 'h-40'
          )}>
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5',
              article.source === 'external'
                ? 'bg-info-muted text-info'
                : 'bg-success-muted text-success'
            )}>
              {article.source === 'external' ? 'Crypto News' : 'PAXORA Premium'}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatDate(article.published_at)}
            </span>
          </div>
          <h3 className={cn(
            'font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2',
            featured ? 'text-xl md:text-2xl' : 'text-base'
          )}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className={cn(
              'mt-2 text-muted-foreground line-clamp-2',
              featured ? 'text-sm' : 'text-xs'
            )}>
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{article.author}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
