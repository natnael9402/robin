'use client';

import { NewsArticle } from '../api/news.api';
import { Card } from '../../../shared/components/ui/Card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface NewsDetailProps {
  article: NewsArticle;
}

export function NewsDetail({ article }: NewsDetailProps) {
  return (
    <article className="max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        {article.image_url && (
          <div className="relative h-56 md:h-80">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 bg-primary/10 text-primary">
              {article.source === 'external' ? 'Crypto News' : 'Announcement'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(article.published_at)}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
            <span>By <strong className="text-foreground">{article.author}</strong></span>
          </div>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-6 border-l-4 border-primary/30 pl-4">
              {article.excerpt}
            </p>
          )}

          {article.content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-img:rounded-2xl prose-img:border prose-img:border-border-light"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-muted-foreground italic">No additional content available.</p>
          )}

          {article.source_url && (
            <div className="mt-8 pt-6 border-t border-border-light">
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                <ExternalLink size={14} />
                Read original article
              </a>
            </div>
          )}
        </div>
      </Card>
    </article>
  );
}
