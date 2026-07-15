'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, User, ChevronLeft, Loader2, Paperclip, FileText, ImageIcon, X } from 'lucide-react';
import { getSupportTickets, getSupportTicket, sendSupportMessage, markSupportRead } from '@/lib/api';
import { StatusBadge, type StatusType } from '@/shared/components/ui/StatusBadge';
import { formatDate, formatDateTime } from '@/shared/lib/utils';

const isAdminMsg = (m: any): boolean => (m?.adminId ?? m?.admin_id) != null;

const MAX_FILES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

interface Ticket {
  id: number;
  subject?: string;
  status?: string;
  category?: string;
  user?: { id: number; name?: string; email?: string };
  latestMessage?: any;
  lastReplyAt?: string;
  createdAt?: string;
}

const statusMap: Record<string, StatusType> = {
  open: 'approved', in_progress: 'pending', pending: 'pending', closed: 'rejected',
};

function AttachmentChips({ attachments }: { attachments: any[] }) {
  if (!attachments?.length) return null;
  const images = attachments.filter((a: any) => a.mime?.startsWith('image/'));
  const files = attachments.filter((a: any) => !a.mime?.startsWith('image/'));
  return (
    <div className="mt-1.5 space-y-1">
      {images.map((a: any, i: number) => {
        const src = a.url || a.downloadUrl;
        return src ? (
          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-white/10">
            <img src={src} alt={a.name} className="max-h-32 w-auto object-cover" loading="lazy" />
          </a>
        ) : null;
      })}
      {files.map((a: any, i: number) => {
        const href = a.url || a.downloadUrl;
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-foreground/80 transition-colors hover:bg-white/10">
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{a.name}</span>
            <span className="ml-auto shrink-0 text-[10px] opacity-50">{(a.size / 1024).toFixed(0)}KB</span>
          </a>
        );
      })}
    </div>
  );
}

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-foreground/80">
      {isImage && preview ? (
        <img src={preview} alt={file.name} className="h-6 w-6 shrink-0 rounded object-cover" />
      ) : isImage ? (
        <ImageIcon className="h-3 w-3 shrink-0 text-primary" />
      ) : (
        <FileText className="h-3 w-3 shrink-0 text-primary" />
      )}
      <span className="max-w-[100px] truncate">{file.name}</span>
      <button type="button" onClick={onRemove} className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export default function AdminChatPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const selectedRef = useRef<Ticket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
  }, []);

  const fetchTickets = useCallback(async (spinner = false) => {
    if (spinner) setLoadingList(true);
    try {
      const list = await getSupportTickets();
      setTickets(list);
    } catch (e) {
      console.error(e);
    } finally {
      if (spinner) setLoadingList(false);
    }
  }, []);

  const openTicket = useCallback(async (t: Ticket, spinner = true) => {
    setSelected(t);
    if (spinner) setLoadingThread(true);
    try {
      const full = await getSupportTicket(t.id);
      const msgs = Array.isArray(full?.messages) ? full.messages : [];
      setMessages(msgs);
      scrollToBottom();
      const unreadIds = msgs.filter((m: any) => !isAdminMsg(m) && !(m.isRead ?? m.is_read)).map((m: any) => m.id);
      if (unreadIds.length) markSupportRead(unreadIds).then(() => fetchTickets(false));
    } catch (e) {
      console.error(e);
      setMessages([]);
    } finally {
      if (spinner) setLoadingThread(false);
    }
  }, [scrollToBottom, fetchTickets]);

  useEffect(() => {
    fetchTickets(true);
    const id = setInterval(() => {
      fetchTickets(false);
      const cur = selectedRef.current;
      if (cur) {
        getSupportTicket(cur.id)
          .then((full) => {
            const msgs = Array.isArray(full?.messages) ? full.messages : [];
            setMessages((prev) => { if (msgs.length !== prev.length) scrollToBottom(); return msgs.length ? msgs : prev; });
          })
          .catch(() => {});
      }
    }, 5000);
    return () => clearInterval(id);
  }, [fetchTickets, scrollToBottom]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => {
      if (!ALLOWED_TYPES.has(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = msg.trim();
    if ((!text && files.length === 0) || !selected || sending) return;
    setSending(true);
    const optimistic = { id: `tmp-${Date.now()}`, message: text || (files.length ? `${files.length} file(s)` : ''), adminId: 1, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setMsg('');
    const pendingFiles = [...files];
    setFiles([]);
    scrollToBottom();
    try {
      await sendSupportMessage(selected.id, text || 'Sent an attachment', pendingFiles.length ? pendingFiles : undefined);
      const full = await getSupportTicket(selected.id);
      setMessages(Array.isArray(full?.messages) ? full.messages : []);
      fetchTickets(false);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setMsg(text);
      setFiles(pendingFiles);
    } finally {
      setSending(false);
    }
  };

  const ticketName = (t: Ticket) => {
    const isGuest = t.user?.email === 'guest@system.paxora';
    if (isGuest) {
      const sid = t.subject?.match(/\[guest:([^\]]+)\]/)?.[1];
      return `Guest${sid ? ` (${sid.slice(0, 8)}…)` : ''}`;
    }
    return t.user?.name || t.user?.email || `User #${t.user?.id ?? '?'}`;
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <main className="container relative mx-auto flex flex-1 gap-6 overflow-hidden p-4 lg:p-6">
        {/* Inbox */}
        <div className={`absolute inset-0 z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-border-light bg-surface shadow-sm md:static md:z-0 md:flex md:w-80 lg:w-96 ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between border-b border-border-light p-4">
            <h2 className="text-lg font-bold text-foreground">Support Inbox</h2>
            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-bold text-muted-foreground">{tickets.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No support tickets yet</div>
            ) : (
              tickets.map((t) => {
                const unread = !!t.latestMessage && !isAdminMsg(t.latestMessage) && !(t.latestMessage.isRead ?? t.latestMessage.is_read);
                return (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t)}
                    className={`flex w-full gap-3 border-b border-border-light p-4 text-left transition-colors hover:bg-surface-hover ${selected?.id === t.id ? 'bg-surface-hover' : ''}`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <User className="h-5 w-5 text-muted-foreground" />
                      {unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-surface" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-baseline justify-between gap-2">
                        <span className={`truncate text-sm ${unread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{ticketName(t)}</span>
                        {t.user?.email === 'guest@system.paxora' && (
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase">Guest</span>
                        )}
                        <span className="shrink-0 text-[10px] text-muted-foreground">{t.lastReplyAt ? formatDate(t.lastReplyAt) : ''}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{t.latestMessage?.message || t.subject || 'No messages'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={`absolute inset-0 z-20 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border-light bg-surface shadow-sm md:static md:z-0 md:flex ${selected ? 'flex' : 'hidden md:flex'}`}>
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-border-light bg-surface-hover/50 p-4">
                <button onClick={() => setSelected(null)} className="-ml-2 p-2 text-muted-foreground hover:text-foreground md:hidden"><ChevronLeft size={20} /></button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {ticketName(selected).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-foreground">{ticketName(selected)}</h3>
                  <p className="truncate text-xs text-muted-foreground">{selected.user?.email || selected.subject}</p>
                </div>
                {selected.status && <StatusBadge status={statusMap[selected.status] || 'pending'} size="xs">{selected.status.replace('_', ' ')}</StatusBadge>}
              </div>

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {loadingThread ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageCircle size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">No messages in this ticket</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const admin = isAdminMsg(m);
                    return (
                      <div key={m.id} className={`flex ${admin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm md:max-w-[70%] ${admin ? 'rounded-tr-none bg-foreground text-background' : 'rounded-tl-none bg-surface-hover text-foreground'}`}>
                          {m.message && <p className="whitespace-pre-wrap break-words">{m.message}</p>}
                          <AttachmentChips attachments={m.attachments ?? []} />
                          <div className={`mt-1.5 text-[10px] opacity-60 ${admin ? 'text-right' : 'text-left'}`}>
                            {formatDateTime(m.createdAt ?? m.created_at, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-border-light bg-surface-hover/50 p-4 md:gap-3">
                {files.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {files.map((f, i) => <FileChip key={i} file={f} onRemove={() => removeFile(i)} />)}
                  </div>
                )}
                <form onSubmit={handleSend} className="flex gap-2 md:gap-3">
                  <input ref={fileInputRef} type="file" multiple className="hidden"
                    accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    title="Attach file">
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a reply…"
                    className="flex-1 rounded-xl border border-border-medium bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="submit" disabled={(!msg.trim() && files.length === 0) || sending} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:bg-primary-hover disabled:opacity-50">
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageCircle size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm opacity-60">Choose a ticket from the inbox to reply</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
