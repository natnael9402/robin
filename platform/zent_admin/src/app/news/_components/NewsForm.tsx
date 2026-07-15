'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminNewsArticle, updateAdminNewsArticle, uploadNewsImage } from '@/lib/api';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { RichTextEditor } from '@/shared/components/ui/RichTextEditor';
import { ArrowLeft, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  image_url: string;
  is_published: boolean;
  content: string;
}

interface NewsFormProps {
  defaultValues?: Partial<NewsFormData>;
  articleId?: number;
  isEditing?: boolean;
}

export function NewsForm({ defaultValues, articleId, isEditing }: NewsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<NewsFormData>({
    title: defaultValues?.title || '',
    slug: defaultValues?.slug || '',
    excerpt: defaultValues?.excerpt || '',
    author: 'PAXORA Premium',
    image_url: defaultValues?.image_url || '',
    is_published: defaultValues?.is_published ?? false,
    content: defaultValues?.content || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const submitForm = async (data: NewsFormData) => {
    if (!data.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (isEditing && articleId) {
        await updateAdminNewsArticle(articleId, data);
      } else {
        await createAdminNewsArticle(data);
      }
      router.push('/news');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(form);
  };

  const handlePublishNow = () => {
    submitForm({ ...form, is_published: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadNewsImage(file);
      setForm({ ...form, image_url: url });
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to News
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing ? 'Update the article content and settings.' : 'Create a new news article.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive-muted px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full border border-border-medium bg-surface after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
              <span className="ml-3 text-sm font-semibold text-foreground">
                {form.is_published ? 'Published' : 'Draft'}
              </span>
            </label>
          </div>

          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Article headline"
            fullWidth
          />

          <Input
            label="Slug (leave blank to auto-generate)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="my-article-slug"
            fullWidth
          />

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short summary of the article..."
              rows={2}
              className="w-full rounded-2xl border border-border-light bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Content
            </label>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Write your article content here..."
              minHeight="400px"
            />
          </div>

          <div className="space-y-3">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Featured Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border-light bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-surface-hover">
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <span className="text-xs text-muted-foreground">or paste a URL</span>
            </div>
            <Input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              fullWidth
            />
          </div>

          {form.image_url && (
            <div className="overflow-hidden rounded-2xl border border-border-light">
              <img
                src={form.image_url}
                alt="Featured image preview"
                className="max-h-64 w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" loading={submitting} size="lg">
              {isEditing ? 'Update Article' : 'Create Article'}
            </Button>
            {isEditing && !form.is_published && (
              <Button variant="lime" size="lg" loading={submitting} onClick={handlePublishNow}>
                Publish Now
              </Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/news')} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
