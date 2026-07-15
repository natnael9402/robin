'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Shield, Mail } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { authApi } from '../../shared/api';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useToast } from '../../shared/contexts/ToastContext';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';

export function SecurityPage() {
  useDocumentTitle('Security · Paxora Capital');
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [pwOpen, setPwOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  return (
    <div className="px-4 pt-20 pb-24 md:max-w-2xl md:mx-auto w-full space-y-3">
      <h1 className="text-xl font-black text-foreground">Security</h1>
      <p className="text-xs text-muted-foreground -mt-2">Manage your account security</p>

      <div className="divide-y divide-white/5 bg-surface/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-lg">
        <SecurityItem
          icon={KeyRound}
          label="Change Password"
          description="Update your login password"
          onClick={() => setPwOpen(true)}
        />
        <SecurityItem
          icon={Lock}
          label="Withdrawal Password"
          description="Require a separate password for withdrawals"
          onClick={() => setWithdrawalOpen(true)}
        />
        <SecurityItem
          icon={Mail}
          label="Forgot Password"
          description="Send a password reset link to your email"
          onClick={async () => {
            if (!user?.email) return toast.error('No email on file');
            try {
              await authApi.forgotPassword(user.email);
              setForgotSent(true);
              toast.success('Reset link sent to your email');
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
          badge={forgotSent ? 'Sent' : undefined}
        />
        <SecurityItem
          icon={Shield}
          label="Active Sessions"
          description="Manage your active logins"
          onClick={() => toast.info('Session management coming soon')}
        />
      </div>

      <button
        onClick={() => router.back()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface/40 border border-white/5 hover:bg-white/5 transition-colors text-sm font-bold text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
      <WithdrawalPasswordModal open={withdrawalOpen} onClose={() => setWithdrawalOpen(false)} />
    </div>
  );
}

function SecurityItem({
  icon: Icon,
  label,
  description,
  onClick,
  badge,
}: {
  icon: typeof KeyRound;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left group">
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{description}</div>
      </div>
      {badge && (
        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
          {badge}
        </span>
      )}
    </button>
  );
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handle = async () => {
    if (!oldPw || !newPw) return toast.error('Fill all fields');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      toast.success('Password changed');
      onClose();
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} size="md" title="Change Password">
      <div className="space-y-4 p-2">
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
        <Button variant="primary" size="lg" fullWidth onClick={handle} loading={loading}>Update Password</Button>
      </div>
    </Modal>
  );
}

function WithdrawalPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<'set' | 'forgot'>('set');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAccountPw, setShowAccountPw] = useState(false);
  const [accountPw, setAccountPw] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Reset states when modal opens
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMode('set');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setAccountPw('');
    }, 200);
  };

  const handleSet = async () => {
    if (!newPw) return toast.error('Enter a withdrawal password');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authApi.setWithdrawalPassword(newPw, currentPw || undefined);
      toast.success('Withdrawal password set');
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!accountPw) return toast.error('Enter your account password');
    if (!newPw) return toast.error('Enter a new withdrawal password');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authApi.resetWithdrawalPassword(accountPw, newPw);
      toast.success('Withdrawal password reset');
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'forgot') {
    return (
      <Modal open={open} onClose={handleClose} size="md" title="Reset Withdrawal Password">
        <div className="space-y-4 p-2">
          <p className="text-xs text-muted-foreground">
            Enter your account password to reset your withdrawal password.
          </p>
          <div className="relative">
            <Input label="Account Password" type={showAccountPw ? 'text' : 'password'} value={accountPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountPw(e.target.value)} />
            <button type="button" onClick={() => setShowAccountPw((v) => !v)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
              {showAccountPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input label="New Withdrawal Password" type={showNew ? 'text' : 'password'} value={newPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
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
          <Button variant="primary" size="lg" fullWidth onClick={handleForgot} loading={loading}>Reset Withdrawal Password</Button>
          <button onClick={() => { setMode('set'); setAccountPw(''); setNewPw(''); setConfirmPw(''); }} className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
            Back to set withdrawal password
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" title="Withdrawal Password">
      <div className="space-y-4 p-2">
        <p className="text-xs text-muted-foreground">
          This password is required when making withdrawals. Leave current password blank if setting for the first time.
        </p>
        <div className="relative">
          <Input label="Current Password (if set)" type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPw(e.target.value)} />
          <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground">
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Input label="New Withdrawal Password" type={showNew ? 'text' : 'password'} value={newPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} />
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
        <Button variant="primary" size="lg" fullWidth onClick={handleSet} loading={loading}>Set Withdrawal Password</Button>
        <button onClick={() => { setMode('forgot'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }} className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
          Forgot withdrawal password?
        </button>
      </div>
    </Modal>
  );
}
