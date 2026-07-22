'use client';

import { useEffect, useRef, useState } from 'react';

const LOG_TEMPLATES = [
    'Job received: 0xa4f... (Diff: 5000)',
    'Accepted share (Diff: 5500) from pool us-east',
    'Temp: {temp}C | Fan: {fan}% | MH/s: {hash}',
    'Verifying block header... OK',
    'Stratum connection stable. Latency: {ping}ms',
    'New block detected on network',
    'Submitting share... Accepted',
    'GPU0: {temp}C  GPU1: {temp}C  GPU2: {temp}C',
    'Optimization complete. Efficiency +0.2%',
];

interface TerminalProps {
    power: string;
}

export function MiningTerminal({ power }: TerminalProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
            const rawHash = parseInt(power) || 100;
            const log = template
                .replace('{temp}', (60 + Math.random() * 15).toFixed(1))
                .replace('{fan}', (30 + Math.random() * 40).toFixed(0))
                .replace('{hash}', (rawHash + (Math.random() - 0.5) * 5).toFixed(2))
                .replace('{ping}', (20 + Math.random() * 30).toFixed(0));

            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            setLogs(prev => [...prev.slice(-20), `[${time}] ${log}`]);
        }, 800 + Math.random() * 1000);

        return () => clearInterval(interval);
    }, [power]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs h-64 flex flex-col">
            <div className="text-primary mb-2 border-b border-border pb-2">
                root@mining-rig:~# ./start_miner.sh --pool us-east --wallet ******
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {logs.map((log, i) => (
                    <div key={i} className="text-muted-foreground">
                        <span className="text-muted-foreground">&gt;</span> {log}
                    </div>
                ))}
                <div className="animate-pulse text-primary">_</div>
            </div>
        </div>
    );
}
