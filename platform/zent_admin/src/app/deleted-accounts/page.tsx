'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDeletedAccounts } from '@/lib/api';
import type { DeletedAccount } from '@/lib/api';
import { Search, Archive, Undo2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { SkeletonList } from '@/shared/components/ui/Skeleton';
import { Table, type Column } from '@/shared/components/ui/Table';
import { PurgeUserModal, RestoreUserModal } from '@/shared/components/ui/DeleteUserModal';
import { cn, formatDate } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;

export default function DeletedAccountsPage() {
  const [accounts, setAccounts] = useState<DeletedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<Toast>(null);
  const [restoreTarget, setRestoreTarget] = useState<DeletedAccount | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<DeletedAccount | null>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    getDeletedAccounts()
      .then(setAccounts)
      .catch((err) => {
        console.error(err);
        notify('error', err.message || 'Failed to load deleted accounts');
      })
      .finally(() => setLoading(false));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = accounts.filter((a) =>
    (a.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<DeletedAccount>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{a.name || 'Unknown'}</span>
          <span className="text-muted-foreground text-xs">{a.email || '—'}</span>
        </div>
      ),
    },
    {
      key: 'originalUserId',
      header: 'Original ID',
      render: (a) => <span className="font-mono text-xs text-muted-foreground">#{a.originalUserId}</span>,
    },
    {
      key: 'balance',
      header: 'Balance at Deletion',
      render: (a) => (
        <span className="font-medium text-foreground">
          ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (a) => <StatusBadge status={a.role as any} size="xs" />,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (a) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block" title={a.reason ?? ''}>
          {a.reason || '—'}
        </span>
      ),
    },
    {
      key: 'deletedAt',
      header: 'Deleted At',
      render: (a) => (
        <span className="text-muted-foreground text-xs">{formatDate(a.deletedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      width: '88px',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setRestoreTarget(a)}
            title={`Restore ${a.name || a.email}`}
            aria-label={`Restore ${a.name || a.email}`}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-success-muted hover:text-success"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPurgeTarget(a)}
            title={`Permanently delete ${a.name || a.email}`}
            aria-label={`Permanently delete ${a.name || a.email}`}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {toast && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-[600] -translate-x-1/2">
          <div
            className={cn(
              'glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glass-lg',
              toast.type === 'success'
                ? 'border-success/30 text-success'
                : 'border-destructive/30 text-destructive'
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
        <PageHeader
          title="Deleted Accounts"
          subtitle="Archived users. Restore an account to return it to the platform, or delete it permanently."
          action={
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9 pr-4 py-2 text-sm w-full"
                fullWidth={false}
              />
            </div>
          }
        />

        {loading ? (
          <SkeletonList rows={4} rowClassName="h-16" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Archive className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No deleted accounts found.</p>
          </div>
        ) : (
          <div className="hidden md:block">
            <Table columns={columns} data={filtered} keyExtractor={(a) => a.id} loading={false} emptyState="No deleted accounts found." />
          </div>
        )}

        {/* Mobile cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.map((a) => (
              <div key={a.id} className="bg-surface p-4 rounded-2xl border border-border-light shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{a.name || 'Unknown'}</h3>
                    <p className="text-xs text-muted-foreground">{a.email || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={a.role as any} size="xs" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-hover rounded-xl mb-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Balance</p>
                    <p className="font-mono font-bold text-foreground">
                      ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Deleted</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDate(a.deletedAt)}
                    </p>
                  </div>
                </div>
                {a.reason && (
                  <p className="text-xs text-muted-foreground px-1 mb-3">
                    <span className="font-semibold">Reason:</span> {a.reason}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Undo2 size={14} />}
                    onClick={() => setRestoreTarget(a)}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setPurgeTarget(a)}
                  >
                    Delete forever
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {restoreTarget && (
        <RestoreUserModal
          open={!!restoreTarget}
          onClose={() => setRestoreTarget(null)}
          userId={restoreTarget.originalUserId}
          userName={restoreTarget.name}
          userEmail={restoreTarget.email}
          onNotify={notify}
          onRestored={(restoredId) => {
            setAccounts((current) => current.filter((a) => a.originalUserId !== restoredId));
            setRestoreTarget(null);
          }}
        />
      )}

      {purgeTarget && (
        <PurgeUserModal
          open={!!purgeTarget}
          onClose={() => setPurgeTarget(null)}
          userId={purgeTarget.originalUserId}
          userName={purgeTarget.name}
          userEmail={purgeTarget.email}
          onNotify={notify}
          onPurged={(purgedId) => {
            setAccounts((current) => current.filter((a) => a.originalUserId !== purgedId));
            setPurgeTarget(null);
          }}
        />
      )}
    </div>
  );
}
