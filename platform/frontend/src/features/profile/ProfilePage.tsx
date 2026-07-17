'use client';

import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { authApi, verificationApi } from '../../shared/api';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Lock, User, Shield, Moon, Sun, ChevronRight, Eye, EyeOff, BarChart3, RefreshCw, Scale, FileText, Gavel, Trash2, Info } from 'lucide-react';
import { Modal } from '../../shared/components/ui/Modal';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { cn, displayName, initials, formatCurrency } from '../../shared/lib/utils';

export function ProfilePage() {
  useDocumentTitle('Profile · Paxora Premium');
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [pwOpen, setPwOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: verification } = useQuery({
    queryKey: ['verification', 'status'],
    queryFn: () => verificationApi.getStatus(),
    staleTime: 30_000,
  });
  const { data: profileData } = useQuery({
    queryKey: ['profile', 'data'],
    queryFn: () => authApi.getProfileData(),
    staleTime: 15_000,
  });
  const isVerified = verification?.status === 'approved';
  const level = profileData?.level ?? 0;

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const start = Date.now();
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['verification', 'status'] }),
        queryClient.invalidateQueries({ queryKey: ['profile', 'data'] }),
      ]);
      toast.success('Everything up to date');
    } finally {
      const remaining = Math.max(0, 800 - (Date.now() - start));
      setTimeout(() => setRefreshing(false), remaining);
    }
  };

  return (
    <div className="px-4 pt-20 pb-24 md:max-w-2xl md:mx-auto w-full space-y-1.5">
      {/* Logout Button */}
      <button
        onClick={logout}
        aria-label="Sign out"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-white transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="text-xs">Sign Out</span>
      </button>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0a0a0f] to-[#111118] border border-primary/10 p-5 shadow-[0_20px_60px_-20px_var(--primary-glow)]">
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/5 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-primary/5 blur-[60px]" />

        <div className="relative">
          {/* Top row */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img src="/pp.png" alt="Avatar" className="h-20 w-20 shrink-0 object-cover" />
              {isVerified && (
                <div className="absolute bottom-0 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0a0a0f] bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.5)]">
                  <Shield className="h-2.5 w-2.5 text-black" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-black text-white">{displayName(user)}</h1>
              <p
                className={`mt-0.5 truncate text-[11px] font-semibold transition-all duration-300 ${
                  showValues ? 'text-white/70' : 'text-white/30'
                }`}
              >
                {showValues ? user?.email : '••••••@••••'}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-primary">UID</span>
                  <span className="font-mono text-[11px] font-semibold text-white/70">{user?.id}</span>
                </div>
                {level > 0 && (
                  <div className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1',
                    level >= 3
                      ? 'bg-yellow-500/25 text-yellow-300 border-yellow-500/40'
                      : level >= 2
                        ? 'bg-slate-400/25 text-slate-200 border-slate-400/40'
                        : 'bg-amber-600/25 text-amber-300 border-amber-500/40',
                  )}>
                    <span className="font-mono text-[11px] font-bold">Lv.{level}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] p-2 transition-all hover:bg-white/15 hover:border-white/20 disabled:pointer-events-none"
              >
                <style>{`@keyframes s{0%{transform:rotate(0deg) scale(1)}30%{transform:rotate(180deg) scale(1.3)}60%{transform:rotate(360deg) scale(1)}80%{transform:rotate(400deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}.s{animation:s .8s cubic-bezier(.34,1.56,.64,1) forwards}`}</style>
                <RefreshCw className={`h-3.5 w-3.5 text-white/70 transition-transform ${refreshing ? 's' : ''}`} />
              </button>
              <button
                onClick={() => setShowValues((v) => !v)}
                className="shrink-0 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-2 transition-all hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:shadow-[0_0_16px_rgba(212,175,55,0.15)]"
              >
                {showValues ? <EyeOff className="h-3.5 w-3.5 text-[#D4AF37]" /> : <Eye className="h-3.5 w-3.5 text-[#D4AF37]/70" />}
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-5 border-t border-white/5 pt-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Available Balance</span>
            <div className="mt-1.5 transition-all duration-300">
              <span className="font-mono text-[22px] font-black leading-none tracking-tight text-white">
                {profileData ? (showValues ? `$${profileData.balance.toLocaleString()}` : '••••••') : '...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="rounded-2xl bg-surface/40 border border-white/5 overflow-hidden backdrop-blur-xl shadow-lg">
        <div className="divide-y divide-white/5">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            </div>
            <span className="text-xs font-bold text-foreground flex-1 text-left">Appearance</span>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-surface-hover border border-white/10'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow-md flex items-center justify-center transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}>
                {theme === 'dark' ? <Moon className="w-2.5 h-2.5 text-primary-foreground" /> : <Sun className="w-2.5 h-2.5 text-warning" />}
              </span>
            </div>
          </button>
          <ProfileLink href="/profile/security" icon={Shield} label="Security Settings" />
          <ProfileLink href="/profile/trades" icon={BarChart3} label="Trade History" />
          <ProfileLink
            href="/verification"
            icon={User}
            label="Identity Verification"
            badge={isVerified ? 'Verified' : 'Not verified'}
            badgeColor={isVerified ? 'primary' : 'amber'}
          />
          <button
            onClick={() => setPwOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-bold text-foreground flex-1 text-left">Change Password</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
          </button>
        </div>
      </div>

      {/* Legal & Compliance */}
      <div className="pt-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/15 px-2.5 py-1">
            <Scale className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary" style={{ fontFamily: 'var(--font-outfit)' }}>
              Legal
            </span>
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="rounded-2xl bg-surface/40 border border-white/5 overflow-hidden backdrop-blur-xl shadow-lg divide-y divide-white/5">
          <ProfileLink href="/profile/about" icon={Info} label="About Us" badge="2.0" badgeColor="primary" />
          <ProfileLink href="/legal/terms" icon={FileText} label="Terms of Service" />
          <ProfileLink href="/legal/privacy" icon={Shield} label="Privacy Policy" />
          <ProfileLink href="/legal/aml" icon={Gavel} label="Anti-Money Laundering Policy" />
        </div>
      </div>

      {/* Delete Account */}
      <button
        onClick={() => setDeleteOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive hover:text-white transition-colors text-destructive font-bold"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="text-xs">Delete Account</span>
      </button>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onSuccess={logout} />
    </div>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  label,
  badge,
  badgeColor = 'primary',
}: {
  href: string;
  icon: typeof User;
  label: string;
  badge?: string;
  badgeColor?: 'primary' | 'amber';
}) {
  const colorClass = badgeColor === 'primary' 
    ? 'bg-primary/20 text-primary border border-primary/30' 
    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    
  return (
    <a
      href={href}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs font-bold text-foreground flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg ${colorClass}`}>
          {badge}
        </span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
    </a>
  );
}

function DeleteAccountModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'password' | 'confirm'>('password');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handlePasswordSubmit = () => {
    if (!password) return toast.error('Enter your password');
    setStep('confirm');
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await authApi.deleteAccount(password, reason || undefined);
      toast.success('Account permanently deleted');
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
      setStep('password');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPassword('');
    setReason('');
    setStep('password');
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} size="md" title="Delete Account">
      {step === 'password' ? (
        <div className="space-y-5 p-2">
          <p className="text-xs text-muted-foreground">
            This action is <strong>permanent and irreversible</strong>. All your data, including
            balances, trades, and account information, will be deleted.
          </p>
          <Input
            label="Current Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <Input
            label="Reason for leaving (optional)"
            type="text"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
          />
          <div className="pt-2">
            <Button variant="danger" size="lg" fullWidth onClick={handlePasswordSubmit}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 p-2">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-bold text-destructive">Are you absolutely sure?</p>
            <p className="mt-2 text-xs text-muted-foreground">
              This will permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Button variant="danger" size="lg" fullWidth onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Permanently Delete My Account'}
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();
  const handle = async () => {
    if (!oldPw || !newPw) return toast.error('Fill all fields');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await authApi.changePassword(oldPw, newPw);
      toast.success('Password updated successfully');
      onClose();
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  return (
    <Modal open={open} onClose={onClose} size="md" title="Update Security">
      <div className="space-y-5 p-2">
        <div className="relative">
          <Input label="Current Password" type={showOld ? 'text' : 'password'} value={oldPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPw(e.target.value)} />
          <button type="button" onClick={() => setShowOld((v) => !v)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
            {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input label="New Password" type={showNew ? 'text' : 'password'} value={newPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
          <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input label="Confirm New Password" type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPw(e.target.value)} />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="lg" fullWidth onClick={handle} className="shadow-[0_0_20px_var(--primary-glow)]">Update Password</Button>
        </div>
      </div>
    </Modal>
  );
}
