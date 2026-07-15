'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getUser, approveTransaction, rejectTransaction, setTradeMode,
  deleteTransaction, getActiveTrades, forceTradeOutcome, deleteTrade,
  getTradesByUser, getDepositsByUser, getLoansByUser, getKycByUser,
  upgradeUserLevel, setUserLevel, resetWithdrawalPin, adminUpdateUser,
  sendUserNotification, getUserNotifications, getUserOnboarding,
  getUserReferral, getUserAccounts, setUserAccountBalance,
  getUserAssets, createUserAsset, updateUserAsset, deleteUserAsset,
} from '@/lib/api';
import type { AdminNotification, UserAsset } from '@/lib/api';
import { UserChatHistory } from '@/components/UserChatHistory';
import {
  ArrowLeft, Shield, Activity, PlayCircle, RefreshCw, Trash2,
  Check, X, Wallet, BarChart3, TrendingUp, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Trophy, Target, ChevronUp, ChevronDown, Lock, Bell, Send,
  Gift, ExternalLink, Coins, Pencil, Plus, TrendingDown, PieChart, Zap,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { StatusBadge, type StatusType } from '@/shared/components/ui/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { SkeletonCard, SkeletonTable } from '@/shared/components/ui/Skeleton';
import { Table, type Column } from '@/shared/components/ui/Table';
import { cn, formatDate, formatDateTime } from '@/shared/lib/utils';

type Toast = { type: 'success' | 'error'; message: string } | null;
type HistoryTab = 'trades' | 'loans' | 'transactions';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [kyc, setKyc] = useState<any>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [tradeBusy, setTradeBusy] = useState(false);
  const [revealPin, setRevealPin] = useState(false);
  const [levelBusy, setLevelBusy] = useState(false);
  const [tab, setTab] = useState<HistoryTab>('trades');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyImage, setNotifyImage] = useState<File | null>(null);
  const [sendingNotify, setSendingNotify] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [resettingPin, setResettingPin] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [accounts, setAccounts] = useState<{ fast_trade: number; spot: number; trading: number; total: number } | null>(null);
  const [accountEditType, setAccountEditType] = useState<'fast_trade' | 'spot' | 'trading' | null>(null);
  const [accountEditAmount, setAccountEditAmount] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [assetTotalValue, setAssetTotalValue] = useState(0);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<UserAsset | null>(null);
  const [assetForm, setAssetForm] = useState({ symbol: '', name: '', amount: '', price: '', avgPrice: '' });
  const [savingAsset, setSavingAsset] = useState(false);

  const userId = Number(params.id);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await getUserAccounts(userId);
      setAccounts(data);
    } catch { /* ignore */ }
  }, [userId]);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getUserAssets(userId);
      setAssets(data.assets || []);
      setAssetTotalValue(data.total_value || 0);
    } catch { /* ignore */ }
  }, [userId]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, tradesRaw, depositsRaw, loansRaw, kycRaw] = await Promise.all([
        getUser(userId),
        getTradesByUser(userId).catch(() => []),
        getDepositsByUser(userId).catch(() => []),
        getLoansByUser(userId).catch(() => []),
        getKycByUser(userId).catch(() => []),
      ]);
      setUser(userData);
      const tradesVal = Array.isArray(tradesRaw) ? tradesRaw : (tradesRaw as any)?.data ?? [];
      setTrades(Array.isArray(tradesVal) ? tradesVal : []);
      const txVal = Array.isArray(depositsRaw) ? depositsRaw : (depositsRaw as any)?.data ?? [];
      setTransactions(Array.isArray(txVal) ? txVal : []);
      const loansVal = Array.isArray(loansRaw) ? loansRaw : (loansRaw as any)?.data ?? [];
      setLoans(Array.isArray(loansVal) ? loansVal : []);
      const kycList = Array.isArray(kycRaw) ? kycRaw : (kycRaw as any)?.data ?? [];
      setKyc(kycList.length > 0 ? kycList[0] : null);
      getUserOnboarding(userId).then(setOnboarding).catch(() => {});
      getUserReferral(userId).then(setReferral).catch(() => {});
      fetchAccounts();
      fetchAssets();
    } catch {
      notify('error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId, notify, fetchAccounts, fetchAssets]);

  const fetchActiveTradesData = useCallback(() => {
    getActiveTrades(userId).then(setActiveTrades).catch(console.error);
  }, [userId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  useEffect(() => {
    if (user) fetchActiveTradesData();
    const interval = setInterval(fetchActiveTradesData, 3000);
    return () => clearInterval(interval);
  }, [user, fetchActiveTradesData]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountEditType) return;
    setSavingAccount(true);
    try {
      await setUserAccountBalance(userId, accountEditType, Number(accountEditAmount));
      setAccountEditType(null);
      setAccountEditAmount('');
      fetchAccounts();
      notify('success', `${accountEditType.replace('_', ' ')} balance updated`);
    } catch (error: any) {
      notify('error', error.message || 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const openAssetModal = (asset?: UserAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        symbol: asset.symbol,
        name: asset.name || '',
        amount: String(asset.amount),
        price: String(asset.current_price),
        avgPrice: String(asset.avg_purchase_price),
      });
    } else {
      setEditingAsset(null);
      setAssetForm({ symbol: '', name: '', amount: '', price: '', avgPrice: '' });
    }
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAsset(true);
    try {
      const payload = {
        symbol: assetForm.symbol.toUpperCase(),
        name: assetForm.name || assetForm.symbol.toUpperCase(),
        amount: Number(assetForm.amount),
        current_price: Number(assetForm.price),
        avg_purchase_price: Number(assetForm.avgPrice || assetForm.price),
      };
      if (editingAsset) {
        await updateUserAsset(userId, editingAsset.id, payload);
      } else {
        await createUserAsset(userId, payload);
      }
      setIsAssetModalOpen(false);
      setEditingAsset(null);
      fetchAssets();
      notify('success', editingAsset ? 'Asset updated' : 'Asset created');
    } catch (error: any) {
      notify('error', error.message || 'Failed to save asset');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await deleteUserAsset(userId, assetId);
      fetchAssets();
      notify('success', 'Asset deleted');
    } catch (error: any) {
      notify('error', error.message || 'Failed to delete asset');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValue !== passwordConfirm) {
      return notify('error', 'Passwords do not match');
    }
    if (passwordValue.length < 8) {
      return notify('error', 'Password must be at least 8 characters');
    }
    setSavingPassword(true);
    try {
      await adminUpdateUser(userId, { password: passwordValue, passwordConfirmation: passwordConfirm });
      setIsPasswordModalOpen(false);
      setPasswordValue('');
      setPasswordConfirm('');
      notify('success', 'Password changed successfully');
    } catch (error: any) {
      notify('error', error.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const list = await getUserNotifications(userId);
      setNotifications(list);
    } catch { /* ignore */ }
    finally { setNotificationsLoading(false); }
  }, [userId]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user, loadNotifications]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotify(true);
    try {
      await sendUserNotification(userId, { title: notifyTitle, message: notifyMessage, image: notifyImage });
      setIsNotifyModalOpen(false);
      setNotifyTitle('');
      setNotifyMessage('');
      setNotifyImage(null);
      notify('success', 'Notification sent successfully');
      loadNotifications();
    } catch (error: any) {
      notify('error', error.message || 'Failed to send notification');
    } finally {
      setSendingNotify(false);
    }
  };

  const handleSetMode = async (mode: 'ALWAYS_WIN' | 'ALWAYS_LOSS' | 'REAL') => {
    setTradeBusy(true);
    try {
      await setTradeMode(userId, mode);
      const userRes = await getUser(userId);
      setUser(userRes);
      notify('success', mode === 'REAL' ? 'Trade mode set to Real' : `Trades forced to ${mode === 'ALWAYS_WIN' ? 'WIN' : 'LOSS'}`);
    } catch {
      notify('error', 'Failed to update trade settings');
    } finally {
      setTradeBusy(false);
    }
  };

  const handleTxApprove = async (id: number) => {
    try { await approveTransaction(id); notify('success', 'Transaction approved'); fetchAllData(); }
    catch { notify('error', 'Failed to approve'); }
  };
  const handleTxReject = async (id: number) => {
    try { await rejectTransaction(id); notify('success', 'Transaction rejected'); fetchAllData(); }
    catch { notify('error', 'Failed to reject'); }
  };
  const handleTxDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    try { await deleteTransaction(id); notify('success', 'Transaction deleted'); fetchAllData(); }
    catch { notify('error', 'Failed to delete transaction'); }
  };
  const handleForce = async (tradeId: number, outcome: 'WIN' | 'LOSS') => {
    try { await forceTradeOutcome(tradeId, outcome); notify('success', `Trade forced to ${outcome}`); fetchActiveTradesData(); fetchAllData(); }
    catch { notify('error', 'Failed to force outcome'); }
  };
  const handleTradeDelete = async (tradeId: number) => {
    if (!confirm('Delete this trade record?')) return;
    try { await deleteTrade(tradeId); notify('success', 'Trade deleted'); fetchActiveTradesData(); fetchAllData(); }
    catch { notify('error', 'Failed to delete trade'); }
  };

  const handleUpgradeLevel = async () => {
    const profileId = user?.profiles?.[0]?.id;
    if (!profileId) return notify('error', 'Profile not found');
    setLevelBusy(true);
    try {
      const result = await upgradeUserLevel(profileId);
      const userRes = await getUser(userId);
      setUser(userRes);
      notify('success', `Level upgraded to ${result.level} (${result.tier})`);
    } catch (error: any) {
      notify('error', error.message || 'Failed to upgrade level');
    } finally {
      setLevelBusy(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileId = user?.profiles?.[0]?.id;
    if (!profileId) return notify('error', 'Profile not found');
    if (!newPin || newPin.length < 6) return notify('error', 'PIN must be at least 6 characters');
    if (newPin !== confirmPin) return notify('error', 'PINs do not match');
    setResettingPin(true);
    try {
      await resetWithdrawalPin(profileId, newPin);
      const userRes = await getUser(userId);
      setUser(userRes);
      setIsPinModalOpen(false);
      setNewPin('');
      setConfirmPin('');
      notify('success', 'Withdrawal PIN updated successfully');
    } catch (error: any) {
      notify('error', error.message || 'Failed to set withdrawal PIN');
    } finally {
      setResettingPin(false);
    }
  };

  const handleSetLevel = async (newLevel: number) => {
    const profileId = user?.profiles?.[0]?.id;
    if (!profileId) return notify('error', 'Profile not found');
    setLevelBusy(true);
    try {
      const result = await setUserLevel(profileId, newLevel);
      const userRes = await getUser(userId);
      setUser(userRes);
      notify('success', `Level set to ${result.level} (${result.tier})`);
    } catch (error: any) {
      notify('error', error.message || 'Failed to set level');
    } finally {
      setLevelBusy(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen pb-20">
        <main className="container mx-auto p-4 lg:p-8 lg:pt-16 max-w-6xl">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-surface-hover" />
          <SkeletonCard className="mb-6" />
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonTable rows={4} columns={5} />
        </main>
      </div>
    );
  }

  if (!user) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <AlertTriangle size={40} className="opacity-40" />
      <p>User not found</p>
      <Button variant="outline" onClick={() => router.push('/users')}>Back to Users</Button>
    </div>
  );

  const profile = user.profiles?.[0];
  const tradeStatus = profile?.trade_status;
  const userTradeMode = user.tradeMode || (tradeStatus === 'win' ? 'ALWAYS_WIN' : tradeStatus === 'loss' ? 'ALWAYS_LOSS' : 'REAL');
  const isVerified = profile?.kycStatus === 'verified' || user.kycStatus === 'approved' || kyc?.status === 'approved';

  // Derived stats
  const wins = trades.filter((t) => t.outcome === 'WIN' || t.outcome === 'won' || t.result === 'won').length;
  const settled = trades.filter((t) => ['WIN', 'won', 'LOSS', 'lost'].includes(t.outcome) || ['won', 'lost'].includes(t.result)).length;
  const winRate = settled > 0 ? Math.round((wins / settled) * 100) : 0;

  const money = (v: any) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tradeColumns: Column<any>[] = [
    { key: 'asset', header: 'Asset', render: (t) => <span className="font-bold text-foreground">{t.assetSymbol || t.symbol}</span> },
    { key: 'amount', header: 'Amount', render: (t) => <span className="text-foreground">{money(t.amount)}</span> },
    { key: 'outcome', header: 'Outcome', render: (t) => {
      const won = t.outcome === 'WIN' || t.outcome === 'won' || t.result === 'won';
      return <StatusBadge status={won ? 'approved' : 'rejected'} size="xs">{t.outcome || t.result || 'pending'}</StatusBadge>;
    }},
    { key: 'profit', header: 'Profit', render: (t) => {
      const won = t.outcome === 'WIN' || t.outcome === 'won' || t.result === 'won';
      const profit = Number(t.pnl || 0);
      return <span className={`font-bold ${won ? 'text-success' : profit < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{won ? '+' : ''}{money(profit)}</span>;
    }},
    { key: 'date', header: 'Date', render: (t) => <span className="text-muted-foreground">{formatDate(t.openedAt ?? t.opened_at ?? t.createdAt ?? t.created_at)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (t) => (
      <button onClick={() => handleTradeDelete(t.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive" title="Delete Trade"><Trash2 size={16} /></button>
    )},
  ];

  const loanColumns: Column<any>[] = [
    { key: 'id', header: 'ID', render: (l) => <span className="font-mono text-muted-foreground">#{l.id}</span> },
    { key: 'amount', header: 'Amount', render: (l) => <span className="font-bold text-foreground">{money(l.amount)}</span> },
    { key: 'duration', header: 'Duration', render: (l) => <span>{l.duration} months</span> },
    { key: 'status', header: 'Status', render: (l) => {
      const statusMap: Record<string, StatusType> = { approved: 'approved', rejected: 'rejected', paid: 'verified', pending: 'pending' };
      return <StatusBadge status={statusMap[l.status] || 'pending'} size="xs" />;
    }},
    { key: 'date', header: 'Date', render: (l) => <span className="text-muted-foreground">{formatDate(l.createdAt ?? l.created_at)}</span> },
  ];

  const txColumns: Column<any>[] = [
    { key: 'type', header: 'Type', render: (tx) => <span className="font-medium capitalize">{tx.type || 'deposit'}</span> },
    { key: 'amount', header: 'Amount', render: (tx) => {
      const isDeposit = tx.type === 'deposit' || !tx.type;
      return <span className={`font-bold ${isDeposit ? 'text-success' : 'text-foreground'}`}>{isDeposit ? '+' : '-'}{money(tx.amount)}</span>;
    }},
    { key: 'status', header: 'Status', render: (tx) => {
      const s = tx.status === 'approved' ? 'approved' : tx.status === 'rejected' ? 'rejected' : 'pending';
      return <StatusBadge status={s} size="xs" />;
    }},
    { key: 'date', header: 'Date', render: (tx) => <span className="font-mono text-xs text-muted-foreground">{formatDate(tx.createdAt ?? tx.created_at)}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (tx) => (
      <div className="flex justify-end gap-2">
        {tx.status === 'pending' && (
          <>
            <button onClick={() => handleTxApprove(tx.id)} className="rounded-lg bg-success-muted p-1.5 text-success transition-colors hover:bg-success/20" title="Approve"><Check size={16} /></button>
            <button onClick={() => handleTxReject(tx.id)} className="rounded-lg bg-destructive-muted p-1.5 text-destructive transition-colors hover:bg-destructive/20" title="Reject"><X size={16} /></button>
          </>
        )}
        <button onClick={() => handleTxDelete(tx.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive" title="Delete"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  const stats = [
    { label: 'Total Balance', value: money(accounts?.total ?? 0), icon: Wallet, tone: 'text-primary', bg: 'bg-primary-muted' },
    { label: 'Total Trades', value: String(trades.length), icon: BarChart3, tone: 'text-info', bg: 'bg-info-muted' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, tone: 'text-success', bg: 'bg-success-muted' },
    { label: 'Asset Value', value: money(assetTotalValue), icon: Coins, tone: 'text-warning', bg: 'bg-warning-muted' },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Toast */}
      {toast && (
        <div className="animate-rise fixed bottom-6 left-1/2 z-[600] -translate-x-1/2">
          <div className={cn(
            'glass-strong flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-glass-lg',
            toast.type === 'success' ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'
          )}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <main className="animate-rise container mx-auto p-4 lg:p-8 lg:pt-16 max-w-6xl">
        <button onClick={() => router.back()} className="group mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Back to Users
        </button>

        {/* Hero */}
        <Card padding="lg" className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary opacity-[0.07] blur-3xl" />
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-active text-2xl font-extrabold text-primary-foreground shadow-glass">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">{user.name || 'No Name'}</h1>
                <p className="mb-3 font-mono text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={isVerified ? 'verified' : 'pending'} dot>{isVerified ? 'Verified' : 'Pending KYC'}</StatusBadge>
                  {user.role === 'admin' && <StatusBadge status="admin" dot />}
                  {userTradeMode === 'ALWAYS_WIN' && <StatusBadge status="approved" size="sm">Forced Win</StatusBadge>}
                  {userTradeMode === 'ALWAYS_LOSS' && <StatusBadge status="rejected" size="sm">Forced Loss</StatusBadge>}
                  <StatusBadge status="active" dot>Lv.{profile?.level ?? 1}</StatusBadge>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:w-auto md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Withdraw PIN</span>
                <button
                  onClick={() => setRevealPin((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-surface px-2 py-0.5 font-mono text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  {revealPin ? (profile?.withdrawalPassword || user.withdrawPassword || 'Not set') : '••••••'}
                  {revealPin ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="rounded-lg border border-border-light bg-surface px-2 py-0.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
                >
                  Set
                </button>
              </div>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                <div className="flex items-center gap-1 rounded-xl border border-border-light bg-surface-hover/50 px-2 py-1 self-start">
                  <span className="mr-1 text-xs font-bold uppercase text-muted-foreground">Lv.</span>
                  <span className="min-w-[1.2rem] text-center font-bold text-foreground">{profile?.level ?? 1}</span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleSetLevel(Math.min(3, (profile?.level ?? 1) + 1))}
                      disabled={levelBusy || (profile?.level ?? 1) >= 3}
                      className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => handleSetLevel(Math.max(1, (profile?.level ?? 1) - 1))}
                      disabled={levelBusy || (profile?.level ?? 1) <= 1}
                      className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)} leftIcon={<Lock size={16} />} className="w-full sm:w-auto">
                    Change Password
                  </Button>
                  <Button variant="outline" onClick={() => setIsNotifyModalOpen(true)} leftIcon={<Bell size={16} />} className="w-full sm:w-auto">
                    Send Notification
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Trade outcome control */}
          <div className="mt-8 border-t border-border-light pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Activity size={18} className="text-muted-foreground" />
                Trade Outcome Control
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap sm:gap-1">
                <SegBtn active={userTradeMode === 'ALWAYS_WIN'} tone="win" busy={tradeBusy} onClick={() => handleSetMode('ALWAYS_WIN')} icon={<TrendingUp size={15} />}>Force Win</SegBtn>
                <SegBtn active={userTradeMode === 'REAL'} tone="real" busy={tradeBusy} onClick={() => handleSetMode('REAL')} icon={<Target size={15} />}>Real</SegBtn>
                <SegBtn active={userTradeMode === 'ALWAYS_LOSS'} tone="loss" busy={tradeBusy} onClick={() => handleSetMode('ALWAYS_LOSS')} icon={<TrendingDown size={15} />}>Force Loss</SegBtn>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-right">This overrides the outcome of every new trade for this user.</p>
          </div>
        </Card>

        {/* Trade Accounts */}
        <Card padding="lg" className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Wallet size={20} className="text-muted-foreground" /> Trade Accounts
            </h3>
            <span className="text-sm font-bold text-foreground">Total: {money(accounts?.total ?? 0)}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {([
              { key: 'fast_trade' as const, label: 'Fast Trade', sub: 'Options & primary wallet', icon: Zap, color: 'border-warning/30 bg-warning/5', textColor: 'text-warning', iconBg: 'bg-warning-muted' },
              { key: 'spot' as const, label: 'Spot', sub: 'Coin-to-coin swaps', icon: Coins, color: 'border-primary/30 bg-primary/5', textColor: 'text-primary', iconBg: 'bg-primary-muted' },
              { key: 'trading' as const, label: 'Trading', sub: 'Contracts & leverage', icon: BarChart3, color: 'border-info/30 bg-info/5', textColor: 'text-info', iconBg: 'bg-info-muted' },
            ]).map(({ key, label, sub, icon: Icon, color, textColor, iconBg }) => (
              <div key={key} className={`relative rounded-2xl border p-5 transition-all hover:shadow-glass ${color}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon size={20} className={textColor} />
                  </div>
                  <button
                    onClick={() => { setAccountEditType(key); setAccountEditAmount(String(accounts?.[key] ?? 0)); }}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    title={`Edit ${label} balance`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={`mt-1 text-2xl font-extrabold tracking-tight ${textColor}`}>{money(accounts?.[key] ?? 0)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Assets Portfolio */}
        <Card padding="lg" className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <PieChart size={20} className="text-muted-foreground" /> Asset Holdings
              <span className="ml-1 rounded-full bg-surface-hover px-2 py-0.5 text-xs font-bold text-muted-foreground">{assets.length}</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">Value: {money(assetTotalValue)}</span>
              <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => openAssetModal()}>Add Asset</Button>
            </div>
          </div>
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-light py-10 text-center">
              <Coins size={36} className="mb-2 text-subtle-foreground opacity-40" />
              <p className="text-sm font-medium text-muted-foreground">No assets held</p>
              <p className="mt-1 text-xs text-muted-foreground">Add crypto assets for this user</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4">Asset</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3 pr-4 text-right">Avg Price</th>
                    <th className="pb-3 pr-4 text-right">Current</th>
                    <th className="pb-3 pr-4 text-right">Value</th>
                    <th className="pb-3 text-right">P&L</th>
                    <th className="pb-3 text-right w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => {
                    const pnl = a.current_value - (a.amount * a.avg_purchase_price);
                    const pnlPct = a.avg_purchase_price > 0 ? ((a.current_price - a.avg_purchase_price) / a.avg_purchase_price * 100) : 0;
                    const isUp = pnl >= 0;
                    return (
                      <tr key={a.id} className="border-b border-border-light/50 transition-colors hover:bg-surface-hover/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted text-xs font-bold text-primary">{a.symbol.slice(0, 3)}</div>
                            <div>
                              <span className="font-bold text-foreground">{a.symbol}</span>
                              {a.name && <span className="ml-1.5 text-xs text-muted-foreground">{a.name}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-foreground">{Number(a.amount).toFixed(8)}</td>
                        <td className="py-3 pr-4 text-right font-mono text-muted-foreground">${Number(a.avg_purchase_price).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-right font-mono text-foreground">${Number(a.current_price).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-right font-mono font-bold text-foreground">{money(a.current_value)}</td>
                        <td className={`py-3 text-right font-mono font-bold ${isUp ? 'text-success' : 'text-destructive'}`}>
                          {isUp ? '+' : ''}{money(pnl)}<span className="ml-1 text-[10px] opacity-70">({isUp ? '+' : ''}{pnlPct.toFixed(1)}%)</span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openAssetModal(a)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground" title="Edit"><Pencil size={13} /></button>
                            <button onClick={() => handleDeleteAsset(a.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive-muted hover:text-destructive" title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} padding="md" className="flex items-center gap-3">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', s.bg, s.tone)}>
                <s.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="truncate text-xl font-extrabold text-foreground">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Active trades */}
            <Card padding="none" className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
                <h3 className="flex items-center gap-2 font-bold text-foreground"><PlayCircle className="text-success" size={20} /> Active Trades</h3>
                <button onClick={fetchActiveTradesData} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-hover" title="Refresh">
                  <RefreshCw size={16} />
                </button>
              </div>
              {activeTrades.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No active trades currently running.</div>
              ) : (
                <div className="divide-y divide-border-light">
                  {activeTrades.map((trade) => {
                    const isBuy = trade.type === 'call' || trade.type === 'buy';
                    return (
                      <div key={trade.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold', isBuy ? 'bg-success-muted text-success' : 'bg-destructive-muted text-destructive')}>
                            {isBuy ? 'BUY' : 'SELL'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground">{trade.assetSymbol || trade.symbol}</div>
                            <div className="font-mono text-xs text-muted-foreground">{money(trade.amount)} &bull; {trade.durationSeconds || trade.duration || 0}s</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleForce(trade.id, 'WIN')} className="flex-1 rounded-lg bg-success-muted px-3 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success/20 sm:flex-none">Force WIN</button>
                          <button onClick={() => handleForce(trade.id, 'LOSS')} className="flex-1 rounded-lg bg-destructive-muted px-3 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20 sm:flex-none">Force LOSS</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Tabbed history */}
            <div>
              <div className="mb-3 flex flex-wrap gap-1 rounded-2xl border border-glass-border bg-glass-bg p-1 shadow-glass">
                {([['trades', 'Trades', trades.length], ['loans', 'Loans', loans.length], ['transactions', 'Transactions', transactions.length]] as const).map(([key, label, count]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                      tab === key ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label} <span className="ml-1 opacity-60">{count}</span>
                  </button>
                ))}
              </div>

              {tab === 'trades' && (
                <Table columns={tradeColumns} data={trades} keyExtractor={(t) => t.id} emptyState="No trade history available." />
              )}
              {tab === 'loans' && (
                <Table columns={loanColumns} data={loans} keyExtractor={(l) => l.id} emptyState="No loan history available." />
              )}
              {tab === 'transactions' && (
                <Table columns={txColumns} data={transactions.slice(0, 25)} keyExtractor={(tx) => tx.id} emptyState="No transactions available." />
              )}
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            {/* Notifications Card — top */}
            <Card padding="none" className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
                <h3 className="flex items-center gap-2 font-bold text-foreground">
                  <Bell size={18} className="text-muted-foreground" /> Notifications
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{notifications.filter((n) => !n.isRead).length} unread</span>
                </h3>
                <button onClick={loadNotifications} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface-hover" title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>
              {notificationsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-hover" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell size={28} className="mb-2 text-subtle-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">No notifications sent yet</p>
                </div>
              ) : (
                <div className="max-h-80 divide-y divide-border-light overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-surface-hover ${!n.isRead ? 'border-l-2 border-primary bg-primary/[0.02]' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-bold ${n.isRead ? 'text-foreground' : 'text-foreground'}`}>{n.title}</span>
                        <span className={`shrink-0 text-[10px] font-semibold uppercase ${n.isRead ? 'text-muted-foreground' : 'text-primary'}`}>{n.isRead ? 'Read' : 'New'}</span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                      <span className="mt-0.5 text-[10px] font-medium text-subtle-foreground">{formatDateTime(n.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <UserChatHistory userId={user.id} userName={user.name} />

            <Card padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Gift size={20} className="text-muted-foreground" /> Referral
              </h3>
              {referral ? (
                <div className="space-y-3">
                  <div className="space-y-3 rounded-2xl bg-surface-hover/60 p-4">
                    {referral.inviteCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Invite Code</span>
                        <code className="rounded-lg bg-background px-2 py-1 font-mono text-sm font-bold text-foreground">
                          {referral.inviteCode}
                        </code>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Referred By</span>
                      <span className="text-sm font-semibold text-foreground">
                        {referral.referredBy ? (
                          <a href={`/users/${referral.referredBy.userId}`} className="text-primary hover:underline inline-flex items-center gap-1">
                            {referral.referredBy.name} <ExternalLink size={12} />
                          </a>
                        ) : 'Direct signup'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Referrals Made</span>
                      <span className="text-sm font-bold text-foreground">{referral.referralCount}</span>
                    </div>
                    <div className="flex justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Commissions Earned</span>
                      <span className="text-sm font-bold text-success">
                        ${Number(referral.totalCommissionsEarned || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  {referral.commissions?.length > 0 && (
                    <div className="max-h-32 overflow-y-auto divide-y divide-border-light rounded-2xl bg-surface-hover/30">
                      {referral.commissions.slice(0, 5).map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between px-3 py-2 text-xs">
                          <span className="text-muted-foreground">
                            ${Number(c.depositAmount).toLocaleString()} deposit
                          </span>
                          <span className="font-bold text-success">+${Number(c.commissionAmount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <a href="/referrals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    View all commissions <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-light py-8 text-center">
                  <Gift size={32} className="mb-2 text-subtle-foreground opacity-40" />
                  <p className="text-sm font-medium text-muted-foreground">No referral data</p>
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <BarChart3 size={20} className="text-muted-foreground" /> Onboarding
              </h3>
              {onboarding ? (
                <div className="space-y-3">
                  <div className="space-y-3 rounded-2xl bg-surface-hover/60 p-4">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Income Source</span>
                      <span className="text-sm font-semibold text-foreground capitalize">{onboarding.incomeSource}</span>
                    </div>
                    <div className="flex justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Annual Income</span>
                      <span className="text-sm font-semibold text-foreground">{onboarding.annualIncome}</span>
                    </div>
                    <div className="flex justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Employment</span>
                      <span className="text-sm font-semibold text-foreground capitalize">{onboarding.employmentStatus}</span>
                    </div>
                    {onboarding.investmentGoal && (
                      <div className="flex justify-between border-t border-border-light pt-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Goal</span>
                        <span className="text-sm font-semibold text-foreground capitalize text-right max-w-[200px]">{onboarding.investmentGoal}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-light py-8 text-center">
                  <BarChart3 size={32} className="mb-2 text-subtle-foreground opacity-40" />
                  <p className="text-sm font-medium text-muted-foreground">Not completed yet</p>
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Shield size={20} className="text-muted-foreground" /> Identity Verification
              </h3>
              {kyc ? (
                <div className="space-y-4">
                  <div className="space-y-3 rounded-2xl bg-surface-hover/60 p-4">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Type</span>
                      <span className="text-sm font-medium capitalize text-foreground">{kyc.documentType?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground">ID No.</span>
                      <span className="font-mono text-sm text-foreground">{kyc.documentNumber}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-light pt-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
                      <StatusBadge status={kyc.status === 'approved' ? 'approved' : kyc.status === 'rejected' ? 'rejected' : 'pending'} size="xs" />
                    </div>
                  </div>
                  {kyc.status === 'pending' && (
                    <Button variant="outline" fullWidth onClick={() => router.push('/kyc')}>Review Documents</Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-light py-8 text-center">
                  <Shield size={32} className="mb-2 text-subtle-foreground opacity-40" />
                  <p className="text-sm font-medium text-muted-foreground">No documents submitted</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Modal
        open={isPasswordModalOpen}
        onClose={() => { setIsPasswordModalOpen(false); setPasswordValue(''); setPasswordConfirm(''); }}
        title="Change Password"
        description={<>Set a new sign-in password for <strong>{user.name || user.email}</strong>.</>}
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsPasswordModalOpen(false); setPasswordValue(''); setPasswordConfirm(''); }} disabled={savingPassword}>Cancel</Button>
            <Button type="submit" form="password-form" loading={savingPassword}>Change Password</Button>
          </div>
        }
      >
        <form id="password-form" onSubmit={handleChangePassword} className="space-y-6">
          <Input
            label="New Password"
            type={showPasswordField ? 'text' : 'password'}
            required
            minLength={8}
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder="Min. 8 characters"
            leftAdornment={<Lock size={16} />}
            rightAdornment={
              <button type="button" onClick={() => setShowPasswordField((v) => !v)} className="flex items-center text-zinc-400 transition-colors hover:text-foreground" tabIndex={-1}>
                {showPasswordField ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            autoFocus
          />
          <Input
            label="Confirm New Password"
            type={showPasswordConfirm ? 'text' : 'password'}
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Re-enter new password"
            leftAdornment={<Lock size={16} />}
            rightAdornment={
              <button type="button" onClick={() => setShowPasswordConfirm((v) => !v)} className="flex items-center text-zinc-400 transition-colors hover:text-foreground" tabIndex={-1}>
                {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </form>
      </Modal>

      <Modal
        open={isPinModalOpen}
        onClose={() => { setIsPinModalOpen(false); setNewPin(''); setConfirmPin(''); }}
        title="Set Withdrawal PIN"
        description={<>Set a new withdrawal PIN for <strong>{user.name || user.email}</strong>.</>}
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsPinModalOpen(false); setNewPin(''); setConfirmPin(''); }} disabled={resettingPin}>Cancel</Button>
            <Button type="submit" form="pin-form" loading={resettingPin}>Set PIN</Button>
          </div>
        }
      >
        <form id="pin-form" onSubmit={handleResetPin} className="space-y-6">
          <Input
            label="New Withdrawal PIN"
            type={showNewPin ? 'text' : 'password'}
            required
            minLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Min. 6 characters"
            leftAdornment={<Lock size={16} />}
            rightAdornment={
              <button type="button" onClick={() => setShowNewPin((v) => !v)} className="flex items-center text-zinc-400 transition-colors hover:text-foreground" tabIndex={-1}>
                {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            autoFocus
          />
          <Input
            label="Confirm New PIN"
            type={showConfirmPin ? 'text' : 'password'}
            required
            minLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Re-enter new PIN"
            leftAdornment={<Lock size={16} />}
            rightAdornment={
              <button type="button" onClick={() => setShowConfirmPin((v) => !v)} className="flex items-center text-zinc-400 transition-colors hover:text-foreground" tabIndex={-1}>
                {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </form>
      </Modal>

      <Modal
        open={isNotifyModalOpen}
        onClose={() => { setIsNotifyModalOpen(false); setNotifyTitle(''); setNotifyMessage(''); setNotifyImage(null); }}
        title="Send Notification"
        description={<>Send a push notification to <strong>{user.name || user.email}</strong>.</>}
        size="md"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsNotifyModalOpen(false); setNotifyTitle(''); setNotifyMessage(''); setNotifyImage(null); }} disabled={sendingNotify}>Cancel</Button>
            <Button type="submit" form="notify-form" loading={sendingNotify} leftIcon={<Send size={16} />}>Send</Button>
          </div>
        }
      >
        <form id="notify-form" onSubmit={handleSendNotification} className="space-y-6">
          <Input
            label="Title"
            type="text"
            required
            maxLength={255}
            value={notifyTitle}
            onChange={(e) => setNotifyTitle(e.target.value)}
            placeholder="e.g. Account Update"
            leftAdornment={<Bell size={16} />}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Message</label>
            <textarea
              required
              maxLength={5000}
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder="Write your notification message..."
              rows={5}
              className="w-full resize-none rounded-xl border border-border-medium bg-surface px-4 py-3 text-sm text-foreground placeholder:text-subtle-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors duration-200 hover:border-border-dark"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Attachment (Optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNotifyImage(e.target.files[0]);
                } else {
                  setNotifyImage(null);
                }
              }}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
            {notifyImage && (
              <p className="text-[11px] text-muted-foreground mt-1">Selected: {notifyImage.name}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Account Balance Modal */}
      <Modal
        open={!!accountEditType}
        onClose={() => { setAccountEditType(null); setAccountEditAmount(''); }}
        title={`Edit ${accountEditType?.replace('_', ' ') || ''} Balance`}
        description={<>Set the balance for <strong>{user.name || user.email}</strong>'s {accountEditType?.replace('_', ' ')} account.</>}
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => { setAccountEditType(null); setAccountEditAmount(''); }} disabled={savingAccount}>Cancel</Button>
            <Button type="submit" form="account-form" loading={savingAccount}>Save Balance</Button>
          </div>
        }
      >
        <form id="account-form" onSubmit={handleSaveAccount} className="space-y-6">
          <Input
            label="Account Balance"
            type="number"
            step="0.01"
            required
            value={accountEditAmount}
            onChange={(e) => setAccountEditAmount(e.target.value)}
            leftAdornment={<span className="text-lg font-bold text-muted-foreground">$</span>}
            placeholder="0.00"
            autoFocus
          />
        </form>
      </Modal>

      {/* Asset Modal (Add/Edit) */}
      <Modal
        open={isAssetModalOpen}
        onClose={() => { setIsAssetModalOpen(false); setEditingAsset(null); }}
        title={editingAsset ? `Edit ${editingAsset.symbol}` : 'Add Asset'}
        description={editingAsset ? `Update asset holdings for ${user.name || user.email}` : `Add a new crypto asset for ${user.name || user.email}`}
        size="md"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsAssetModalOpen(false); setEditingAsset(null); }} disabled={savingAsset}>Cancel</Button>
            <Button type="submit" form="asset-form" loading={savingAsset}>{editingAsset ? 'Update' : 'Create'} Asset</Button>
          </div>
        }
      >
        <form id="asset-form" onSubmit={handleSaveAsset} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Symbol"
              type="text"
              required
              maxLength={10}
              value={assetForm.symbol}
              onChange={(e) => setAssetForm({ ...assetForm, symbol: e.target.value.toUpperCase() })}
              placeholder="BTC"
              autoFocus
              disabled={!!editingAsset}
            />
            <Input
              label="Name"
              type="text"
              maxLength={100}
              value={assetForm.name}
              onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
              placeholder="Bitcoin"
            />
          </div>
          <Input
            label="Amount (Quantity)"
            type="number"
            step="0.00000001"
            required
            value={assetForm.amount}
            onChange={(e) => setAssetForm({ ...assetForm, amount: e.target.value })}
            placeholder="0.00000000"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Price (USD)"
              type="number"
              step="0.01"
              required
              value={assetForm.price}
              onChange={(e) => setAssetForm({ ...assetForm, price: e.target.value })}
              leftAdornment={<span className="text-sm font-bold text-muted-foreground">$</span>}
              placeholder="0.00"
            />
            <Input
              label="Avg Purchase Price (USD)"
              type="number"
              step="0.01"
              value={assetForm.avgPrice}
              onChange={(e) => setAssetForm({ ...assetForm, avgPrice: e.target.value })}
              leftAdornment={<span className="text-sm font-bold text-muted-foreground">$</span>}
              placeholder="0.00"
            />
          </div>
          {assetForm.amount && assetForm.price && (
            <div className="rounded-xl bg-surface-hover/60 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Total Value</p>
              <p className="text-lg font-extrabold text-foreground">{money(Number(assetForm.amount) * Number(assetForm.price))}</p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

function SegBtn({
  active, tone, busy, onClick, icon, children,
}: {
  active: boolean;
  tone: 'win' | 'loss' | 'real';
  busy?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const activeTone =
    tone === 'win' ? 'bg-success text-white shadow-lg shadow-success/30'
    : tone === 'loss' ? 'bg-destructive text-white shadow-lg shadow-destructive/30'
    : 'bg-foreground text-background shadow-glass';
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 disabled:opacity-60 sm:flex-1',
        active ? activeTone : 'bg-surface-hover text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
