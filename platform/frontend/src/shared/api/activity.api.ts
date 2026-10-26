import { createHttpClient } from './httpClient';
import { config } from '../lib/config';

const http = createHttpClient(config.apiUrl);

export const activityApi = {
  appOpen: (body: { app?: string; path?: string; referrer?: string | null }) =>
    http.post<{ tracked: boolean }>('/activity/app-open', body, { skipAuth: true }),
};
