'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-primary" />,
        error: <AlertCircle className="w-5 h-5 text-destructive" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const borderColors = {
        success: 'border-primary',
        error: 'border-destructive', // User asked for black and green borders, but for error maybe red? 
        // User said: "it should be black and green borders from the colors of the button"
        // I will stick to green borders for everything as requested, or maybe red for error if it looks better?
        // "show clear messages on errors ok use shadcn toast that comes from the up of the screen it should be black and green borders from the colors of the button"
        // implies ANY message. I'll use green border for consistency with the requested style.
        info: 'border-blue-500',
    };

    // Override: User requested "black and green borders". Let's use green for specific request, 
    // but usually error is red. I'll use green as primary accent to match the "button colors".
    // Actually, let's keep it consistent:
    const borderColor = 'border-primary';

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            layout
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border ${borderColor} bg-background/90 p-4 shadow-2xl backdrop-blur-md text-foreground`}
        >
            <div className="shrink-0">
                {type === 'error' ? <AlertCircle className="w-5 h-5 text-primary" /> : icons[type]}
            </div>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};
