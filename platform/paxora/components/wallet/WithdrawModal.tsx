'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, AlertCircle } from 'lucide-react';
import { walletApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    maxBalance: number;
}

export function WithdrawModal({ isOpen, onClose, onSuccess, maxBalance }: WithdrawModalProps) {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [withdrawPassword, setWithdrawPassword] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('ETH');
    const [submitting, setSubmitting] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setAddress('');
            setWithdrawPassword('');
            setSelectedNetwork('ETH');
            setSubmitting(false);
        }
    }, [isOpen]);

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        if (!address || !withdrawPassword) return;

        if (!/^\d+$/.test(withdrawPassword)) {
            showToast('Withdraw password must be numbers only.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await walletApi.withdraw(Number(amount), selectedNetwork, address, withdrawPassword);
            showToast('Withdrawal successful!', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.message || 'Withdrawal failed';
            showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#09090b] border border-border rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Background Glow (Reddish for Withdraw/Outflow naturally, but User asked for greenish borders/updated UI functionality. Let's keep consistent branding or maybe subtle orange for caution. User asked for "greenish boarders, the ui updated". I'll use Greenish borders as requested for consistency) */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-surface-hover/20 blur-[80px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />

                        {/* Branding */}
                        <div className="absolute top-6 left-6 z-10 flex items-start gap-0.5 pointer-events-none">
                            <span className="text-xl font-black font-heading text-primary tracking-widest">
                                PAXORA
                            </span>
                            <span className="text-[8px] font-bold text-primary mt-0.5 opacity-80">TM</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface text-muted-foreground hover:text-foreground transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="mt-12">
                            <h2 className="text-3xl font-black text-foreground font-heading mb-1">Withdraw</h2>
                            <p className="text-muted-foreground text-sm mb-6">Transfer funds to external wallet.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Network Selector */}
                                <div className="grid grid-cols-3 gap-2">
                                    {['ETH', 'BTC', 'SOL'].map(net => (
                                        <button
                                            key={net}
                                            type="button"
                                            onClick={() => setSelectedNetwork(net)}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedNetwork === net
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                                : 'bg-surface/50 text-muted-foreground border-border hover:border-border hover:text-foreground'
                                                }`}
                                        >
                                            {net}
                                        </button>
                                    ))}
                                </div>

                                {/* Amount Input */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</label>
                                        <div className="text-xs text-muted-foreground">
                                            Available: <span className="text-foreground font-mono">${maxBalance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-muted-foreground font-bold">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            max={maxBalance}
                                            className="w-full bg-background border border-border rounded-xl py-4 pl-8 pr-20 text-foreground font-bold font-mono focus:outline-none focus:border-primary transition-colors placeholder-muted-foreground/60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setAmount(maxBalance.toString())}
                                            className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-surface text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all uppercase"
                                        >
                                            Max
                                        </button>
                                    </div>
                                </div>

                                {/* Address Input */}
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Destination Address</label>
                                    <textarea
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder={`Paste your ${selectedNetwork} address here`}
                                        rows={2}
                                        className="w-full bg-background border border-border rounded-xl p-4 text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder-muted-foreground/60 resize-none"
                                    />
                                </div>
                                <div className="mt-2 flex items-start gap-2 text-muted-foreground text-[10px] bg-surface/50 p-3 rounded-xl border border-border/50">
                                    <AlertCircle size={14} className="shrink-0 text-primary" />
                                    Please ensure you enter the correct address. Transfers are irreversible.
                                </div>


                                {/* Withdraw Password Input */}
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Withdraw Password (PIN)</label>
                                    <input
                                        type="password"
                                        value={withdrawPassword}
                                        onChange={e => setWithdrawPassword(e.target.value)}
                                        placeholder="Enter your withdraw PIN"
                                        className="w-full bg-background border border-border rounded-xl p-4 text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder-muted-foreground/60"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !amount || !address || !withdrawPassword}
                                    className="w-full py-4 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary-hover transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Processing...' : (
                                        <>
                                            <ArrowUpRight size={18} />
                                            Confirm Withdrawal
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    );
}

