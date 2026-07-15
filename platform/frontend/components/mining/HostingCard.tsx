import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Server, Activity, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { miningApi } from '@/lib/api';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { useAuth } from '@/context/AuthContext';

export function HostingCard({ plan }: { plan: any }) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(plan.minPrice || plan.price);
    const [balanceModalOpen, setBalanceModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    const handleSubscribe = async () => {
        if (loading) return;

        const cost = Number(amount);
        if ((user?.balance || 0) < cost) {
            setBalanceModalOpen(true);
            return;
        }

        setLoading(true);
        try {
            await miningApi.subscribe(plan.id, cost);
            router.push('/mining/my');
        } catch (e: any) {
            const msg = e.message || 'Failed to subscribe';
            if (msg.includes('Insufficient balance')) {
                setBalanceModalOpen(true);
            } else {
                setErrorModal({ open: true, message: msg });
            }
        } finally {
            setLoading(false);
        }
    };

    const getHardwareVisuals = () => {
        if (plan.name.includes('S3')) return { color: '#10b981', icon: Server, label: 'ASIC Miner' };
        if (plan.name.includes('MS3')) return { color: '#3b82f6', icon: Cpu, label: 'Multi-GPU Rig' };
        if (plan.name.includes('460S')) return { color: '#ef4444', icon: Activity, label: 'High-Perf Cluster' };
        if (plan.name.includes('Green')) return { color: '#22c55e', icon: Zap, label: 'Solar Powered' };
        if (plan.name.includes('Liquid')) return { color: '#06b6d4', icon: Server, label: 'Immersion Cooling' };
        if (plan.name.includes('Nuclear')) return { color: '#f59e0b', icon: Activity, label: 'Nuclear Reactor' };
        if (plan.name.includes('FPGA')) return { color: '#8b5cf6', icon: Cpu, label: 'FPGA Unit' };
        return { color: '#10b981', icon: Zap, label: 'Standard Rig' };
    };

    const visuals = getHardwareVisuals();
    const VisualIcon = visuals.icon;

    return (
        <>
            <motion.div
                whileHover={{ y: -5 }}
                className="relative min-w-[300px] w-full md:w-auto md:min-w-0 bg-[#09090b] border border-border rounded-3xl p-6 flex flex-col justify-between group overflow-hidden"
            >
                {/* Background Gradient */}
                <div
                    className="absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: visuals.color }}
                />

                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center border border-border-light"
                            style={{ backgroundColor: `${visuals.color}15`, color: visuals.color }}
                        >
                            <VisualIcon size={28} />
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Daily Return</span>
                            <span className="text-xl font-bold text-foreground relative inline-block">
                                {plan.dailyRate}%
                                <span className="absolute -bottom-1 left-0 w-full h-[2px] rounded-full opacity-50" style={{ backgroundColor: visuals.color }} />
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-foreground font-heading mb-1">{plan.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                                {visuals.label}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted-foreground uppercase">
                                {plan.coin || 'ETH'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-surface/50 p-3 rounded-xl border border-border/50">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Power</div>
                            <div className="font-mono text-sm text-foreground">{plan.wattage || '--'}</div>
                        </div>
                        <div className="bg-surface/50 p-3 rounded-xl border border-border/50">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Duration</div>
                            <div className="font-mono text-sm text-foreground">{plan.durationDays} Days</div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="bg-background/50 p-4 rounded-xl border border-border">
                        <div className="text-xs text-muted-foreground font-bold uppercase mb-2">Investment</div>
                        {plan.minPrice > 0 ? (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                <input
                                    type="number"
                                    className="w-full bg-surface border border-border rounded-lg py-2 pl-6 pr-3 text-foreground font-mono font-bold text-sm focus:outline-none focus:border-primary transition-colors"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    min={plan.minPrice}
                                    max={plan.maxPrice}
                                />
                            </div>
                        ) : (
                            <div className="text-xl font-bold text-foreground font-mono">
                                ${plan.price.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        style={{ backgroundColor: visuals.color, boxShadow: `0 4px 20px ${visuals.color}30` }}
                    >
                        {loading ? 'Deploying...' : 'Rent Hardware'}
                    </Button>
                </div>
            </motion.div>

            <InsufficientBalanceModal
                isOpen={balanceModalOpen}
                onClose={() => setBalanceModalOpen(false)}
                needed={Number(amount)}
                current={user?.balance || 0}
            />

            <ErrorModal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ ...errorModal, open: false })}
                message={errorModal.message}
            />
        </>
    );
}
