type TokenProvider = () => string | null;

let tokenProvider: TokenProvider = () => null;

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  timeoutMs?: number;
}

function buildUrl(base: string, path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function extractData(data: unknown): unknown {
  if (data && typeof data === 'object' && 'status' in data && data.status === 'success' && 'data' in data) {
    return (data as { data: unknown }).data;
  }
  return data;
}

async function request<T>(base: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, skipAuth, timeoutMs = 30_000, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string> | undefined),
  };

  // For multipart/form-data the browser must set the Content-Type itself so it can
  // include the boundary. Strip any caller-provided value that would override it.
  if (isFormData) {
    delete finalHeaders['Content-Type'];
    delete finalHeaders['content-type'];
  }

  if (!skipAuth) {
    const token = tokenProvider();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timed out')), timeoutMs);

  try {
    const res = await fetch(buildUrl(base, path, query), {
      ...rest,
      cache: 'default',
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    const data = text ? safeParse(text) : null;

    if (!res.ok) {
      console.error('HTTP Error:', res.status, JSON.stringify(data, null, 2));
      const message =
        (data && typeof data === 'object' && 'message' in data && (data as { message?: string }).message) ||
        (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) ||
        res.statusText ||
        `Error ${res.status}`;
      throw new ApiError(String(message), res.status);
    }
    return extractData(data) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function createHttpClient(baseUrl: string) {
  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(baseUrl, path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(baseUrl, path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(baseUrl, path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(baseUrl, path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>(baseUrl, path, { ...options, method: 'DELETE' }),
  };
}