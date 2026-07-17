export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.paxorapremiumlab.com/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
}

const snakeToCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, c) => String(c).toUpperCase());

/**
 * The /ol backend returns snake_case (raw Prisma) for most resources while the
 * admin UI is written against camelCase. Deep-camelize every response so the two
 * stay compatible. Idempotent: already-camelCased keys have no `_` and pass through.
 */
export function camelize(input: any): any {
  if (Array.isArray(input)) return input.map(camelize);
  if (input && typeof input === 'object' && !(input instanceof Date)) {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const camelKey = snakeToCamel(key);
      // Preserve the original snake_case key too, so legacy field reads keep working.
      if (!(key in out)) out[camelKey] = camelize(value);
      if (camelKey !== key) out[key] = out[camelKey];
    }
    return out;
  }
  return input;
}

function unwrap(envelope: any) {
  let data: any;
  if (Array.isArray(envelope)) data = envelope;
  else if (envelope?.status === 'success' && envelope?.data !== undefined) data = envelope.data;
  else data = envelope?.data ?? envelope;
  return camelize(data);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const envelope = await res.json();
  const data = unwrap(envelope);
  if (data.user?.role !== 'admin') throw new Error('Access denied. Admin privileges required.');
  const token = data.access_token ?? data.token;
  if (token) localStorage.setItem('token', token);
  return data;
}

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/admin/dashboard`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return unwrap(await res.json());
}

export async function getUsers(params?: { date_from?: string; date_to?: string }) {
  const query = new URLSearchParams();
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to) query.set('date_to', params.date_to);
  const qs = query.toString();
  const url = `${API_URL}/users${qs ? '?' + qs : ''}`;
  const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return unwrap(await res.json());
}

export async function getUser(id: number) {
  const res = await fetch(`${API_URL}/users/${id}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user');
  return unwrap(await res.json());
}

export async function getUserOnboarding(userId: number) {
  const res = await fetch(`${API_URL}/onboarding/admin/${userId}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) return null;
  const data = unwrap(await res.json());
  return data?.onboarding ?? null;
}

export async function setBalance(id: number, amount: number) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ balance: amount }),
  });
  if (!res.ok) throw new Error('Failed to set balance');
  return unwrap(await res.json());
}

export async function adminUpdateUser(id: number, data: { password?: string; passwordConfirmation?: string }) {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to update user');
  }
  return unwrap(await res.json());
}

export async function getPendingTransactions() {
  const res = await fetch(`${API_URL}/deposit?status=pending`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const raw = await res.json();
  const data = unwrap(raw);
  const deposits = data?.deposits?.data ?? data?.deposits ?? data ?? [];
  return Array.isArray(deposits) ? deposits : [];
}

export async function getDepositsByStatus(status: string) {
  const res = await fetch(`${API_URL}/deposit?status=${status}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch deposits');
  const raw = await res.json();
  const data = unwrap(raw);
  const deposits = data?.deposits?.data ?? data?.deposits ?? data ?? [];
  return Array.isArray(deposits) ? deposits : [];
}

export async function approveTransaction(id: number) {
  const res = await fetch(`${API_URL}/deposit/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'approved' }),
  });
  if (!res.ok) throw new Error('Failed to approve transaction');
  return unwrap(await res.json());
}

export async function rejectTransaction(id: number) {
  const res = await fetch(`${API_URL}/deposit/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'rejected' }),
  });
  if (!res.ok) throw new Error('Failed to reject transaction');
  return unwrap(await res.json());
}

export async function deleteTransaction(id: number) {
  const res = await fetch(`${API_URL}/deposit/${id}`, { method: 'DELETE', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete transaction');
  return unwrap(await res.json());
}

export async function createUser(data: { name: string; email: string; password: string; balance?: number; isAdmin?: boolean }) {
  let userId: number;

  if (data.isAdmin) {
    const res = await fetch(`${API_URL}/admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to create admin');
    }
    const result = unwrap(await res.json());
    userId = result.admin?.id;
  } else {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to create user');
    }
    const result = unwrap(await res.json());
    userId = result.user?.id;
  }

  if (!userId) throw new Error('Failed to get new user ID');

  if (data.balance && data.balance > 0) {
    await setBalance(userId, data.balance);
  }

  return { id: userId };
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}

export async function getArbitrageHostings() {
  const res = await fetch(`${API_URL}/admin/arbitrage/hostings`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch hostings');
  return unwrap(await res.json());
}

export async function terminateHosting(id: number) {
  const res = await fetch(`${API_URL}/admin/arbitrage/hostings/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'ended' }),
  });
  if (!res.ok) throw new Error('Failed to terminate hosting');
  return unwrap(await res.json());
}

export async function getMiningHostings() {
  const res = await fetch(`${API_URL}/admin/mining/hostings`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch mining hostings');
  return unwrap(await res.json());
}

export async function terminateMiningHosting(id: number) {
  const res = await fetch(`${API_URL}/admin/mining/hostings/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'ended' }),
  });
  if (!res.ok) throw new Error('Failed to terminate mining hosting');
  return unwrap(await res.json());
}

export async function getPendingVerifications() {
  const res = await fetch(`${API_URL}/kyc-submissions?status=pending`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch pending verifications');
  const raw = await res.json();
  const data = unwrap(raw);
  const submissions = data?.submissions?.data ?? data?.submissions ?? data?.data ?? data ?? [];
  return Array.isArray(submissions) ? submissions : [];
}

export async function approveVerification(id: number) {
  const res = await fetch(`${API_URL}/kyc-submissions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'approved' }),
  });
  if (!res.ok) throw new Error('Failed to approve verification');
  return unwrap(await res.json());
}

export async function rejectVerification(id: number) {
  const res = await fetch(`${API_URL}/kyc-submissions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'rejected' }),
  });
  if (!res.ok) throw new Error('Failed to reject verification');
  return unwrap(await res.json());
}

export async function setTradeMode(id: number, mode: 'REAL' | 'ALWAYS_WIN' | 'ALWAYS_LOSS') {
  const userRes = await fetch(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
  const userData = unwrap(await userRes.json());
  const profileId = userData?.profiles?.[0]?.id ?? id;

  const tradeStatus = mode === 'ALWAYS_WIN' ? 'win' : mode === 'ALWAYS_LOSS' ? 'loss' : 'normal';
  const res = await fetch(`${API_URL}/admin/profiles/${profileId}/trade-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ trade_status: tradeStatus }),
  });
  if (!res.ok) throw new Error('Failed to update trade mode');
  return unwrap(await res.json());
}

export async function getPendingLoans() {
  const res = await fetch(`${API_URL}/admin/loans?status=pending`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch pending loans');
  return unwrap(await res.json());
}

export async function approveLoan(id: number) {
  const res = await fetch(`${API_URL}/admin/loans/${id}/approve`, { method: 'POST', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to approve loan');
  return unwrap(await res.json());
}

export async function rejectLoan(id: number, reason = 'Rejected by admin') {
  const res = await fetch(`${API_URL}/admin/loans/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject loan');
  return unwrap(await res.json());
}

export async function getActiveTrades(userId: number) {
  const res = await fetch(`${API_URL}/admin/trades?status=open`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch active trades');
  const envelope = await res.json();
  const data = unwrap(envelope);
  const trades = data?.data ?? data ?? [];
  return Array.isArray(trades) ? trades.filter((t: any) => String(t.user_id) === String(userId)) : [];
}

export async function getTradesByUser(userId: number) {
  const res = await fetch(`${API_URL}/admin/trades?user_id=${userId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch user trades');
  return unwrap(await res.json());
}

export async function getDepositsByUser(userId: number) {
  const res = await fetch(`${API_URL}/deposit`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch user deposits');
  const raw = await res.json();
  const data = unwrap(raw);
  const deposits = data?.deposits?.data ?? data?.deposits ?? data ?? [];
  return Array.isArray(deposits) ? deposits.filter((d: any) => String(d.user_id ?? d.userId) === String(userId)) : [];
}

export async function getLoansByUser(userId: number) {
  const res = await fetch(`${API_URL}/admin/loans`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch user loans');
  const raw = await res.json();
  const data = unwrap(raw);
  const loans = data?.data ?? data ?? [];
  return Array.isArray(loans) ? loans.filter((l: any) => String(l.user_id ?? l.userId) === String(userId)) : [];
}

export async function getKycByUser(userId: number) {
  const res = await fetch(`${API_URL}/kyc-submissions`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch user KYC');
  const raw = await res.json();
  const data = unwrap(raw);
  const submissions = data?.submissions?.data ?? data?.submissions ?? data?.data ?? data ?? [];
  return Array.isArray(submissions) ? submissions.filter((k: any) => String(k.user_id ?? k.userId) === String(userId)) : [];
}

export async function forceTradeOutcome(tradeId: number, outcome: 'WIN' | 'LOSS') {
  const res = await fetch(`${API_URL}/admin/trades/${tradeId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ result: outcome === 'WIN' ? 'won' : 'lost' }),
  });
  if (!res.ok) throw new Error('Failed to force trade outcome');
  return unwrap(await res.json());
}

export async function deleteTrade(tradeId: number) {
  const res = await fetch(`${API_URL}/admin/trades/${tradeId}/cancel`, { method: 'POST', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete trade');
  return unwrap(await res.json());
}

export async function upgradeUserLevel(profileId: number) {
  const res = await fetch(`${API_URL}/admin/profiles/${profileId}/upgrade-level`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to upgrade user level');
  }
  return unwrap(await res.json());
}

export async function resetWithdrawalPin(profileId: number, password?: string) {
  const res = await fetch(`${API_URL}/admin/profiles/${profileId}/reset-withdrawal-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to set withdrawal PIN');
  }
  return unwrap(await res.json());
}

export async function setUserLevel(profileId: number, level: number) {
  const res = await fetch(`${API_URL}/admin/profiles/${profileId}/level`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to set user level');
  }
  return unwrap(await res.json());
}

// ---- Overview aggregates ----

/** All open trades across the platform (admin view). */
export async function getOpenTrades() {
  const res = await fetch(`${API_URL}/admin/trades?status=open`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch open trades');
  const data = unwrap(await res.json());
  const trades = data?.data ?? data ?? [];
  return Array.isArray(trades) ? trades : [];
}

/** Every deposit (any status) — used for platform volume stats. */
export async function getAllDeposits() {
  const res = await fetch(`${API_URL}/deposit`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch deposits');
  const data = unwrap(await res.json());
  const deposits = data?.deposits?.data ?? data?.deposits ?? data ?? [];
  return Array.isArray(deposits) ? deposits : [];
}

/** All support tickets (admin sees every user's tickets). Returns the ticket array. */
export async function getSupportTickets() {
  const res = await fetch(`${API_URL}/support-tickets?perPage=100`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch support tickets');
  const data = unwrap(await res.json());
  const list = data?.tickets?.data ?? data?.tickets ?? data?.data ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

/** A single ticket with its full message thread. */
export async function getSupportTicket(id: number) {
  const res = await fetch(`${API_URL}/support-tickets/${id}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch ticket');
  const data = unwrap(await res.json());
  return data?.ticket ?? data;
}

/** Send an admin reply to a ticket. */
export async function sendSupportMessage(ticketId: number, message: string, files?: File[]) {
  if (files && files.length > 0) {
    const fd = new FormData();
    fd.append('message', message);
    files.forEach((f) => fd.append('attachments', f));
    const res = await fetch(`${API_URL}/support-tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: fd,
    });
    if (!res.ok) throw new Error('Failed to send message');
    return unwrap(await res.json());
  }
  const res = await fetch(`${API_URL}/support-tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return unwrap(await res.json());
}

/** Mark the given message ids as read (clears the unread badge). */
export async function markSupportRead(messageIds: number[]) {
  if (!messageIds.length) return;
  await fetch(`${API_URL}/support-tickets/messages/mark-as-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ messageIds }),
  }).catch(() => {});
}

/** Unread support messages awaiting an admin reply (for the nav notification badge). */
export async function getSupportUnreadCount(): Promise<number> {
  const res = await fetch(`${API_URL}/support-tickets/messages/unread-count`, { headers: getAuthHeader() });
  if (!res.ok) return 0;
  const data = unwrap(await res.json());
  return Number(data?.unreadCount ?? data?.unread_count ?? data?.count ?? 0) || 0;
}

// ---- Crypto deposit addresses ----

export interface CryptoAddress {
  id: number;
  currency: string;
  network: string;
  address: string;
  notes?: string | null;
  qrCode?: string | null;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

/** All crypto deposit addresses (admin view). Backend paginates, so we unwrap the list. */
export async function getCryptoAddresses(): Promise<CryptoAddress[]> {
  const res = await fetch(`${API_URL}/admin/crypto-addresses?per_page=100`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch crypto addresses');
  const data = unwrap(await res.json());
  const list = data?.addresses?.data ?? data?.addresses ?? data?.data ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function createCryptoAddress(data: {
  currency: string;
  network: string;
  address: string;
  notes?: string;
}) {
  const res = await fetch(`${API_URL}/admin/crypto-addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create address');
  }
  return unwrap(await res.json());
}

export async function updateCryptoAddress(
  id: number,
  data: { address?: string; notes?: string; is_active?: boolean },
) {
  const res = await fetch(`${API_URL}/admin/crypto-addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to update address');
  }
  return unwrap(await res.json());
}

export async function deleteCryptoAddress(id: number) {
  const res = await fetch(`${API_URL}/admin/crypto-addresses/${id}`, { method: 'DELETE', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete address');
  return unwrap(await res.json());
}

// ---- Deleted Accounts ----

export interface DeletedAccount {
  id: number;
  originalUserId: number;
  name: string;
  email: string | null;
  phone: string | null;
  balance: string | number;
  role: string;
  reason: string | null;
  deletedAt: string;
  deletedByIp: string | null;
}

export async function getDeletedAccounts(): Promise<DeletedAccount[]> {
  const res = await fetch(`${API_URL}/admin/deleted-accounts`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch deleted accounts');
  const data = unwrap(await res.json());
  const list = data?.deletedAccounts?.data ?? data?.deleted_accounts?.data ?? data?.deletedAccounts ?? data?.deleted_accounts ?? data?.data ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

/** Every loan (any status). */
export async function getAllLoans() {
  const res = await fetch(`${API_URL}/admin/loans`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch loans');
  const data = unwrap(await res.json());
  const loans = data?.data ?? data ?? [];
  return Array.isArray(loans) ? loans : [];
}

// ---- Withdrawals ----

export async function getPendingWithdrawals() {
  const res = await fetch(`${API_URL}/withdrawals?status=pending`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch pending withdrawals');
  const raw = await res.json();
  const data = unwrap(raw);
  const list = data?.withdrawals?.data ?? data?.withdrawals ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function getWithdrawalsByStatus(status: string) {
  const res = await fetch(`${API_URL}/withdrawals?status=${status}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch withdrawals');
  const raw = await res.json();
  const data = unwrap(raw);
  const list = data?.withdrawals?.data ?? data?.withdrawals ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function approveWithdrawal(id: number) {
  const res = await fetch(`${API_URL}/withdrawals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'approved' }),
  });
  if (!res.ok) throw new Error('Failed to approve withdrawal');
  return unwrap(await res.json());
}

export async function rejectWithdrawal(id: number, rejectionReason?: string) {
  const res = await fetch(`${API_URL}/withdrawals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status: 'rejected', rejectionReason: rejectionReason || 'Rejected by admin' }),
  });
  if (!res.ok) throw new Error('Failed to reject withdrawal');
  return unwrap(await res.json());
}

export async function deleteWithdrawal(id: number) {
  const res = await fetch(`${API_URL}/withdrawals/${id}`, { method: 'DELETE', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete withdrawal');
  return unwrap(await res.json());
}

export interface AdminNotification {
  id: number;
  userId: number;
  adminId: number;
  title: string;
  message: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export async function sendUserNotification(userId: number, data: { title: string; message: string; image?: File | null }) {
  if (data.image) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('message', data.message);
    formData.append('image', data.image);
    
    const res = await fetch(`${API_URL}/admin/users/${userId}/notifications`, {
      method: 'POST',
      headers: { ...getAuthHeader() }, // Don't set Content-Type for FormData
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to send notification');
    }
    return unwrap(await res.json());
  } else {
    const res = await fetch(`${API_URL}/admin/users/${userId}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to send notification');
    }
    return unwrap(await res.json());
  }
}

// ---- News ----

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string;
  source: string;
  source_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export async function getAdminNews(params?: { page?: number; limit?: number; source?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.source) query.set('source', params.source);
  const qs = query.toString();
  const url = `${API_URL}/admin/news${qs ? '?' + qs : ''}`;
  const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch articles');
  return unwrap(await res.json());
}

export async function getAdminNewsArticle(id: number) {
  const res = await fetch(`${API_URL}/admin/news/${id}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch article');
  return unwrap(await res.json());
}

export async function createAdminNewsArticle(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  author?: string;
  is_published?: boolean;
}) {
  const res = await fetch(`${API_URL}/admin/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create article');
  }
  return unwrap(await res.json());
}

export async function updateAdminNewsArticle(
  id: number,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    image_url?: string;
    author?: string;
    is_published?: boolean;
  }
) {
  const res = await fetch(`${API_URL}/admin/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to update article');
  }
  return unwrap(await res.json());
}

export async function deleteAdminNewsArticle(id: number) {
  const res = await fetch(`${API_URL}/admin/news/${id}`, { method: 'DELETE', headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to delete article');
  return unwrap(await res.json());
}

export async function uploadNewsImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}/admin/news/upload-image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = unwrap(await res.json());
  return data.url;
}

export async function getUserNotifications(userId: number) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/notifications`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const raw = await res.json();
  const data = unwrap(raw);
  return (data?.notifications ?? data ?? []) as AdminNotification[];
}

// ---- Referrals ----

export async function getReferralStats() {
  const res = await fetch(`${API_URL}/referral/admin/referrals/stats`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch referral stats');
  return unwrap(await res.json());
}

export async function getReferralCommissions(status?: string) {
  const qs = status ? `?status=${status}` : '';
  const res = await fetch(`${API_URL}/referral/admin/referrals${qs}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch referrals');
  const data = unwrap(await res.json());
  return (data?.referrals ?? []) as any[];
}

export async function getUserReferral(userId: number) {
  const res = await fetch(`${API_URL}/referral/admin/referral/user/${userId}`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) return null;
  const data = unwrap(await res.json());
  return data?.referral ?? null;
}

export async function approveCommission(commissionId: number) {
  const res = await fetch(`${API_URL}/referral/admin/referral-commissions/${commissionId}/approve`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to approve commission');
  }
  return unwrap(await res.json());
}

// ---- User Accounts & Assets (admin) ----

export interface UserAccounts {
  fast_trade: number;
  spot: number;
  trading: number;
  total: number;
}

export interface UserAsset {
  id: number;
  symbol: string;
  name: string | null;
  amount: number;
  current_price: number;
  current_value: number;
  avg_purchase_price: number;
  last_updated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function getUserAccounts(userId: number): Promise<UserAccounts> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/accounts`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user accounts');
  return unwrap(await res.json());
}

export async function setUserAccountBalance(userId: number, type: 'fast_trade' | 'spot' | 'trading', amount: number) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/accounts/${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ balance: amount }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to update account balance');
  }
  return unwrap(await res.json());
}

export async function getUserAssets(userId: number): Promise<{ assets: UserAsset[]; total_value: number; count: number }> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/assets`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user assets');
  return unwrap(await res.json());
}

export async function createUserAsset(userId: number, data: { symbol: string; name?: string; amount: number; current_price?: number; avg_purchase_price?: number }) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create asset');
  }
  return unwrap(await res.json());
}

export async function updateUserAsset(userId: number, assetId: number, data: { amount?: number; current_price?: number; avg_purchase_price?: number; name?: string }) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to update asset');
  }
  return unwrap(await res.json());
}

export async function deleteUserAsset(userId: number, assetId: number) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/assets/${assetId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to delete asset');
  }
  return unwrap(await res.json());
}