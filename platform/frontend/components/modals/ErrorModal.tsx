'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function ErrorModal({ isOpen, onClose, title = "Error", message }: ErrorModalProps) {
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
                        className="relative w-full max-w-sm overflow-hidden bg-[#09090b] border border-red-900/50 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)]"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 blur-[60px] pointer-events-none rounded-full bg-destructive/10" />

                        <div className="relative p-6 pt-8 text-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 bg-destructive/10 border-destructive text-destructive shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                                    <AlertCircle size={40} strokeWidth={2} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-foreground mb-2 font-heading tracking-tight">
                                {title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-8 px-4">
                                {message}
                            </p>

                            <Button
                                onClick={onClose}
                                className="w-full h-12 bg-surface-hover hover:bg-surface-hover text-foreground font-bold rounded-xl"
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
