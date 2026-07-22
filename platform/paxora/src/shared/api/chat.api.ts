import { createHttpClient } from './httpClient';
import { config } from '../lib/config';
import type { SupportTicket, TicketMessage } from '../types';

const http = createHttpClient(config.apiUrl);

interface ListTicketsResponse {
  tickets: {
    data: SupportTicket[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  unread_count: number;
}

interface GetTicketResponse {
  ticket: SupportTicket;
}

interface CreateTicketResponse {
  ticket: SupportTicket;
  message: TicketMessage;
}

interface SendMessageResponse {
  message: TicketMessage;
  ticket: SupportTicket;
}

interface UnreadCountResponse {
  unread_count: number;
}

function buildTicketFormData(
  message: string,
  files: File[],
  extra?: { subject?: string; category?: string; priority?: string; guest_session_id?: string },
): FormData {
  const fd = new FormData();
  fd.append('message', message);
  if (extra?.subject) fd.append('subject', extra.subject);
  if (extra?.category) fd.append('category', extra.category);
  if (extra?.priority) fd.append('priority', extra.priority);
  if (extra?.guest_session_id) fd.append('guest_session_id', extra.guest_session_id);
  files.forEach((f, i) => fd.append(`attachments[${i}]`, f));
  return fd;
}

function buildMessageFormData(message: string, files: File[], guestSessionId?: string): FormData {
  const fd = new FormData();
  fd.append('message', message);
  if (guestSessionId) fd.append('guest_session_id', guestSessionId);
  files.forEach((f, i) => fd.append(`attachments[${i}]`, f));
  return fd;
}

export const chatApi = {
  /** List all support tickets for the authenticated user */
  listTickets: (status?: string) =>
    http.get<ListTicketsResponse>('/support-tickets', {
      query: status ? { status } : undefined,
    }),

  /** List tickets for a guest session */
  listGuestTickets: (guestSessionId: string, status?: string) =>
    http.get<ListTicketsResponse>('/support-tickets', {
      query: { guest_session_id: guestSessionId, ...(status ? { status } : {}) },
      skipAuth: true,
    }),

  /** Get a single ticket with all its messages */
  getTicket: (ticketId: number) =>
    http.get<GetTicketResponse>(`/support-tickets/${ticketId}`),

  /** Get a guest ticket by session ID */
  getGuestTicket: (guestSessionId: string) =>
    http.get<GetTicketResponse>('/support-tickets', {
      query: { guest_session_id: guestSessionId },
      skipAuth: true,
    }),

  /** Create a new support ticket (first message).
   * /ol requires `priority` (low|medium|high|urgent) and a non-empty category. */
  createTicket: (
    message: string,
    subject = 'Support Chat',
    category = 'account',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ) =>
    http.post<CreateTicketResponse>('/support-tickets', {
      subject,
      category,
      message,
      priority,
    }),

  /** Create a new support ticket with file attachments */
  createTicketWithAttachments: (
    message: string,
    files: File[],
    subject = 'Support Chat',
    category = 'account',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ) => {
    const fd = buildTicketFormData(message, files, { subject, category, priority });
    return http.post<CreateTicketResponse>('/support-tickets', fd);
  },

  /** Create a guest support ticket */
  createGuestTicket: (
    message: string,
    guestSessionId: string,
    files?: File[],
    subject = 'Support Chat',
    category = 'account',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ) => {
    if (files && files.length > 0) {
      const fd = buildTicketFormData(message, files, { subject, category, priority, guest_session_id: guestSessionId });
      return http.post<CreateTicketResponse>('/support-tickets', fd, { skipAuth: true });
    }
    return http.post<CreateTicketResponse>('/support-tickets', {
      subject, category, message, priority, guest_session_id: guestSessionId,
    }, { skipAuth: true });
  },

  /** Send a message to an existing ticket */
  sendMessage: (ticketId: number, message: string) =>
    http.post<SendMessageResponse>(`/support-tickets/${ticketId}/messages`, {
      message,
    }),

  /** Send a message with file attachments to an existing ticket */
  sendMessageWithAttachments: (ticketId: number, message: string, files: File[]) => {
    const fd = buildMessageFormData(message, files);
    return http.post<SendMessageResponse>(`/support-tickets/${ticketId}/messages`, fd);
  },

  /** Send a guest message */
  sendGuestMessage: (ticketId: number, message: string, guestSessionId: string, files?: File[]) => {
    if (files && files.length > 0) {
      const fd = buildMessageFormData(message, files, guestSessionId);
      return http.post<SendMessageResponse>(`/support-tickets/${ticketId}/messages`, fd, { skipAuth: true });
    }
    return http.post<SendMessageResponse>(`/support-tickets/${ticketId}/messages`, {
      message, guest_session_id: guestSessionId,
    }, { skipAuth: true });
  },

  /** Get unread message count */
  getUnreadCount: () =>
    http.get<UnreadCountResponse>('/support-tickets/messages/unread-count'),

  /** Mark messages as read */
  markAsRead: (ticketIds: number[]) =>
    http.post('/support-tickets/messages/mark-as-read', { ticketIds }),
};