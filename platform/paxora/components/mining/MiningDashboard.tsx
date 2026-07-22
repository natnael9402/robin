'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Server } from 'lucide-react';
import { miningApi } from '@/lib/api';
import { MiningTerminal } from './MiningTerminal';

export function MiningDashboard() {
    const [miners, setMiners] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalPower: 0, liveEarnings: 0 });

    useEffect(() => {
        const fetchMiners = async () => {
            try {
                const data = await miningApi.getActive();
                setMiners(data);
            } catch (e) {
                // SWR/React Query would be better here but simple catch works
            }
        };

        fetchMiners();
        const syncInterval = setInterval(fetchMiners, 60000);
        return () => clearInterval(syncInterval);
    }, []);

    useEffect(() => {
        if (miners.length === 0) return;

        let totalP = 0;
        miners.forEach(m => {
            const p = parseInt(m.plan.hashPower) || 0;
            totalP += p;
        });

        const tick = setInterval(() => {
            let totalEarned = 0;
            const now = Date.now();

            miners.forEach(miner => {
                // Backend earned + interpolated amount since start/last-sync
                // Actually backend 'earned' is updated every minute. 
                // To be smooth, we calculate total from start date based on rate.
                // Formula: (Price * Rate%/100) / 1440 * minutes_active

                const start = new Date(miner.startDate).getTime();
                const diffMs = now - start;
                const minutesActive = diffMs / 60000;

                const dailyRate = parseFloat(miner.plan.dailyRate);
                const dailyEarnings = miner.plan.price * (dailyRate / 100);
                const minEarnings = dailyEarnings / 1440;

                totalEarned += (minutesActive * minEarnings);
            });

            setStats({
                totalPower: totalP,
                liveEarnings: totalEarned
            });
        }, 100);

        return () => clearInterval(tick);
    }, [miners]);

    if (miners.length === 0) return null;

    return (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface border border-border p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-xs">Live Hashrate</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalPower} <span className="text-sm text-muted-foreground">TH/s</span>
                        </div>
                    </div>
                    <div className="bg-surface border border-border p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span className="text-xs">Total Earnings</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            ${stats.liveEarnings.toFixed(6)}
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-border p-4 rounded-xl">
                    <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Active Rigs
                    </h3>
                    <div className="space-y-3">
                        {miners.map(m => (
                            <div key={m.id} className="flex justify-between items-center text-sm bg-background/20 p-2 rounded">
                                <div>
                                    <div className="text-foreground">{m.plan.name}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(m.startDate).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-primary animate-pulse">Mining</div>
                                    <div className="text-xs text-muted-foreground">{m.plan.hashPower}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <MiningTerminal power={stats.totalPower.toString()} />
        </div>
    );
}
