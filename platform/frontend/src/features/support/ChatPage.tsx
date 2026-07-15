'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Send,
  Headphones,
  Loader2,
  CheckCheck,
  Check,
  AlertCircle,
  MessageSquarePlus,
  ArrowLeft,
  Paperclip,
  FileText,
  ImageIcon,
  X,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { chatApi } from '../../shared/api';
import { Button } from '../../shared/components/ui/Button';
import type { SupportTicket, TicketMessage, TicketAttachment } from '../../shared/types';
import { cn } from '../../shared/lib/utils';
import { ApiError } from '../../shared/api/httpClient';
import { getGuestSessionId, isGuestMode } from '../../shared/lib/guest-session';
import { notifyHubspot } from '../../shared/lib/hubspot-notify';
import { useAuth } from '../../shared/contexts/AuthContext';

const POLL_INTERVAL = 8_000;
const MAX_FILES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const oneDay = 86_400_000;

  if (diff < oneDay && d.getDate() === now.getDate()) return 'Today';
  if (diff < 2 * oneDay) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupMessagesByDate(messages: TicketMessage[]) {
  const groups: { date: string; messages: TicketMessage[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

function AttachmentChips({ attachments }: { attachments: TicketAttachment[] }) {
  if (!attachments.length) return null;
  const images = attachments.filter((a) => a.mime.startsWith('image/'));
  const files = attachments.filter((a) => !a.mime.startsWith('image/'));
  return (
    <div className="mt-1.5 space-y-1">
      {images.map((a, i) => {
        const src = a.url || a.downloadUrl;
        return src ? (
          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-white/10">
            <img src={src} alt={a.name} className="max-h-32 w-auto object-cover" loading="lazy" />
          </a>
        ) : null;
      })}
      {files.map((a, i) => {
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

function MessageBubble({ msg, isOwn }: { msg: TicketMessage; isOwn: boolean }) {
  const senderName = isOwn ? undefined : msg.admin?.name || 'Support Agent';
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%] flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && senderName && (
          <span className="text-[9px] font-semibold text-primary ml-1 tracking-wide uppercase">
            {senderName}
          </span>
        )}
        <div
          className={cn(
            'px-3.5 py-2.5 text-sm leading-relaxed relative',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
              : 'bg-surface border border-border/50 rounded-2xl rounded-bl-sm'
          )}
        >
          {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}
          <AttachmentChips attachments={msg.attachments ?? []} />
        </div>
        <div className={cn('flex items-center gap-1 px-1', isOwn ? 'flex-row-reverse' : '')}>
          <span className="text-[9px] text-muted-foreground/60">{formatTime(msg.created_at)}</span>
          {isOwn && (
            msg.is_read
              ? <CheckCheck className="w-2.5 h-2.5 text-primary" />
              : <Check className="w-2.5 h-2.5 text-muted-foreground/40" />
          )}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
        {date}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function EmptyChat({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface/40 border border-border/50 flex items-center justify-center">
        <MessageSquarePlus className="w-7 h-7 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground mb-1">No conversations yet</h3>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Send us a message and our support team will respond shortly.
        </p>
      </div>
      <Button variant="primary" size="md" onClick={onStart}>
        Start a conversation
      </Button>
    </div>
  );
}

type ChatState = 'loading' | 'empty' | 'ready' | 'error';

export function ChatPage() {
  useDocumentTitle('Support · Paxora Capital');
  const router = useRouter();
  const { user } = useAuth();

  const guest = isGuestMode();
  const guestSessionId = guest ? getGuestSessionId() : null;
  const [state, setState] = useState<ChatState>('loading');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showStartInput, setShowStartInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' });
      }
    });
  }, []);

  const loadActiveTicket = useCallback(async () => {
    try {
      setState('loading');
      if (guest && guestSessionId) {
        const res = await chatApi.listGuestTickets(guestSessionId);
        const tickets = res.tickets?.data ?? [];
        const active = tickets.find((t) => t.status !== 'closed');
        if (active) {
          const detail = await chatApi.getGuestTicket(guestSessionId);
          const t = detail.ticket;
          setTicket(t);
          setMessages(t.messages ?? []);
          setState('ready');
        } else {
          setState('empty');
        }
      } else {
        const res = await chatApi.listTickets();
        const tickets = res.tickets?.data ?? [];
        const active = tickets.find((t) => t.status !== 'closed');
        if (active) {
          const detail = await chatApi.getTicket(active.id);
          const t = detail.ticket;
          setTicket(t);
          setMessages(t.messages ?? []);
          setState('ready');
        } else {
          setState('empty');
        }
      }
    } catch {
      setState('empty');
    }
  }, [guest, guestSessionId]);

  useEffect(() => { loadActiveTicket(); }, [loadActiveTicket]);

  useEffect(() => {
    if (!ticket || ticket.status === 'closed') return;
    const poll = async () => {
      try {
        if (guest && guestSessionId) {
          const detail = await chatApi.getGuestTicket(guestSessionId);
          const t = detail.ticket;
          setTicket(t);
          const newMsgs = t.messages ?? [];
          setMessages((prev) => {
            if (newMsgs.length !== prev.length) {
              setTimeout(() => scrollToBottom(true), 50);
            }
            return newMsgs;
          });
        } else {
          const detail = await chatApi.getTicket(ticket.id);
          const t = detail.ticket;
          setTicket(t);
          const newMsgs = t.messages ?? [];
          setMessages((prev) => {
            if (newMsgs.length !== prev.length) {
              setTimeout(() => scrollToBottom(true), 50);
            }
            return newMsgs;
          });
        }
      } catch { /* ignore */ }
    };
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [ticket?.id, ticket?.status, scrollToBottom, guest, guestSessionId]);

  useEffect(() => { scrollToBottom(false); }, [messages.length, scrollToBottom]);

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

  const createTicketAndSend = async (text: string, pendingFiles: File[] = []) => {
    setSending(true);
    setErrorMsg('');
    try {
      let res;
      if (guest && guestSessionId) {
        res = await chatApi.createGuestTicket(text, guestSessionId, pendingFiles.length ? pendingFiles : undefined);
      } else {
        res = pendingFiles.length
          ? await chatApi.createTicketWithAttachments(text, pendingFiles)
          : await chatApi.createTicket(text);
      }
      const t = res.ticket;
      setTicket(t);
      setMessages(t.messages ?? []);
      setState('ready');
      setInput('');
      setFiles([]);

      notifyHubspot({
        userName: user?.name || 'Guest',
        userEmail: user?.email || 'guest@system.paxora',
        message: text,
        subject: text,
        priority: 'medium',
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        await loadActiveTicket();
        setInput(text);
        setFiles(pendingFiles);
      } else {
        setErrorMsg('Failed to start conversation. Please try again.');
      }
    } finally { setSending(false); }
  };

  const sendReply = async (text: string, pendingFiles: File[] = []) => {
    if (!ticket) return;
    setSending(true);
    setErrorMsg('');

    const optimistic: TicketMessage = {
      id: Date.now(), ticket_id: ticket.id, user_id: ticket.user_id,
      admin_id: null, message: text || (pendingFiles.length ? `${pendingFiles.length} file(s)` : ''),
      is_read: false, attachments: [], created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setFiles([]);
    scrollToBottom(true);

    try {
      let res;
      if (guest && guestSessionId) {
        res = await chatApi.sendGuestMessage(ticket.id, text, guestSessionId, pendingFiles.length ? pendingFiles : undefined);
      } else {
        res = pendingFiles.length
          ? await chatApi.sendMessageWithAttachments(ticket.id, text, pendingFiles)
          : await chatApi.sendMessage(ticket.id, text);
      }
      const t = res.ticket;
      setTicket(t);
      setMessages(t.messages ?? []);

      notifyHubspot({
        userName: user?.name || 'Guest',
        userEmail: user?.email || 'guest@system.paxora',
        message: text,
        subject: ticket?.subject || text,
        priority: ticket?.priority || 'medium',
      });
    } catch {
      setErrorMsg('Failed to send. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
      setFiles(pendingFiles);
    } finally { setSending(false); }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text && files.length === 0) return;
    if (state === 'empty' || !ticket) createTicketAndSend(text || 'Sent an attachment', files);
    else sendReply(text || 'Sent an attachment', files);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStartChat = () => {
    setShowStartInput(true);
    setState('ready');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isOwnMessage = (msg: TicketMessage) => msg.admin_id === null;
  const grouped = groupMessagesByDate(messages);
  const showInput = (state === 'ready' || showStartInput) && ticket?.status !== 'closed';

  return (
    <div className="flex flex-col h-dvh md:h-screen md:max-w-2xl md:mx-auto w-full pb-24 md:pb-0">
      {/* Header */}
      <div className="shrink-0 px-4 pt-14 pb-2 md:pt-4 md:pb-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Headphones className="w-[18px] h-[18px] text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-foreground truncate">Live Support</h1>
            <p className="text-[11px] text-muted-foreground/70 truncate">
              {ticket
                ? ticket.status === 'closed'
                  ? 'This conversation has been closed'
                  : 'We typically reply in a few minutes'
                : 'Start a new conversation'}
            </p>
          </div>
          {ticket && (
            <span
              className={cn(
                'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                ticket.status === 'open' && 'bg-primary/15 text-primary',
                ticket.status === 'in_progress' && 'bg-warning/15 text-warning',
                ticket.status === 'closed' && 'bg-muted/30 text-muted-foreground'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  ticket.status === 'open' && 'bg-primary animate-pulse',
                  ticket.status === 'in_progress' && 'bg-warning animate-pulse',
                  ticket.status === 'closed' && 'bg-muted-foreground'
                )}
              />
              {ticket.status === 'in_progress' ? 'In Prog' : ticket.status}
            </span>
          )}
        </div>
      </div>

      {/* Guest mode banner */}
      {guest && (
        <div className="shrink-0 flex items-center gap-2 border-b border-border/30 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Chatting as guest · <a href="/signup" className="font-bold text-primary hover:underline">Sign up</a> to save history</span>
        </div>
      )}

      {/* Messages Area */}
      {state === 'loading' ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : state === 'empty' && !showStartInput ? (
        <EmptyChat onStart={handleStartChat} />
      ) : (
        <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0 overscroll-contain">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground/50 text-xs">
              Type your first message below
            </div>
          )}
          {grouped.map((group) => (
            <div key={group.date}>
              <DateDivider date={group.date} />
              <div className="space-y-2">
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isOwn={isOwnMessage(msg)} />
                ))}
              </div>
            </div>
          ))}
          <div ref={endRef} className="h-1" />
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="shrink-0 mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Input Area */}
      {showInput ? (
        <div className="shrink-0 px-3 pb-3 pt-1.5 md:pb-4 border-t border-border/30">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {files.map((f, i) => <FileChip key={i} file={f} onRemove={() => removeFile(i)} />)}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden"
              accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              title="Attach file">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={ticket ? 'Type a message...' : 'Describe your issue...'}
                className="w-full bg-surface border border-border/60 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                disabled={sending}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && files.length === 0) || sending}
              className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : ticket?.status === 'closed' ? (
        <div className="shrink-0 px-4 pb-3 pt-2 text-center border-t border-border/30">
          <p className="text-xs text-muted-foreground/60 mb-2">This conversation has been closed.</p>
          <Button variant="secondary" size="sm" onClick={async () => {
            setTicket(null); setMessages([]); setShowStartInput(true); setState('ready');
          }}>
            Start new conversation
          </Button>
        </div>
      ) : null}
    </div>
  );
}
