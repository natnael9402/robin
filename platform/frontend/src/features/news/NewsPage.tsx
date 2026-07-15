'use client';

import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useNewsList } from './hooks/useNews';
import { NewsCard } from './components/NewsCard';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { PageHeader } from '../../shared/components/ui/PageHeader';

export function NewsPage() {
  useDocumentTitle('News · Paxora Capital');
  const { data, isLoading } = useNewsList({ limit: 50 });

  const articles = data?.items ?? [];

  const featured = articles[0];
  const rest = featured ? articles.slice(1) : articles;

  return (
    <div className="pb-24 md:pb-12 md:max-w-5xl md:mx-auto px-6 md:px-0">
      <div className="sticky top-0 z-10 pt-14 md:pt-8 bg-background pb-1 -mx-6 px-6 md:mx-0 md:px-0">
        <PageHeader title="Crypto News" subtitle="Latest news from the crypto world." className="mb-0" />
      </div>

      {isLoading ? (
        <SkeletonList rows={6} rowClassName="h-32" />
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm font-medium">No news articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featured && <NewsCard article={featured} featured />}
          {rest.map((article) => (
            <NewsCard key={article.slug || article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
