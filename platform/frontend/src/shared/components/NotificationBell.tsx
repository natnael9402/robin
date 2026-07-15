'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { notificationApi } from '../api';
import { cn } from '../lib/utils';

function useModalOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setOpen(document.body.classList.contains('modal-open'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return open;
}

const POLL_OPEN = 6_000;
const POLL_IDLE = 30_000;

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const modalOpen = useModalOpen();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setCount(Number(res?.count ?? 0) || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pathname === '/apps/live-chat' ? POLL_OPEN : POLL_IDLE);
    return () => clearInterval(id);
  }, [refresh, pathname]);

  if (modalOpen) return null;

  return (
    <button
      onClick={() => router.push('/apps/live-chat')}
      className={cn(
        'glass relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-transform active:scale-95',
        className
      )}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white ring-2 ring-background shadow-[0_0_8px_rgba(239,68,68,0.5)]">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
