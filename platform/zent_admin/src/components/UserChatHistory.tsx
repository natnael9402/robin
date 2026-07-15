'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, ArrowUpRight, Paperclip, FileText, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { getSupportTickets, getSupportTicket, sendSupportMessage } from '@/lib/api';
import { formatDateTime } from '@/shared/lib/utils';

const senderOf = (m: any): 'admin' | 'user' =>
  m?.sender === 'admin' || m?.sender === 'user'
    ? m.sender
    : (m?.adminId ?? m?.admin_id) ? 'admin' : 'user';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

interface UserChatHistoryProps {
  userId: number;
  userName?: string;
}

interface ChatMessage {
  id: number | string;
  message: string;
  sender: string;
  createdAt: string;
  attachments?: any[];
}

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

export function UserChatHistory({ userId, userName }: UserChatHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  const resolveTicket = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const tickets = await getSupportTickets();
      const match = tickets.find((t: any) => t.user?.id === userId);
      const tid = match?.id ?? null;
      setTicketId(tid);

      if (tid) {
        const full = await getSupportTicket(tid);
        const msgs = Array.isArray(full?.messages) ? full.messages : [];
        setMessages(msgs);
        scrollToBottom();
      } else {
        setMessages([]);
      }
    } catch {
      // keep state on transient errors
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [userId, scrollToBottom]);

  const pollMessages = useCallback(async () => {
    if (!ticketId) return;
    try {
      const full = await getSupportTicket(ticketId);
      const msgs = Array.isArray(full?.messages) ? full.messages : [];
      setMessages((prev) => {
        if (prev.length !== msgs.length) scrollToBottom();
        return msgs.length ? msgs : prev;
      });
    } catch {
      // keep existing messages
    }
  }, [ticketId, scrollToBottom]);

  useEffect(() => {
    resolveTicket(true);
    const interval = setInterval(() => resolveTicket(false), 4000);
    return () => clearInterval(interval);
  }, [resolveTicket]);

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
    if ((!text && files.length === 0) || sending || !ticketId) return;
    setSending(true);

    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      message: text || (files.length ? `${files.length} file(s)` : ''),
      sender: 'admin',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setMsg('');
    const pendingFiles = [...files];
    setFiles([]);
    scrollToBottom();

    try {
      await sendSupportMessage(ticketId, text || 'Sent an attachment', pendingFiles.length ? pendingFiles : undefined);
      await pollMessages();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setMsg(text);
      setFiles(pendingFiles);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass flex h-full min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-glass-border shadow-glass">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
            <MessageCircle size={16} />
          </span>
          Communication
        </h3>
        <Link
          href="/chat"
          className="flex items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          Open Inbox <ArrowUpRight size={12} />
        </Link>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-surface-hover" />
            <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-surface-hover" />
            <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-surface-hover" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <MessageCircle size={32} className="mb-2 text-subtle-foreground opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            {ticketId ? (
              <p className="text-xs text-subtle-foreground">Send the first message to {userName || 'this user'}.</p>
            ) : (
              <p className="text-xs text-subtle-foreground">This user hasn't created a support ticket yet.</p>
            )}
          </div>
        ) : (
          messages.map((m) => {
            const isAdmin = senderOf(m) === 'admin';
            return (
              <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-glass ${
                    isAdmin
                      ? 'rounded-tr-sm bg-foreground text-background'
                      : 'rounded-tl-sm bg-surface-hover text-foreground'
                  }`}
                >
                  {m.message && <p className="whitespace-pre-wrap break-words">{m.message}</p>}
                  <AttachmentChips attachments={m.attachments ?? []} />
                  <div className={`mt-1 text-[10px] opacity-60 ${isAdmin ? 'text-right' : 'text-left'}`}>
                    {formatDateTime(m.createdAt, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {ticketId && (
        <div className="border-t border-border-light p-3">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {files.map((f, i) => <FileChip key={i} file={f} onRemove={() => removeFile(i)} />)}
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden"
              accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              title="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a reply…"
              className="flex-1 rounded-xl border border-border-medium bg-surface px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={(!msg.trim() && files.length === 0) || sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
