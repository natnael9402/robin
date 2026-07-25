'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useNewsList } from './hooks/useNews';
import { NewsCard } from './components/NewsCard';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { PageHeader } from '../../shared/components/ui/PageHeader';

export function NewsPage() {
  useDocumentTitle('News · Paxora Capital');
  const { data, isLoading, refetch } = useNewsList({ limit: 50 });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const articles = data?.items ?? [];

  const featured = articles[0];
  const rest = featured ? articles.slice(1) : articles;

  return (
    <div className="pb-24 md:pb-12 md:max-w-5xl md:mx-auto px-6 md:px-0">
      <div className="sticky top-0 z-10 pt-14 md:pt-8 bg-background pb-1 -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex items-start justify-between">
          <PageHeader title="Crypto News" subtitle="Latest news from the crypto world." className="mb-0" />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh news"
            className="mt-14 md:mt-8 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground/60 transition-all hover:bg-primary/10 hover:text-primary disabled:pointer-events-none"
          >
            <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
            <RefreshCw className={`h-4 w-4 transition-transform ${refreshing ? 's' : ''}`} />
          </button>
        </div>
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
