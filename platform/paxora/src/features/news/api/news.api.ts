import { createHttpClient } from '../../../shared/api/httpClient';
import { config } from '../../../shared/lib/config';

const http = createHttpClient(config.apiUrl);

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string;
  source: string;
  source_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export const newsApi = {
  list: (params?: { page?: number; limit?: number; source?: string }) =>
    http.get<{ items: NewsArticle[]; total: number }>('/news', { query: params as any }),

  getBySlug: (slug: string) =>
    http.get<{ article: NewsArticle }>(`/news/${slug}`),
};
