'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open || !closeOnEscape) return;
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'glass-strong relative w-full rounded-2xl border border-glass-border shadow-glass-lg animate-in zoom-in-95 duration-200',
          sizeStyles[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border-light">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover',
                'transition-colors flex-shrink-0',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border-light bg-surface/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-muted-foreground">{message}</p>
      <Modal.Footer>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const SUGGESTED_REJECT_REASONS = [
  'Insufficient payment proof',
  'Incorrect wallet address',
  'Payment details do not match',
  'Suspected fraud',
  'Duplicate request',
  'Limit exceeded',
  'Policy violation',
];

export interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  reasonPlaceholder?: string;
  loading?: boolean;
}

export function RejectModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Reject',
  cancelText = 'Cancel',
  reasonPlaceholder = 'Enter the reason for rejection...',
  loading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setReason('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} description={message} size="sm">
      <div className="space-y-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTED_REJECT_REASONS.map((suggestion) => {
              const active = reason === suggestion;
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setReason(suggestion);
                    setError('');
                  }}
                  disabled={loading}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50',
                    active
                      ? 'border-primary text-primary'
                      : 'border-border-medium bg-surface text-muted-foreground hover:border-primary/60 hover:text-foreground'
                  )}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error && e.target.value.trim()) setError('');
            }}
            placeholder={reasonPlaceholder}
            rows={4}
            disabled={loading}
            className={cn(
              'w-full resize-none rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50',
              error ? 'border-destructive' : 'border-border-medium'
            )}
          />
          {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
        <p className="text-xs text-muted-foreground">The user will receive this reason as a notification.</p>
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

Modal.Footer = function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-3">{children}</div>;
};