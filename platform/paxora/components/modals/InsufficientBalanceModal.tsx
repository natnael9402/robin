'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Wallet, X, AlertTriangle } from 'lucide-react';

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    needed: number;
    current: number;
}

export function InsufficientBalanceModal({ isOpen, onClose, needed, current }: InsufficientBalanceModalProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm overflow-hidden bg-background border border-border-light rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none rounded-full" />

                        <div className="relative p-6">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 scale-90">
                                    <div className="flex items-start gap-0.5">
                                        <span className="text-2xl font-black font-heading text-primary tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                            PAXORA
                                        </span>
                                        <span className="text-[8px] font-bold text-primary mt-0.5 opacity-80">TM</span>
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 border border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                    <AlertTriangle className="w-8 h-8 text-destructive" />
                                </div>

                                <h3 className="text-lg font-bold text-foreground mb-2 font-heading">Insufficient Balance</h3>
                                <p className="text-muted-foreground text-xs mb-6 leading-relaxed max-w-[240px]">
                                    You need more funds to complete this transaction. Please top up your wallet.
                                </p>

                                <div className="w-full bg-surface/50 rounded-2xl p-4 border border-border mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-destructive/50" />
                                    <div className="flex justify-between items-center mb-2 text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Required</span>
                                        <span className="text-foreground font-mono font-bold">
                                            ${needed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3 text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Available</span>
                                        <span className="text-muted-foreground font-mono">
                                            ${current.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="h-px bg-surface-hover w-full mb-3" />
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Missing</span>
                                        <span className="text-destructive font-mono font-bold">
                                            -${(needed - current).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                    <Button
                                        onClick={onClose}
                                        className="h-10 text-sm bg-transparent hover:bg-surface text-muted-foreground hover:text-foreground font-medium rounded-lg border border-border hover:border-border"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/wallet')}
                                        className="h-10 text-sm bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-primary/50"
                                    >
                                        Deposit Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
