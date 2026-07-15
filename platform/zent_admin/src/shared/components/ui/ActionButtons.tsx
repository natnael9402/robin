'use client';

import { type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/shared/lib/utils';

export interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  approveText?: string;
  rejectText?: string;
  approveIcon?: ReactNode;
  rejectIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  approveVariant?: 'primary' | 'success';
  rejectVariant?: 'danger' | 'outline';
}

export function ActionButtons({
  onApprove,
  onReject,
  approveText = 'Approve',
  rejectText = 'Reject',
  approveIcon,
  rejectIcon,
  loading = false,
  disabled = false,
  className,
  layout = 'horizontal',
  approveVariant = 'success',
  rejectVariant = 'danger',
}: ActionButtonsProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={cn(
        'gap-3',
        isHorizontal ? 'flex items-center' : 'flex flex-col',
        className
      )}
    >
      <Button
        variant={rejectVariant}
        size={isHorizontal ? 'md' : 'lg'}
        onClick={onReject}
        disabled={disabled || loading}
        loading={loading}
        leftIcon={rejectIcon}
        className={cn(isHorizontal ? '' : 'w-full')}
      >
        {rejectText}
      </Button>
      <Button
        variant={approveVariant}
        size={isHorizontal ? 'md' : 'lg'}
        onClick={onApprove}
        disabled={disabled || loading}
        loading={loading}
        leftIcon={approveIcon}
        className={cn(isHorizontal ? '' : 'w-full')}
      >
        {approveText}
      </Button>
    </div>
  );
}

export interface SingleActionButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'success';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export function SingleActionButton({
  onClick,
  children,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  className,
  size = 'md',
  fullWidth = false,
}: SingleActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      leftIcon={icon}
      fullWidth={fullWidth}
      className={className}
    >
      {children}
    </Button>
  );
}