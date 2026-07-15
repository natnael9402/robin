'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Wallet, Copy, Check, Trash2, Search, Landmark, Pencil, ClipboardPaste, Power, PowerOff } from 'lucide-react';
import {
  getCryptoAddresses,
  createCryptoAddress,
  updateCryptoAddress,
  deleteCryptoAddress,
  type CryptoAddress,
} from '@/lib/api';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Table, type Column } from '@/shared/components/ui/Table';
import { Modal, ConfirmModal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { cn } from '@/shared/lib/utils';

function shorten(addr: string) {
  if (!addr) return '—';
  return addr.length > 24 ? `${addr.slice(0, 14)}…${addr.slice(-8)}` : addr;
}

function fmtDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const EMPTY_FORM = { currency: '', network: '', address: '', notes: '' };

interface FormState {
  currency: string;
  network: string;
  address: string;
  notes: string;
  isActive: boolean;
}

function toForm(r: CryptoAddress | null): FormState {
  return {
    currency: r?.currency ?? '',
    network: r?.network ?? '',
    address: r?.address ?? '',
    notes: r?.notes ?? '',
    isActive: r?.isActive ?? r?.is_active ?? true,
  };
}

export default function WalletAddressesPage() {
  const [rows, setRows] = useState<CryptoAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<CryptoAddress | null>(null);
  const [editForm, setEditForm] = useState<FormState>(toForm(null));
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<CryptoAddress | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [copied, setCopied] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await getCryptoAddresses());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.currency, r.network, r.address, r.notes].some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const copy = async (row: CryptoAddress) => {
    try {
      await navigator.clipboard.writeText(row.address);
      setCopied(row.id);
      setTimeout(() => setCopied((c) => (c === row.id ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  };

  const pasteFromClipboard = async (target: 'form' | 'edit') => {
    try {
      const text = await navigator.clipboard.readText();
      if (target === 'form') {
        setForm((f) => ({ ...f, address: text }));
      } else {
        setEditForm((f) => ({ ...f, address: text }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.currency.trim() || !form.network.trim() || !form.address.trim()) {
      setFormError('Currency, network and address are required.');
      return;
    }
    setSaving(true);
    try {
      await createCryptoAddress({
        currency: form.currency.trim().toUpperCase(),
        network: form.network.trim().toUpperCase(),
        address: form.address.trim(),
        notes: form.notes.trim() || undefined,
      });
      setAddOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (r: CryptoAddress) => {
    setEditTarget(r);
    setEditForm(toForm(r));
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditError(null);
    if (!editForm.address.trim()) {
      setEditError('Address is required.');
      return;
    }
    setEditSaving(true);
    try {
      await updateCryptoAddress(editTarget.id, {
        address: editForm.address.trim(),
        notes: editForm.notes.trim() || undefined,
        is_active: editForm.isActive,
      });
      setEditTarget(null);
      await load();
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCryptoAddress(toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const isActive = (r: CryptoAddress) => r.isActive ?? r.is_active ?? true;

  const columns: Column<CryptoAddress>[] = [
    { key: 'id', header: 'ID', width: '64px', render: (r) => <span className="font-mono text-muted-foreground">{r.id}</span> },
    { key: 'currency', header: 'Currency', render: (r) => <span className="font-semibold text-foreground">{r.currency}</span> },
    { key: 'network', header: 'Network', render: (r) => <span className="text-muted-foreground">{r.network}</span> },
    {
      key: 'address',
      header: 'Address',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-foreground" title={r.address}>{shorten(r.address)}</span>
          <button
            onClick={() => copy(r)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Copy address"
          >
            {copied === r.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={isActive(r) ? 'active' : 'cancelled'} size="xs" /> },
    { key: 'created', header: 'Created', render: (r) => <span className="text-muted-foreground">{fmtDate(r.createdAt ?? r.created_at)}</span> },
    { key: 'notes', header: 'Notes', render: (r) => <span className="text-muted-foreground">{r.notes || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(r)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            title="Edit address"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setToDelete(r)}
            className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive-muted"
            title="Delete address"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Wallet Addresses"
        subtitle="Deposit addresses shown to users. Adding a new address for a currency/network deactivates the previous one."
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={18} className="mr-1" /> Add Address
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search addresses…"
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive-muted px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Mobile card view */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-hover" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center md:hidden">
          <Wallet size={40} className="mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">No wallet addresses yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{r.currency}</p>
                    <p className="text-xs text-muted-foreground">{r.network}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={isActive(r) ? 'active' : 'cancelled'} size="xs" />
                  <button
                    onClick={() => openEdit(r)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                    title="Edit address"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setToDelete(r)}
                    className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive-muted"
                    title="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mb-3 rounded-xl bg-surface-hover p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate font-mono text-sm text-foreground">{r.address}</span>
                  <button
                    onClick={() => copy(r)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    title="Copy address"
                  >
                    {copied === r.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created {fmtDate(r.createdAt ?? r.created_at)}</span>
                {r.notes && <span className="truncate italic">{r.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(r) => r.id}
          loading={loading}
          emptyStateIcon={<Wallet size={40} className="text-muted-foreground" />}
          emptyState="No wallet addresses yet. Add one to let users deposit."
        />
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Wallet Address" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              placeholder="USDT"
            />
            <Input
              label="Network"
              value={form.network}
              onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))}
              placeholder="ERC20"
            />
          </div>
          <div className="relative">
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="0x… / wallet address"
            />
            <button
              onClick={() => pasteFromClipboard('form')}
              className="absolute right-2 top-8 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              title="Paste from clipboard"
            >
              <ClipboardPaste size={16} />
            </button>
          </div>
          <Input
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. USDT (ERC20)"
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Add Address
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.currency ?? ''} (${editTarget?.network ?? ''})`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Currency"
              value={editForm.currency}
              onChange={(e) => setEditForm((f) => ({ ...f, currency: e.target.value }))}
              placeholder="USDT"
            />
            <Input
              label="Network"
              value={editForm.network}
              onChange={(e) => setEditForm((f) => ({ ...f, network: e.target.value }))}
              placeholder="ERC20"
            />
          </div>
          <div className="relative">
            <Input
              label="Address"
              value={editForm.address}
              onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="0x… / wallet address"
            />
            <button
              onClick={() => pasteFromClipboard('edit')}
              className="absolute right-2 top-8 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              title="Paste from clipboard"
            >
              <ClipboardPaste size={16} />
            </button>
          </div>
          <Input
            label="Notes (optional)"
            value={editForm.notes}
            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. USDT (ERC20)"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                editForm.isActive
                  ? 'border-success/30 bg-success-muted text-success hover:bg-success/20'
                  : 'border-destructive/30 bg-destructive-muted text-destructive hover:bg-destructive/20',
              )}
            >
              {editForm.isActive ? <Power size={16} /> : <PowerOff size={16} />}
              {editForm.isActive ? 'Active' : 'Inactive'}
            </button>
            <span className="text-xs text-muted-foreground">
              {editForm.isActive
                ? 'Users can see and use this address for deposits'
                : 'Hidden from users — deposits to this address will not be accepted'}
            </span>
          </div>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={editSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete address?"
        message={
          toDelete
            ? `Remove the ${toDelete.currency} (${toDelete.network}) address? Users will no longer see it for deposits.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
