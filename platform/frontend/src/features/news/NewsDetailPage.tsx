'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useNewsArticle } from './hooks/useNews';
import { NewsDetail } from './components/NewsDetail';
import { PageLoader } from '../../shared/components/ui/PageLoader';

export function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, isLoading, error } = useNewsArticle(slug);

  if (isLoading) return <PageLoader />;

  if (error || !data?.article) {
    return (
      <div className="pb-24 md:pb-12 md:max-w-3xl md:mx-auto px-6 pt-16 md:pt-10 md:px-0">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          Article not found.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 md:max-w-5xl md:mx-auto px-6 md:px-0">
      <div className="sticky top-0 z-10 pt-14 md:pt-8 bg-background pb-1 -mx-6 px-6 md:mx-0 md:px-0">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to News
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-2">
        <NewsDetail article={data.article} />
      </div>
    </div>
  );
}
