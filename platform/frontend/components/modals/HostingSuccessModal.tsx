'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Check, X, Server, ArrowRight } from 'lucide-react';

interface HostingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
}

export function HostingSuccessModal({ isOpen, onClose, planName }: HostingSuccessModalProps) {
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
                        <div className="absolute top-0 right-0 w-40 h-40 blur-[60px] pointer-events-none rounded-full bg-primary/20" />

                        <div className="relative p-6 pt-8 text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 bg-primary/10 border-primary text-primary shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <Server size={40} strokeWidth={2} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-foreground mb-2 font-heading tracking-tight">
                                Hosting Active!
                            </h3>
                            <p className="text-muted-foreground text-sm mb-8 px-4">
                                You have successfully deployed <span className="text-foreground font-bold">{planName}</span>. Your AI Arbitrage bot is now running.
                            </p>

                            <Button
                                onClick={() => router.push('/arbitrage/my-hosting')}
                                className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                View Active Bots
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
