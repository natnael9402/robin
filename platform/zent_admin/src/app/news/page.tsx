'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminNews, deleteAdminNewsArticle, type NewsArticle } from '@/lib/api';
import { Plus, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Modal } from '@/shared/components/ui/Modal';
import { SkeletonList } from '@/shared/components/ui/Skeleton';
import { Table, type Column } from '@/shared/components/ui/Table';
import { formatDateTime, truncate } from '@/shared/lib/utils';

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = useCallback(() => {
    setLoading(true);
    getAdminNews({ limit: 100 })
      .then((data) => {
        const items = data?.items ?? data ?? [];
        setArticles(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to load articles');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminNewsArticle(deleteTarget.id);
      setDeleteTarget(null);
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<NewsArticle>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground max-w-[300px] truncate">
            {a.title}
          </span>
          {a.excerpt && (
            <span className="text-muted-foreground text-xs max-w-[300px] truncate">
              {truncate(a.excerpt, 80)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (a) => <span className="text-muted-foreground">{a.author}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      render: (a) => (
        <StatusBadge
          status={a.source === 'cryptopanic' ? 'info' : a.is_published ? 'success' : 'warning'}
          size="xs"
        >
          {a.source === 'cryptopanic' ? 'CryptoPanic' : a.is_published ? 'Published' : 'Draft'}
        </StatusBadge>
      ),
    },
    {
      key: 'published_at',
      header: 'Date',
      render: (a) => (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDateTime(a.published_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/news/${a.id}`); }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(a); }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive-muted"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
        <PageHeader
          title="News"
          subtitle="Manage news articles — create, edit, and publish content."
          action={
            <Button onClick={() => router.push('/news/create')} leftIcon={<Plus size={16} />} size="sm">
              New Article
            </Button>
          }
        />

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles..."
            className="pl-10 pr-4 py-2.5 text-sm w-full"
            fullWidth
          />
        </div>

        {loading ? (
          <SkeletonList rows={5} rowClassName="h-16" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ExternalLink className="mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No articles found.</p>
            <Button variant="ghost" size="sm" onClick={() => router.push('/news/create')} className="mt-2">
              Create your first article
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            </p>

            <div className="hidden md:block">
              <Table
                columns={columns}
                data={filtered}
                keyExtractor={(a) => a.id}
                loading={false}
                emptyState="No articles found."
                onRowClick={(a) => router.push(`/news/${a.id}`)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="bg-surface p-5 rounded-2xl border border-border-light shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => router.push(`/news/${a.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="font-bold text-foreground text-base truncate">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.author} &middot; {formatDateTime(a.published_at)}
                      </p>
                    </div>
                    <StatusBadge
                      status={a.source === 'cryptopanic' ? 'info' : a.is_published ? 'success' : 'warning'}
                      size="xs"
                    >
                      {a.source === 'cryptopanic' ? 'CryptoPanic' : a.is_published ? 'Published' : 'Draft'}
                    </StatusBadge>
                  </div>
                  {a.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Article"
        size="sm"
        description={
          deleteTarget ? (
            <>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
            </>
          ) : undefined
        }
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete this article. Are you sure?
        </p>
      </Modal>
    </div>
  );
}
