export const getImageUrl = (urlPath: string | undefined | null): string => {
  if (!urlPath) return '';
  if (/^(https?:)?\/\//i.test(urlPath) || urlPath.startsWith('data:')) return urlPath;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const base = apiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
  return `${base}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};