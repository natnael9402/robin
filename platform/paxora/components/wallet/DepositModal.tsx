'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ArrowDownLeft } from 'lucide-react';
import { walletApi } from '@/lib/api';

const SAAS_WALLETS = {
    SOL: 'EgMPHmH7LzvYwNbTuYz8KoQ74ZhMjRCVoKa9Nbyp3ZDx',
    ETH: '0x4655e83B25D4ee4ba6cEeaDDbDcbbafE120e467c',
    BTC: 'bc1pvl6xl6fsvepl2xjlwgkdk9lrfz0mhtvtv2nydj0skf079qr352asygzvc2'
};

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
    const [amount, setAmount] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('ETH');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setSelectedNetwork('ETH');
            setSubmitting(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        const address = SAAS_WALLETS[selectedNetwork as keyof typeof SAAS_WALLETS];
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

        setSubmitting(true);
        try {
            await walletApi.deposit(Number(amount), selectedNetwork);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Deposit failed');
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
                        className="relative w-full max-w-md bg-[#09090b] border border-primary/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />

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
                            <h2 className="text-3xl font-black text-foreground font-heading mb-1">Deposit Funds</h2>
                            <p className="text-muted-foreground text-sm mb-6">Select a network and scan the QR code.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Network Selector */}
                                <div className="grid grid-cols-3 gap-2">
                                    {['ETH', 'BTC', 'SOL'].map(net => (
                                        <button
                                            key={net}
                                            type="button"
                                            onClick={() => setSelectedNetwork(net)}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedNetwork === net
                                                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                : 'bg-surface/50 text-muted-foreground border-border hover:border-border hover:text-foreground'
                                                }`}
                                        >
                                            {net}
                                        </button>
                                    ))}
                                </div>

                                {/* QR Code Card */}
                                <div className="relative group perspective">
                                    <div className="bg-surface/50 border border-border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all group-hover:border-primary/30 group-hover:bg-surface/80">
                                        <div className="p-3 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(SAAS_WALLETS[selectedNetwork as keyof typeof SAAS_WALLETS])}`}
                                                alt="Wallet QR"
                                                className="w-32 h-32"
                                            />
                                        </div>

                                        <div
                                            onClick={handleCopy}
                                            className={`w-full flex items-center justify-between bg-background border rounded-xl px-4 py-3 cursor-pointer transition-all active:scale-98 ${copied
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className={`text-xs font-mono truncate mr-4 ${copied ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {copied ? 'Address Copied!' : SAAS_WALLETS[selectedNetwork as keyof typeof SAAS_WALLETS]}
                                            </div>
                                            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deposit Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-muted-foreground font-bold">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-background border border-border rounded-xl py-4 pl-8 pr-4 text-foreground font-bold font-mono focus:outline-none focus:border-primary transition-colors placeholder-muted-foreground/60"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !amount}
                                    className="w-full py-4 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Verifying...' : (
                                        <>
                                            <ArrowDownLeft size={18} />
                                            I Have Sent Payment
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
