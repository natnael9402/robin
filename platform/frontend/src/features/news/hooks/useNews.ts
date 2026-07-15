import { useQuery } from '@tanstack/react-query';
import { newsApi } from '../api/news.api';
import { config } from '../../../shared/lib/config';

export function useNewsList(params?: { page?: number; limit?: number; source?: string }) {
  return useQuery({
    queryKey: ['news', 'list', params],
    queryFn: () => newsApi.list(params),
    staleTime: config.staleTime * 10,
    gcTime: config.gcTime,
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ['news', 'article', slug],
    queryFn: () => newsApi.getBySlug(slug),
    staleTime: config.staleTime * 20,
    gcTime: config.gcTime,
    enabled: !!slug,
  });
}
