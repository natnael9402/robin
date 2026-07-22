'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WalletSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'deposit' | 'withdraw';
}

export function WalletSuccessModal({ isOpen, onClose, type }: WalletSuccessModalProps) {
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
                        className="relative w-full max-w-sm bg-[#09090b] border border-primary/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[60px] pointer-events-none rounded-full" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <Check size={40} className="text-primary stroke-[3]" />
                            </div>

                            <h3 className="text-2xl font-black text-foreground font-heading mb-2">
                                {type === 'deposit' ? 'Deposit Initiated' : 'Withdrawal Submitted'}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                {type === 'deposit'
                                    ? 'Your deposit request has been received. Funds will appear once verified on the blockchain.'
                                    : 'Your withdrawal request is being processed. You will receive funds shortly.'}
                            </p>

                            <Button
                                onClick={onClose}
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20"
                            >
                                Continue
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
