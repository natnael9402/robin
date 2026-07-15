'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Headphones, CheckCheck, Loader2, MessageSquarePlus, Clock, ImageIcon } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { notificationApi, chatApi } from '../../shared/api';
import { Button } from '../../shared/components/ui/Button';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { Modal } from '../../shared/components/ui/Modal';
import type { AppNotification } from '../../shared/api/notifications.api';
import type { SupportTicket } from '../../shared/types';
import { cn } from '../../shared/lib/utils';

const POLL_INTERVAL = 8_000;

function fmtTime(s: string) {
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 86_400_000;

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 2 * oneDay) return 'Yesterday';
  if (diff < 7 * oneDay) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

type Tab = 'notifications' | 'support';

export function LiveChatPage() {
  useDocumentTitle('Notifications · Paxora Capital');
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('notifications');

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

  // Support state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [supportLoading, setSupportLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res.notifications ?? []);
      setUnreadCount(res.unread_count ?? 0);
    } catch { /* ignore */ }
    setNotifLoading(false);
  }, []);

  const loadSupport = useCallback(async () => {
    try {
      const res = await chatApi.listTickets();
      setTickets(res.tickets?.data ?? []);
    } catch { /* ignore */ }
    setSupportLoading(false);
  }, []);

  useEffect(() => {
    setNotifLoading(true);
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setSupportLoading(true);
    loadSupport();
  }, [loadSupport]);

  // Poll new data
  useEffect(() => {
    if (tab === 'notifications') {
      const id = setInterval(loadNotifications, POLL_INTERVAL);
      return () => clearInterval(id);
    }
  }, [tab, loadNotifications]);

  useEffect(() => {
    if (tab === 'support') {
      const id = setInterval(loadSupport, POLL_INTERVAL);
      return () => clearInterval(id);
    }
  }, [tab, loadSupport]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleOpenNotification = (n: AppNotification) => {
    setSelectedNotif(n);
    if (!n.is_read) handleMarkRead(n.id);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pt-20 pb-24 md:max-w-2xl md:mx-auto w-full">
      {/* Header */}
      <div className="px-6 mb-2">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              Notifications
            </span>
          }
          subtitle="Stay updated with your account activity"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 mb-4">
        <button
          onClick={() => setTab('notifications')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all',
            tab === 'notifications'
              ? 'bg-primary text-primary-foreground shadow-[0_0_16px_var(--primary-glow)]'
              : 'bg-surface/40 text-muted-foreground hover:text-foreground border border-white/5',
          )}
        >
          <Bell className="w-3.5 h-3.5" />
          Notifications
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('support')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all',
            tab === 'support'
              ? 'bg-primary text-primary-foreground shadow-[0_0_16px_var(--primary-glow)]'
              : 'bg-surface/40 text-muted-foreground hover:text-foreground border border-white/5',
          )}
        >
          <Headphones className="w-3.5 h-3.5" />
          Support
        </button>
      </div>

      {/* Mark all read button */}
      {tab === 'notifications' && unreadCount > 0 && (
        <div className="px-6 mb-3">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications list */}
      {tab === 'notifications' && (
        <div className="flex-1 px-6 space-y-1.5">
          {notifLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface/40 border border-white/5 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">No notifications yet</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleOpenNotification(n)}
                className={cn(
                  'w-full text-left rounded-2xl px-4 py-3.5 transition-all border',
                  n.is_read
                    ? 'bg-surface/20 border-transparent'
                    : 'bg-primary/5 border-primary/20 hover:bg-primary/10',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                      )}
                      <h4 className={cn(
                        'text-sm truncate',
                        n.is_read ? 'text-foreground/70 font-semibold' : 'text-foreground font-bold',
                      )}>
                        {n.title}
                      </h4>
                    </div>
                    <p className={cn(
                      'text-xs mt-1 line-clamp-2',
                      n.is_read ? 'text-muted-foreground/60' : 'text-muted-foreground',
                    )}>
                      {n.message}
                    </p>
                    {n.image_url && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <ImageIcon className="w-3 h-3 text-primary/60" />
                        <span className="text-[10px] text-primary/60 font-medium">Image attached</span>
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground/50 mt-1.5 block">
                      {fmtTime(n.created_at)}
                    </span>
                  </div>
                  {n.image_url ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 mt-0.5 border border-border-light">
                      <img src={n.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : !n.is_read ? (
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCheck className="w-3 h-3 text-primary" />
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Support tickets */}
      {tab === 'support' && (
        <div className="flex-1 px-6 space-y-2">
          {supportLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface/40 border border-white/5 flex items-center justify-center mb-4">
                <MessageSquarePlus className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">No support tickets</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
                Start a conversation with our support team
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/support/chat')}
              >
                <Headphones className="w-3.5 h-3.5 mr-1.5" />
                Open Live Support
              </Button>
            </div>
          ) : (
            tickets.map((t) => {
              const lastMsg = t.latest_message || t.messages?.[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => router.push(`/support/chat`)}
                  className="w-full text-left rounded-2xl px-4 py-3.5 bg-surface/20 border border-white/5 hover:bg-surface/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {t.subject}
                        </h4>
                        <span
                          className={cn(
                            'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                            t.status === 'open' && 'bg-primary/15 text-primary',
                            t.status === 'in_progress' && 'bg-warning/15 text-warning',
                            t.status === 'closed' && 'bg-muted text-muted-foreground',
                          )}
                        >
                          {t.status === 'in_progress' ? 'In Prog' : t.status}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {lastMsg.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground/50">
                          #{t.id}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <span className="text-[10px] text-muted-foreground/50 capitalize">
                          {t.category}
                        </span>
                        {t.created_at && (
                          <>
                            <span className="text-[10px] text-muted-foreground/50">·</span>
                            <span className="text-[10px] text-muted-foreground/50">
                              {fmtTime(t.created_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
      {/* Notification detail modal */}
      <Modal open={!!selectedNotif} onClose={() => setSelectedNotif(null)} size="lg">
        {selectedNotif && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-border-light">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground leading-snug">{selectedNotif.title}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/70">
                  <Clock className="w-3 h-3" />
                  {new Date(selectedNotif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span>·</span>
                  {new Date(selectedNotif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {selectedNotif.image_url && (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border-light">
                  <img src={selectedNotif.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Message body */}
            <div className="bg-surface/40 rounded-2xl border border-border-light p-5">
              <p className="text-sm text-foreground/85 leading-[1.75] whitespace-pre-wrap">{selectedNotif.message}</p>
            </div>

            {selectedNotif.image_url && (
              <div className="rounded-2xl overflow-hidden border border-border-light shadow-glass">
                <img src={selectedNotif.image_url} alt={selectedNotif.title} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground/50">
                {selectedNotif.is_read ? 'Read' : 'Unread'}
              </span>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
