'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, createUser, setBalance } from '@/lib/api';
import { Plus, Search, ChevronRight, Calendar, X, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { Modal } from '@/shared/components/ui/Modal';
import { SkeletonList } from '@/shared/components/ui/Skeleton';
import { Table, type Column } from '@/shared/components/ui/Table';
import { cn, formatDate } from '@/shared/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  balance: string | number;
  role?: string;
  isAdmin?: boolean;
  createdAt: string;
  accountBalances?: Array<{ type: string; balance: string | number }>;
}

const isAdminUser = (u: User) => u.role === 'admin' || u.isAdmin === true;
const getFastTradeBalance = (u: User) => {
  const ab = u.accountBalances?.find((b) => b.type === 'fast_trade');
  return ab ? Number(ab.balance) : 0;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    balance: '0',
    isAdmin: false
  });
  const [balanceAmount, setBalanceAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ date_from: dateFrom || undefined, date_to: dateTo || undefined })
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        alert('Failed to load users');
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = dateFrom || dateTo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser({
        ...formData,
        balance: Number(formData.balance)
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', balance: '0', isAdmin: false });
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !balanceAmount) return;
    try {
      await setBalance(selectedUser.id, Number(balanceAmount));
      setIsBalanceModalOpen(false);
      setSelectedUser(null);
      setBalanceAmount('');
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to update balance');
    }
  };

  const filteredUsers = users
    .filter(user =>
      (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.id ?? '').includes(searchTerm)
    )
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (user) => (
        <span className="font-mono text-xs text-muted-foreground">#{user.id}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{user.name || 'No Name'}</span>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (user) => (
        <span className="font-medium text-foreground">
          ${getFastTradeBalance(user).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <StatusBadge status={isAdminUser(user) ? 'admin' : 'user'} size="xs" />
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (user) => (
        <span className="text-muted-foreground">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      width: '60px',
      render: () => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors">
          View <ChevronRight size={15} />
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-6 lg:p-8 lg:pt-16">
        <PageHeader
          title="Users"
          subtitle="Manage platform users and balances."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                onClick={() => setShowFilters((v) => !v)}
                leftIcon={<Filter size={14} />}
                size="sm"
              >
                Filters
              </Button>
              <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16} />} size="sm">
                Add User
              </Button>
            </div>
          }
        />

        {/* Filter bar */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-1 fade-in mb-5 rounded-2xl border border-border-light bg-surface/60 p-4 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="rounded-xl border border-border-light bg-surface px-9 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="rounded-xl border border-border-light bg-surface px-9 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X size={14} />}>
                    Clear
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={fetchUsers} leftIcon={<RefreshCw size={14} />}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="pl-10 pr-4 py-2.5 text-sm w-full"
            fullWidth
          />
        </div>

        {/* Mobile View */}
        {loading ? (
          <SkeletonList rows={5} rowClassName="h-28" />
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UsersIcon className="mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No users found.</p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                <X size={14} className="mr-1" /> Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </p>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-surface p-5 rounded-2xl border border-border-light shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                        isAdminUser(user)
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-zinc-100 text-muted-foreground dark:bg-zinc-800 dark:text-zinc-400'
                      )}>
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{user.name || 'No Name'}</h3>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-[10px] font-mono text-subtle-foreground mt-0.5">ID #{user.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={isAdminUser(user) ? 'admin' : 'user'} size="xs" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-hover rounded-xl">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Balance</p>
                      <p className="font-mono font-bold text-lg text-foreground">
                        ${getFastTradeBalance(user).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Joined</p>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <Table
                columns={columns}
                data={filteredUsers}
                keyExtractor={(u) => u.id}
                loading={false}
                emptyState="No users found."
                onRowClick={(u) => router.push(`/users/${u.id}`)}
              />
            </div>
          </>
        )}
      </main>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create User"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="create-user-form" loading={submitting}>Create User</Button>
          </div>
        }
      >
        <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            label="Initial Balance"
            type="number"
            min="0"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
          />
          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="rounded border-zinc-300 text-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Administrator Access</span>
          </label>
        </form>
      </Modal>

      <Modal
        open={isBalanceModalOpen && !!selectedUser}
        onClose={() => setIsBalanceModalOpen(false)}
        title="Update Balance"
        size="sm"
        description={
          selectedUser ? (
            <>
              Updating Fast Trade balance for <strong>{selectedUser.name || selectedUser.email}</strong>
              <br />
              Current Balance: ${getFastTradeBalance(selectedUser).toFixed(2)}
            </>
          ) : undefined
        }
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsBalanceModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="balance-form">Confirm Update</Button>
          </div>
        }
      >
        <form id="balance-form" onSubmit={handleAddBalance} className="space-y-4">
          <Input
            label="New Balance Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            leftAdornment={<span className="text-zinc-400 font-bold text-lg">$</span>}
            placeholder="0.00"
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}