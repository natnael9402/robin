'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, ArrowRight, Wallet } from 'lucide-react';

interface TradeSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'buy' | 'sell';
    symbol: string;
    amount: string;
    profit?: number;
    outcome?: 'WIN' | 'LOSS' | 'SPOT';
}

export function TradeSuccessModal({ isOpen, onClose, type, symbol, amount, profit, outcome = 'WIN' }: TradeSuccessModalProps) {
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
                        className="relative w-full max-w-sm overflow-hidden bg-[#09090b] border border-border rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)]"
                    >
                        {/* Background Effects */}
                        <div className={`absolute top-0 right-0 w-40 h-40 blur-[60px] pointer-events-none rounded-full ${type === 'buy' ? 'bg-primary/20' : 'bg-destructive/20'
                            }`} />

                        <div className="relative p-6 pt-8 text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Success/Loss Icon */}
                            <div className="mb-6 flex justify-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${outcome === 'WIN' || outcome === 'SPOT'
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                    : 'bg-destructive/10 border-destructive text-destructive shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                                    }`}>
                                    {outcome === 'LOSS' ? <X size={40} strokeWidth={3} /> : <Check size={40} strokeWidth={3} />}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-foreground mb-2 font-heading tracking-tight">
                                {outcome === 'SPOT'
                                    ? 'Order Filled!'
                                    : (outcome === 'WIN' ? 'Trade Won!' : 'Trade Lost')}
                            </h3>
                            <div className="text-muted-foreground text-sm mb-8 px-4">
                                {outcome === 'SPOT'
                                    ? <>Successfully {type === 'buy' ? 'purchased' : 'sold'} <span className="text-foreground font-bold">{symbol}</span>. Asset loaded to portfolio.</>
                                    : (outcome === 'WIN'
                                        ? (
                                            <div className="flex flex-col gap-1">
                                                <span>You successfully predicted the market!</span>
                                                <div className="bg-surface/50 rounded-xl p-3 mt-2 border border-border">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>Profit</span>
                                                        <span className="text-primary">+${Number(profit).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-foreground border-t border-border pt-1 mt-1">
                                                        <span>Total Added to Wallet</span>
                                                        <span>${(Number(amount) + Number(profit)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                        : <>Market moved against your position. Better luck next time.</>)
                                }
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/trade')}
                                    className={`w-full h-12 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all ${type === 'buy' ? 'bg-primary shadow-primary/20' : 'bg-destructive text-foreground shadow-red-500/20'
                                        }`}
                                >
                                    <Zap size={18} fill="currentColor" />
                                    Fast Trade
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
