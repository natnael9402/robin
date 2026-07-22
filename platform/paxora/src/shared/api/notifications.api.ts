import { createHttpClient } from './httpClient';
import { config } from '../lib/config';

const http = createHttpClient(config.apiUrl);

export interface AppNotification {
  id: string;
  user_id: string;
  admin_id: string | null;
  title: string;
  message: string;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  admin?: { id: string; name: string; email: string } | null;
}

interface ListResponse {
  notifications: AppNotification[];
  unread_count: number;
}

interface UnreadCountResponse {
  count: number;
}

export const notificationApi = {
  list: () =>
    http.get<ListResponse>('/notifications'),

  getUnreadCount: () =>
    http.get<UnreadCountResponse>('/notifications/unread-count'),

  markRead: (id: string) =>
    http.post<void>(`/notifications/${id}/read`),

  markAllRead: () =>
    http.post<void>('/notifications/mark-all-read'),
};
