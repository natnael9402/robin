'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAdminNewsArticle } from '@/lib/api';
import { NewsForm } from '../_components/NewsForm';
import { SkeletonList } from '@/shared/components/ui/Skeleton';

export default function EditNewsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdminNewsArticle(id)
      .then((data) => {
        const a = data?.article ?? data;
        setArticle(a);
      })
      .catch((err) => setError(err.message || 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
          <SkeletonList rows={1} rowClassName="h-96" />
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
          <div className="rounded-2xl border border-destructive/30 bg-destructive-muted px-4 py-3 text-sm font-medium text-destructive">
            {error || 'Article not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <NewsForm
      defaultValues={{
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        author: 'PAXORA Premium',
        image_url: article.image_url || '',
        is_published: article.is_published ?? false,
        content: article.content || '',
      }}
      articleId={article.id}
      isEditing
    />
  );
}
