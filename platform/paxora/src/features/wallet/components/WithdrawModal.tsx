'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Check, ChevronDown, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/contexts/ToastContext';
import { authApi } from '../../../shared/api';
import { useWithdraw, useSetWithdrawalPin, useResetWithdrawalPin } from '../hooks/useWallet';

const NETWORKS = ['BTC', 'ETH', 'USDT (TRC20)', 'USDT (ERC20)'];

type Screen = 'create-pin' | 'withdraw' | 'reset-pin';

export function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}) {
  const [screen, setScreen] = useState<Screen>('create-pin');
  const [screenLoaded, setScreenLoaded] = useState(false);

  // Withdraw form
  const [amount, setAmount] = useState('0.00');
  const [network, setNetwork] = useState('BTC');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');

  // Create/reset PIN
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showAccountPw, setShowAccountPw] = useState(false);

  const toast = useToast();
  const withdraw = useWithdraw();
  const setPinMutation = useSetWithdrawalPin();
  const resetPinMutation = useResetWithdrawalPin();

  // Fetch PIN status on open, determine initial screen
  useEffect(() => {
    if (!open) {
      setScreen('create-pin');
      setScreenLoaded(false);
      setAmount('0.00');
      setNetwork('BTC');
      setAddress('');
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setAccountPassword('');
      setDropdownOpen(false);
      return;
    }
    authApi.getWithdrawalPinStatus().then(({ hasPin }) => {
      setScreen(hasPin ? 'withdraw' : 'create-pin');
    }).catch(() => {
      setScreen('create-pin');
    }).finally(() => {
      setScreenLoaded(true);
    });
  }, [open]);

  // --- Handlers ---

  const handleCreatePin = async () => {
    if (!newPin || newPin.length < 4) return toast.error('PIN must be at least 4 characters');
    if (newPin !== confirmPin) return toast.error('PINs do not match');
    try {
      await setPinMutation.mutateAsync(newPin);
      setNewPin('');
      setConfirmPin('');
      setPin(newPin);
      setScreen('withdraw');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSubmitWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('Enter a valid amount');
    if (!address.trim()) return toast.error('Enter wallet address');
    if (!pin.trim()) return toast.error('Enter your withdrawal PIN');
    try {
      await withdraw.mutateAsync({ amount: num, network, walletAddress: address, withdrawPassword: pin });
      setAddress('');
      setPin('');
      if (onSuccess) onSuccess(num);
      else onClose();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('not set')) {
        setScreen('create-pin');
        authApi.getWithdrawalPinStatus().then(({ hasPin }) => {
          if (!hasPin) setScreen('create-pin');
        });
        return;
      }
      toast.error(msg);
    }
  };

  const handleResetPin = async () => {
    if (!accountPassword) return toast.error('Enter your account password');
    if (!newPin || newPin.length < 4) return toast.error('PIN must be at least 4 characters');
    if (newPin !== confirmPin) return toast.error('PINs do not match');
    try {
      await resetPinMutation.mutateAsync({ accountPassword, newPin });
      setAccountPassword('');
      setNewPin('');
      setConfirmPin('');
      setPin(newPin);
      setScreen('withdraw');
      toast.success('Withdrawal PIN reset successfully');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // --- Screens ---

  const renderCreatePin = () => (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Create a PIN to authorize withdrawals from your account.</p>
      </div>
      <Input
        label="New PIN"
        type={showNewPin ? 'text' : 'password'}
        placeholder="At least 4 characters"
        value={newPin}
        onChange={(e) => setNewPin(e.target.value)}
        rightAdornment={
          <button type="button" onClick={() => setShowNewPin((v) => !v)} className="text-muted-foreground hover:text-foreground">
            {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Input
        label="Confirm PIN"
        type={showConfirmPin ? 'text' : 'password'}
        placeholder="Re-enter your PIN"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        rightAdornment={
          <button type="button" onClick={() => setShowConfirmPin((v) => !v)} className="text-muted-foreground hover:text-foreground">
            {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Button variant="primary" size="lg" fullWidth onClick={handleCreatePin} loading={setPinMutation.isPending}>
        <KeyRound className="w-4 h-4 mr-2" />
        Set PIN & Continue
      </Button>
    </div>
  );

  const renderWithdraw = () => (
    <div className="space-y-4">
      <Input
        label="Amount"
        type="number"
        value={amount}
        leftAdornment={<span className="text-foreground font-mono font-bold">$</span>}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="space-y-2 relative">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Select Network</label>
        
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between bg-background/80 border border-primary/20 hover:border-primary/40 hover:bg-background/90 rounded-2xl px-4 py-3.5 transition-all shadow-inner relative z-20 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_10px_var(--primary-glow)] overflow-hidden">
              <img 
                src={`/icons/crypto/${network.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                alt={network}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
              />
              <span className="text-[10px] font-black text-primary hidden">{network.charAt(0)}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{network}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-3xl border border-primary/30 rounded-2xl shadow-[0_15px_40px_-10px_var(--primary-glow)] z-30 max-h-[220px] overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
              {NETWORKS.map((n) => {
                const isSelected = network === n;
                const currency = n.split(' ')[0];
                const subnetwork = n.includes('(') ? n.split('(')[1].replace(')', '') : currency;
                
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setNetwork(n); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'border-transparent hover:bg-surface-hover hover:border-border-light'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border overflow-hidden ${isSelected ? 'bg-gradient-to-br from-primary to-primary-hover text-black border-primary' : 'bg-surface border-border text-muted-foreground'}`}>
                      <img 
                        src={`/icons/crypto/${currency.toLowerCase().replace(/[^a-z]/g, '')}.svg`} 
                        alt={currency}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                      />
                      <span className="text-xs font-black hidden">{currency.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-primary drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-foreground'}`}>{currency}</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{subnetwork}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary ml-auto drop-shadow-[0_0_5px_var(--primary-glow)]" />}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
      <Input
        label="Wallet Address"
        placeholder="bc1q... or 0x..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div className="space-y-1">
        <Input
          label="Withdrawal PIN"
          type={showPin ? 'text' : 'password'}
          placeholder="Enter your PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          rightAdornment={
            <button type="button" onClick={() => setShowPin((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <button
          type="button"
          onClick={() => { setScreen('reset-pin'); setNewPin(''); setConfirmPin(''); setAccountPassword(''); }}
          className="text-[11px] text-primary font-bold hover:underline transition-colors px-2"
        >
          Forgot PIN?
        </button>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={handleSubmitWithdraw} loading={withdraw.isPending}>
        <ArrowUpRight className="w-4 h-4 mr-2" />
        Confirm Withdrawal
      </Button>
    </div>
  );

  const renderResetPin = () => (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setScreen('withdraw')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to withdrawal
      </button>
      <div className="text-center mb-1">
        <p className="text-sm text-muted-foreground">Enter your account password to reset your withdrawal PIN.</p>
      </div>
      <Input
        label="Account Password"
        type={showAccountPw ? 'text' : 'password'}
        placeholder="Your login password"
        value={accountPassword}
        onChange={(e) => setAccountPassword(e.target.value)}
        rightAdornment={
          <button type="button" onClick={() => setShowAccountPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
            {showAccountPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Input
        label="New PIN"
        type={showNewPin ? 'text' : 'password'}
        placeholder="At least 4 characters"
        value={newPin}
        onChange={(e) => setNewPin(e.target.value)}
        rightAdornment={
          <button type="button" onClick={() => setShowNewPin((v) => !v)} className="text-muted-foreground hover:text-foreground">
            {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Input
        label="Confirm PIN"
        type={showConfirmPin ? 'text' : 'password'}
        placeholder="Re-enter your new PIN"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        rightAdornment={
          <button type="button" onClick={() => setShowConfirmPin((v) => !v)} className="text-muted-foreground hover:text-foreground">
            {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Button variant="primary" size="lg" fullWidth onClick={handleResetPin} loading={resetPinMutation.isPending}>
        <KeyRound className="w-4 h-4 mr-2" />
        Reset PIN
      </Button>
    </div>
  );

  const titles: Record<Screen, string> = {
    'create-pin': 'Set Up Withdrawal PIN',
    withdraw: 'Withdraw',
    'reset-pin': 'Reset Withdrawal PIN',
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title={screenLoaded ? titles[screen] : 'Withdraw'}>
      {!screenLoaded ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : screen === 'create-pin' ? renderCreatePin() : screen === 'withdraw' ? renderWithdraw() : renderResetPin()}
    </Modal>
  );
}
