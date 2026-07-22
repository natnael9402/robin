'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Market', icon: BarChart2, path: '/market' },
    { label: 'Wallet', icon: Wallet, path: '/wallet' },
    { label: 'Profile', icon: User, path: '/profile' },
];

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
            <div className="bg-[#111] border border-border-light rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto flex justify-around items-center h-20 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="relative flex flex-col items-center justify-center w-16 h-full"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute top-2 w-10 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon
                                className={cn(
                                    'w-6 h-6 transition-all duration-300',
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                )}
                            />
                            {/* <span
              className={cn(
                'text-[10px] mt-1 font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span> */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
