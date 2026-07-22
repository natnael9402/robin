'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { arbitrageApi, authApi } from '@/lib/api';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';

interface ArbitrageCardProps {
    plan: {
        code: string;
        name: string;
        dailyRate: number;
        durationDays: number;
        min: number;
        max: number;
    };
    userBalance: number;
}

export function ArbitrageCard({ plan, userBalance }: ArbitrageCardProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const handleStart = () => {
        if (userBalance < plan.min) {
            setShowModal(true);
        } else {
            router.push(`/arbitrage/checkout?plan=${plan.code}`);
        }
    };

    return (
        <>
            <div className="bg-surface rounded-3xl p-5 border border-border relative group hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-surface to-surface-active border border-border flex items-center justify-center text-lg font-bold text-foreground shadow-inner">
                            {plan.code}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                            <div className="text-xs text-muted-foreground">AI Arbitrage Product</div>
                        </div>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {plan.dailyRate}% daily
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-background/40 rounded-2xl p-3 border border-border/50">
                        <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs">
                            <Calendar className="w-3 h-3" />
                            Duration
                        </div>
                        <div className="text-foreground font-bold text-sm">{plan.durationDays} Days</div>
                    </div>
                    <div className="bg-background/40 rounded-2xl p-3 border border-border/50">
                        <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs">
                            <DollarSign className="w-3 h-3" />
                            Limit
                        </div>
                        <div className="text-foreground font-bold text-sm">
                            {plan.min.toLocaleString()}-{plan.max.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                    <div className="text-xs text-muted-foreground">Supported Currencies</div>
                    <div className="flex -space-x-2">
                        {['USDT', 'BTC', 'ETH'].map((c, i) => (
                            <div key={c} className={`w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-[8px] font-bold ${
                                i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-orange-500 text-foreground' : 'bg-purple-500 text-foreground'
                            }`}>
                                {c[0]}
                            </div>
                        ))}
                    </div>
                </div>

                <Button 
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 rounded-xl"
                    onClick={handleStart}
                >
                    Start Hosting
                </Button>
            </div>

            <InsufficientBalanceModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                needed={plan.min}
                current={userBalance}
            />
        </>
    );
}
