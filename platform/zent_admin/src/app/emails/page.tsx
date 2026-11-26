'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  Mail,
  MailCheck,
  Monitor,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  getUsers,
  getEmailCampaigns,
  getEmailCampaign,
  previewEmailCampaign,
  sendEmailCampaign,
  sendTestEmail,
  nudgeUnverifiedEmails,
  type EmailCampaign,
} from '@/lib/api';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { RichTextEditor } from '@/shared/components/ui/RichTextEditor';
import { cn, formatDate } from '@/shared/lib/utils';

interface Recipient {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  emailVerifiedAt?: string | null;
  signupSite?: string | null;
  createdAt?: string;
}

type Segment = 'selected' | 'all' | 'verified' | 'unverified';
type SiteChoice = 'auto' | 'premium' | 'lab';
type Toast = { type: 'success' | 'error'; message: string } | null;

const SITE_LABELS: Record<SiteChoice, string> = {
  auto: 'Their signup site (recommended)',
  premium: 'Paxora Premium',
  lab: 'Paxora',
};

const STARTER_BODY = `<p>Hi {{first_name}},</p><p>We have an update from the Paxora team that we think you will like.</p><p>Log in to your account to see what is new.</p><p>Thanks for being with us,<br>The Paxora Team</p>`;

const REMINDER_BODY = `<p>Hi {{first_name}},</p><p>We noticed your email address has not been verified yet. Confirming it keeps your account secure and makes sure you receive important updates from {{site}}.</p><p>It only takes a second:</p><p><a href="{{site_url}}/verify-email?email={{email}}">Verify my email</a></p><p>Thanks,<br>The Paxora Team</p>`;

export default function EmailsPage() {
  const [tab, setTab] = useState<'compose' | 'history'>('compose');
  const [users, setUsers] = useState<Recipient[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<Segment>('selected');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(STARTER_BODY);
  const [editorKey, setEditorKey] = useState(0);
  const [site, setSite] = useState<SiteChoice>('auto');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState<'campaign' | 'test' | 'nudge' | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<{ summary: EmailCampaign | null; logs: any[] } | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadUsers = useCallback(() => {
    setLoadingUsers(true);
    getUsers()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.users ?? [];
        setUsers(list.filter((u: Recipient) => Boolean(u.email)));
      })
      .catch((error: Error) => notify('error', error.message || 'Could not load users'))
      .finally(() => setLoadingUsers(false));
  }, [notify]);

  const loadCampaigns = useCallback(() => {
    getEmailCampaigns()
      .then(setCampaigns)
      .catch((error: Error) => notify('error', error.message || 'Could not load email history'));
  }, [notify]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  // Live preview uses the exact backend template that real recipients receive.
  useEffect(() => {
    const timer = setTimeout(() => {
      previewEmailCampaign({
        subject: subject || 'Your subject line',
        html: body,
        site,
        sample: { name: 'Alex Morgan', email: 'alex@example.com' },
      })
        .then((result) => setPreviewHtml(result.html))
        .catch(() => { /* keep the last good preview */ });
    }, 350);
    return () => clearTimeout(timer);
  }, [subject, body, site]);

  const emailUsers = useMemo(() => users.filter((user) => Boolean(user.email)), [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return emailUsers;
    return emailUsers.filter((user) =>
      (user.name || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      String(user.id).includes(query)
    );
  }, [emailUsers, search]);

  const segmentUsers = useMemo(() => {
    if (segment === 'verified') return emailUsers.filter((user) => Boolean(user.emailVerifiedAt));
    if (segment === 'unverified') return emailUsers.filter((user) => !user.emailVerifiedAt);
    return emailUsers;
  }, [emailUsers, segment]);

  const recipientCount = segment === 'selected' ? selected.size : segmentUsers.length;
  const unverifiedCount = emailUsers.filter((user) => !user.emailVerifiedAt && user.role !== 'admin').length;

  const toggleUser = (id: number) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const insertVariable = (token: string) => {
    setBody((previous) => `${previous}<p><code>${token}</code></p>`);
    setEditorKey((value) => value + 1);
  };

  const loadUnverified = () => {
    const ids = emailUsers.filter((user) => !user.emailVerifiedAt && user.role !== 'admin').map((user) => user.id);
    setSelected(new Set(ids));
    setSegment('selected');
    setSubject('Verify your email · Paxora');
    setBody(REMINDER_BODY);
    setEditorKey((value) => value + 1);
    notify('success', `${ids.length} unverified users selected with a ready-made reminder`);
  };

  const handleNudge = async () => {
    const ids = emailUsers.filter((user) => !user.emailVerifiedAt && user.role !== 'admin').map((user) => user.id);
    if (!ids.length) return notify('error', 'No unverified users to remind');
    if (!window.confirm(`Send a fresh verification link to ${ids.length} unverified user(s)?`)) return;
    setSending('nudge');
    try {
      const result = await nudgeUnverifiedEmails(ids, site);
      notify('success', `Sent ${result.sent} verification reminder(s)${result.failed ? `, ${result.failed} failed` : ''}`);
      loadCampaigns();
    } catch (error) {
      notify('error', (error as Error).message || 'Could not send reminders');
    } finally {
      setSending(null);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) return notify('error', 'Enter a test email address');
    if (!subject.trim() || !body.trim()) return notify('error', 'Add a subject and message first');
    setSending('test');
    try {
      const result = await sendTestEmail({ to: testEmail.trim(), subject, html: body, site });
      notify('success', `Test email sent to ${result.site === 'lab' ? 'Paxora' : 'Paxora Premium'} preview`);
    } catch (error) {
      notify('error', (error as Error).message || 'Could not send test email');
    } finally {
      setSending(null);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) return notify('error', 'Add a subject line');
    if (!body.trim()) return notify('error', 'Write a message first');
    if (recipientCount === 0) return notify('error', 'Choose at least one recipient');
    if (!window.confirm(`Send this email to ${recipientCount} recipient(s)?`)) return;
    setSending('campaign');
    try {
      const result = await sendEmailCampaign({
        userIds: segment === 'selected' ? Array.from(selected) : [],
        segment,
        subject,
        html: body,
        site,
      });
      notify('success', `Campaign delivered to ${result.sent} of ${result.total} recipient(s)`);
      loadCampaigns();
      setTab('history');
    } catch (error) {
      notify('error', (error as Error).message || 'Could not send campaign');
    } finally {
      setSending(null);
    }
  };

  const openCampaign = async (campaignId: string) => {
    try {
      const detail = await getEmailCampaign(campaignId);
      setActiveCampaign(detail);
    } catch (error) {
      notify('error', (error as Error).message || 'Could not load campaign');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Studio"
        subtitle="Write once, send branded HTML email to the right users — and see exactly who got it."
        badge={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Mail className="h-3 w-3" /> {emailUsers.length} reachable users
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border-light px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <AlertTriangle className="h-3 w-3" /> {unverifiedCount} unverified
            </span>
          </div>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => { loadUsers(); loadCampaigns(); }}>
              Refresh
            </Button>
            <Button variant="success" size="sm" leftIcon={<MailCheck className="h-4 w-4" />} onClick={handleNudge} loading={sending === 'nudge'}>
              Nudge unverified
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-1 rounded-2xl border border-border-light bg-surface/60 p-1 w-fit">
        {(['compose', 'history'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all',
              tab === value ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {value === 'compose' ? 'Compose' : `Send history (${campaigns.length})`}
          </button>
        ))}
      </div>

      {tab === 'compose' ? (
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
          {/* Recipient picker */}
          <Card padding="md" className="h-fit xl:sticky xl:top-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Users className="h-4 w-4 text-primary" /> Recipients
              </h2>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{recipientCount}</span>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {([
                ['selected', 'Selected'],
                ['all', 'All users'],
                ['verified', 'Verified'],
                ['unverified', 'Unverified'],
              ] as [Segment, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSegment(value)}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all',
                    segment === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-light text-muted-foreground hover:bg-surface-hover'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Input
              placeholder="Search name, email or ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              leftAdornment={<Search className="h-4 w-4" />}
            />

            {segment === 'selected' && (
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <button className="font-semibold text-primary hover:underline" onClick={() => setSelected(new Set(filteredUsers.map((user) => user.id)))}>
                  Select visible
                </button>
                <span className="text-muted-foreground">·</span>
                <button className="font-semibold text-muted-foreground hover:text-foreground" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}

            <div className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {loadingUsers && (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {!loadingUsers && filteredUsers.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">No users found</p>
              )}
              {filteredUsers.map((user) => {
                const isSelected = segment === 'selected' ? selected.has(user.id) : segmentUsers.some((candidate) => candidate.id === user.id);
                return (
                  <label
                    key={user.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 transition-all',
                      isSelected ? 'border-primary/40 bg-primary/5' : 'border-transparent hover:bg-surface-hover'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                      checked={isSelected}
                      disabled={segment !== 'selected'}
                      onChange={() => toggleUser(user.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-foreground">{user.name || `User #${user.id}`}</span>
                        {user.emailVerifiedAt && <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {user.signupSite === 'lab' ? 'Paxora' : 'Paxora Premium'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              onClick={loadUnverified}
              className="mt-4 w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-left text-[11px] font-semibold text-primary hover:bg-primary/10"
            >
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              Use ready-made verification reminder
            </button>
          </Card>

          {/* Composer */}
          <div className="space-y-5">
            <Card padding="md">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Subject line"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Something your users will want to open"
                  />
                </div>
                <div className="w-full sm:w-56">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Send as</label>
                  <select
                    value={site}
                    onChange={(event) => setSite(event.target.value as SiteChoice)}
                    className="h-11 w-full rounded-2xl border border-border-medium bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {(Object.keys(SITE_LABELS) as SiteChoice[]).map((key) => (
                      <option key={key} value={key}>{SITE_LABELS[key]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold text-muted-foreground">Insert variable:</span>
                {['{{first_name}}', '{{email}}', '{{site}}', '{{site_url}}'].map((token) => (
                  <button
                    key={token}
                    onClick={() => insertVariable(token)}
                    className="rounded-md border border-border-light bg-surface-hover px-2 py-1 font-mono text-[10px] text-foreground hover:border-primary hover:text-primary"
                  >
                    {token}
                  </button>
                ))}
              </div>

              <RichTextEditor
                key={editorKey}
                content={body}
                onChange={setBody}
                placeholder="Write something worth opening…"
                minHeight="320px"
              />
            </Card>

            <Card padding="md">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Send className="h-4 w-4 text-primary" /> Send
              </h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Test email address (e.g. you@company.com)"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleTest} loading={sending === 'test'}>Send test</Button>
                <Button onClick={handleSend} loading={sending === 'campaign'} leftIcon={<Send className="h-4 w-4" />}>
                  Send to {recipientCount}
                </Button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Campaigns are sent in small batches with delivery logged per user. Soft verification means this never blocks account access.
              </p>
            </Card>
          </div>

          {/* Preview */}
          <Card padding="none" className="h-fit overflow-hidden xl:sticky xl:top-6">
            <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Eye className="h-4 w-4 text-primary" /> Live preview
              </h2>
              <div className="flex items-center gap-1 rounded-lg bg-surface-hover p-0.5">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  title="Desktop"
                  className={cn('rounded-md p-1.5', previewMode === 'desktop' ? 'bg-background text-foreground' : 'text-muted-foreground')}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  title="Mobile"
                  className={cn('rounded-md p-1.5', previewMode === 'mobile' ? 'bg-background text-foreground' : 'text-muted-foreground')}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-surface-hover/60 p-4">
              <div className={cn('mx-auto overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-all duration-300', previewMode === 'mobile' ? 'max-w-[300px]' : 'w-full')}>
                <iframe
                  title="Email preview"
                  srcDoc={previewHtml}
                  className="h-[560px] w-full border-0"
                  sandbox=""
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-border-light px-5 py-4">
              <h2 className="text-sm font-bold text-foreground">Sent campaigns</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Every bulk send and test, newest first.</p>
            </div>
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                <Mail className="h-8 w-8" />
                <p className="text-sm">No campaigns sent yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.campaignId}
                    onClick={() => openCampaign(campaign.campaignId)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{campaign.subject}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock3 className="h-3 w-3" /> {formatDate(campaign.createdAt)}
                        <span>·</span>
                        {campaign.site === 'lab' ? 'Paxora' : campaign.site === 'premium' ? 'Paxora Premium' : 'Mixed'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-success">{campaign.sent} sent</p>
                      <p className={cn('text-[11px]', campaign.failed ? 'text-destructive' : 'text-muted-foreground')}>
                        {campaign.failed} failed
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card padding="md" className="h-fit">
            <h2 className="mb-3 text-sm font-bold text-foreground">Delivery details</h2>
            {!activeCampaign ? (
              <p className="py-12 text-center text-xs leading-relaxed text-muted-foreground">
                Select a campaign to see each recipient and delivery status.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="truncate text-sm font-semibold text-foreground">{activeCampaign.summary?.subject || 'Campaign'}</p>
                <div className="max-h-[480px] space-y-1.5 overflow-y-auto pr-1">
                  {activeCampaign.logs.map((log) => (
                    <div key={log.id} className="rounded-xl border border-border-light p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-foreground">{log.email}</span>
                        <span className={cn(
                          'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase',
                          log.status === 'sent' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        )}>
                          {log.status}
                        </span>
                      </div>
                      {log.error && <p className="mt-1 truncate text-[10px] text-destructive">{log.error}</p>}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl',
          toast.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {sending === 'campaign' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-surface px-6 py-4 text-sm font-semibold text-foreground shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Sending campaign in batches…
          </div>
        </div>
      )}
    </div>
  );
}
