'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Trash2, Undo2 } from 'lucide-react';
import { cn, formatCurrency, formatDate, getInitials } from '@/shared/lib/utils';
import {
  deleteUser,
  getUserDeleteImpact,
  purgeUser,
  restoreUser,
  type DeleteImpact,
} from '@/lib/api';
import { Button } from './Button';
import { Modal } from './Modal';
import { Skeleton } from './Skeleton';
import { StatusBadge } from './StatusBadge';

const DELETE_REASONS = [
  'Test account',
  'Duplicate account',
  'Spam or fraud',
  'User request',
  'Inactive account',
  'Policy violation',
];

const ACCOUNT_LABELS: Array<{ key: 'fastTrade' | 'spot' | 'trading'; label: string }> = [
  { key: 'fastTrade', label: 'Fast Trade' },
  { key: 'spot', label: 'Spot' },
  { key: 'trading', label: 'Trading' },
];

const COUNT_LABELS: Array<{ key: keyof DeleteImpact['counts']; label: string }> = [
  { key: 'trades', label: 'Trades' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'withdrawals', label: 'Withdrawals' },
  { key: 'loans', label: 'Loans' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'assets', label: 'Assets' },
  { key: 'kycSubmissions', label: 'KYC submissions' },
  { key: 'supportTickets', label: 'Support tickets' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'referralCommissions', label: 'Referral records' },
];

const panelStyles =
  'rounded-xl border border-border-light bg-surface/60 p-3.5';

export interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  /** Used only for the initial label while the preview loads. */
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  onDeleted: (userId: number) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function DeleteUserModal({
  open,
  onClose,
  userId,
  userName,
  userEmail,
  onDeleted,
  onNotify,
}: DeleteUserModalProps) {
  const [step, setStep] = useState<'review' | 'confirm'>('review');
  const [impact, setImpact] = useState<DeleteImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  const reset = useCallback(() => {
    setStep('review');
    setImpact(null);
    setLoading(false);
    setDeleting(false);
    setError('');
    setReason('');
  }, []);

  const loadImpact = useCallback(() => {
    setLoading(true);
    setError('');
    getUserDeleteImpact(userId)
      .then(setImpact)
      .catch((err: Error) => {
        setError(err.message || 'Failed to load delete preview');
        onNotify('error', err.message || 'Failed to load delete preview');
      })
      .finally(() => setLoading(false));
  }, [userId, onNotify]);

  useEffect(() => {
    if (open) {
      reset();
      loadImpact();
    }
  }, [open, reset, loadImpact]);

  const handleClose = () => {
    if (deleting) return;
    reset();
    onClose();
  };

  const handleDelete = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError('Please give a reason of at least 3 characters.');
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await deleteUser(userId, trimmed);
      onNotify('success', `${impact?.user.name || userEmail || 'User'} deleted. Restore it from Deleted Accounts if needed.`);
      onDeleted(userId);
      reset();
      onClose();
    } catch (err) {
      const message = (err as Error).message || 'Failed to delete user';
      setError(message);
      onNotify('error', message);
    } finally {
      setDeleting(false);
    }
  };

  const displayName = impact?.user.name || userName || 'this user';
  const displayEmail = impact?.user.email || userEmail;
  const total = impact?.balances.total ?? 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={!deleting}
      closeOnEscape={!deleting}
      size="md"
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive-muted">
            <Trash2 size={16} className="text-destructive" />
          </span>
          {step === 'review' ? 'Delete user' : 'Confirm deletion'}
        </span>
      }
      description={
        step === 'review'
          ? 'Review what will happen before continuing.'
          : 'This action takes effect immediately.'
      }
      footer={
        step === 'review' ? (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={loading || deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setError('');
                setStep('confirm');
              }}
              disabled={loading || !impact || error !== ''}
              rightIcon={<ArrowLeft size={15} className="rotate-180" />}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setError('');
                setStep('review');
              }}
              disabled={deleting}
              leftIcon={<ArrowLeft size={15} />}
            >
              Back
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} leftIcon={<Trash2 size={15} />}>
              Delete user
            </Button>
          </>
        )
      }
    >
      {step === 'review' ? (
        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton height={64} />
              <Skeleton height={96} />
              <Skeleton height={80} />
            </div>
          )}

          {!loading && error !== '' && (
            <div className={cn(panelStyles, 'border-destructive/30 bg-destructive/5')}>
              <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle size={15} />
                Cannot load preview
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{error}</p>
            </div>
          )}

          {!loading && impact && (
            <>
              <div className={cn(panelStyles, 'flex items-center gap-3')}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-bold text-primary">
                  {getInitials(displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail || 'No email'} &middot; #{userId}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={impact.user.role === 'admin' ? 'admin' : 'user'} size="xs" />
                    {impact.user.status === 'active' ? (
                      <StatusBadge status="active" size="xs" />
                    ) : (
                      <StatusBadge status="rejected" size="xs">
                        {impact.user.status}
                      </StatusBadge>
                    )}
                    <span className="text-[10px] text-subtle-foreground">
                      Joined {formatDate(impact.user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={cn(panelStyles, 'space-y-2.5')}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Balances
                  </p>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      total > 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {formatCurrency(total)}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_LABELS.map((account) => (
                    <div key={account.key} className="rounded-lg bg-surface px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-subtle-foreground">
                        {account.label}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-foreground">
                        {formatCurrency(impact.balances[account.key])}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {(() => {
                const rows = COUNT_LABELS.filter((row) => impact.counts[row.key] > 0);
                if (rows.length === 0) {
                  return (
                    <div className={cn(panelStyles, 'text-xs text-muted-foreground')}>
                      This user has no trades, deposits, withdrawals or other records.
                    </div>
                  );
                }
                return (
                  <div className={cn(panelStyles, 'space-y-2')}>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Also removed with this account
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {rows.map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-xs font-bold text-foreground">{impact.counts[row.key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {impact.warnings.length > 0 && (
                <div className={cn(panelStyles, 'border-warning/30 bg-warning/5 space-y-2')}>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warning">
                    <AlertTriangle size={14} />
                    Heads up
                  </p>
                  <ul className="space-y-1.5">
                    {impact.warnings.map((warning) => (
                      <li key={warning.code} className="text-xs">
                        <span className="font-semibold text-foreground">{warning.label}</span>
                        <span className="text-muted-foreground"> &mdash; {warning.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className={cn(panelStyles, 'text-xs text-muted-foreground')}>
                The account is archived and the user is signed out. You can restore it from
                Deleted Accounts at any time.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={cn(panelStyles, 'flex items-center gap-3')}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary">
              {getInitials(displayName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {displayEmail || 'No email'} &middot; #{userId}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="delete-user-reason"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Reason
            </label>
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {DELETE_REASONS.map((suggestion) => {
                const active = reason === suggestion;
                return (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      setReason(suggestion);
                      setError('');
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50',
                      active
                        ? 'border-destructive text-destructive'
                        : 'border-border-medium bg-surface text-muted-foreground hover:border-destructive/50 hover:text-foreground'
                    )}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
            <textarea
              id="delete-user-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error && e.target.value.trim().length >= 3) setError('');
              }}
              placeholder="Why is this account being deleted?"
              rows={3}
              disabled={deleting}
              className={cn(
                'w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50',
                error ? 'border-destructive' : 'border-border-medium'
              )}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
          </div>

          <p className={cn(panelStyles, 'text-xs text-muted-foreground')}>
            This is recorded in the Deleted Accounts log and is reversible until you permanently
            delete the account.
          </p>
        </div>
      )}
    </Modal>
  );
}

export interface RestoreUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  onRestored: (userId: number) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function RestoreUserModal({
  open,
  onClose,
  userId,
  userName,
  userEmail,
  onRestored,
  onNotify,
}: RestoreUserModalProps) {
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const label = userName || userEmail || `User #${userId}`;

  const handleClose = () => {
    if (restoring) return;
    setError('');
    onClose();
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError('');
    try {
      await restoreUser(userId);
      onNotify('success', `${label} restored`);
      onRestored(userId);
      handleClose();
    } catch (err) {
      const message = (err as Error).message || 'Failed to restore user';
      setError(message);
      onNotify('error', message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={!restoring}
      closeOnEscape={!restoring}
      size="sm"
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-muted">
            <Undo2 size={16} className="text-success" />
          </span>
          Restore user?
        </span>
      }
      description={`${label} will be reactivated and signed-in access restored.`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={restoring}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleRestore} loading={restoring} leftIcon={<Undo2 size={15} />}>
            Restore
          </Button>
        </>
      }
    >
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          The account returns to the active user list and the deletion reason is cleared from the
          archive.
        </p>
      )}
    </Modal>
  );
}

export interface PurgeUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  onPurged: (userId: number) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

/**
 * Permanent removal. Unlike the archive step there is no undo, so it requires
 * typing the account's email to enable the button.
 */
export function PurgeUserModal({
  open,
  onClose,
  userId,
  userName,
  userEmail,
  onPurged,
  onNotify,
}: PurgeUserModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState('');
  const label = userName || userEmail || `User #${userId}`;
  const expected = (userEmail || '').trim().toLowerCase();
  const matches = expected !== '' && confirmation.trim().toLowerCase() === expected;

  const handleClose = () => {
    if (purging) return;
    setConfirmation('');
    setError('');
    onClose();
  };

  const handlePurge = async () => {
    if (!matches) return;
    setPurging(true);
    setError('');
    try {
      await purgeUser(userId);
      onNotify('success', `${label} permanently deleted`);
      onPurged(userId);
      setConfirmation('');
      onClose();
    } catch (err) {
      const message = (err as Error).message || 'Failed to permanently delete user';
      setError(message);
      onNotify('error', message);
    } finally {
      setPurging(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={false}
      closeOnEscape={!purging}
      size="sm"
      className="border-destructive/40"
      title={
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive-muted">
            <AlertTriangle size={16} className="text-destructive" />
          </span>
          Permanently delete
        </span>
      }
      description="This cannot be undone."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={purging}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handlePurge} loading={purging} disabled={!matches}>
            Delete forever
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <p className="text-sm text-muted-foreground">
          All records for <span className="font-semibold text-foreground">{label}</span> and every
          uploaded document will be removed from the database and storage. The archive entry is
          kept as a record.
        </p>
        {userEmail ? (
          <div>
            <label
              htmlFor="purge-confirm-email"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Type <span className="text-destructive">{userEmail}</span> to confirm
            </label>
            <input
              id="purge-confirm-email"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                if (error) setError('');
              }}
              disabled={purging}
              autoComplete="off"
              className={cn(
                'w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50',
                confirmation && !matches ? 'border-destructive' : 'border-border-medium'
              )}
              placeholder={userEmail}
            />
          </div>
        ) : (
          <p className={cn(panelStyles, 'text-xs text-muted-foreground')}>
            This account has no email address, so confirmation is not required.
          </p>
        )}
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}
