'use client';

import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function ProgressSteps({ steps, currentStep, onStepClick }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isClickable = isCompleted && onStepClick;
        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(idx)}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary border-2 border-primary',
                  !isCompleted && !isCurrent && 'bg-surface text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-110 active:scale-95',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </button>
              <span
                className={cn(
                  'text-[10px] font-semibold text-center leading-tight hidden sm:block whitespace-nowrap',
                  (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-16 self-center mb-0 sm:mb-[18px] mx-1 rounded-full transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
