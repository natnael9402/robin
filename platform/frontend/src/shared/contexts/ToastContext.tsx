'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const iconFor = (variant: ToastVariant) => {
  switch (variant) {
    case 'success': return CheckCircle2;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    default: return Info;
  }
};

const colorFor = (variant: ToastVariant) => {
  switch (variant) {
    case 'success': return 'bg-green-500 text-white border-green-400/40 shadow-lg shadow-green-500/30';
    case 'error': return 'border-destructive/40 text-destructive';
    case 'warning': return 'border-warning/40 text-warning';
    default: return 'border-border text-foreground';
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error', 5000),
    info: (m) => show(m, 'info'),
    warning: (m) => show(m, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = iconFor(t.variant);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  t.variant === 'success' ? '' : 'glass',
                  'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-[90vw]',
                  colorFor(t.variant)
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium flex-1">{t.message}</span>
                <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
