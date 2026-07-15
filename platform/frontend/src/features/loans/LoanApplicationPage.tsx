'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useToast } from '../../shared/contexts/ToastContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../../shared/api';
import { formatCurrency, cn } from '../../shared/lib/utils';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { SelectGrid } from '../../shared/components/ui/SelectGrid';
import { CameraUpload } from '../../shared/components/ui/CameraUpload';
import { ProgressSteps } from '../../shared/components/ui/ProgressSteps';
import {
  WelcomeAnimation,
  LoanDetailsAnimation,
  IdentityAnimation,
  DocumentsAnimation,
  ReviewAnimation,
  SuccessAnimation,
} from './components/LoanStepAnimations';
import {
  ArrowLeft,
  ArrowRight,
  Landmark,
  Check,
  Sparkles,
  Shield,
  Clock,
  Percent,
  CalendarDays,
} from 'lucide-react';

const STEPS = [
  { label: 'Welcome' },
  { label: 'Loan Details' },
  { label: 'Identity' },
  { label: 'Documents' },
  { label: 'Review' },
];

const DURATIONS = [30, 60, 90];
const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driving_license', label: 'Driving License' },
];

function useApplyLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      amount,
      duration,
      documentType,
      frontImage,
      backImage,
    }: {
      amount: number;
      duration: number;
      documentType: string;
      frontImage: File;
      backImage: File;
    }) => loansApi.apply(amount, duration, documentType, frontImage, backImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', 'my'] });
    },
  });
}

export function LoanApplicationPage() {
  useDocumentTitle('Apply for Loan · Paxora Capital');
  const router = useRouter();
  const toast = useToast();
  const apply = useApplyLoan();

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('1000');
  const [duration, setDuration] = useState(30);
  const [documentType, setDocumentType] = useState('passport');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const numAmount = Number(amount);
  const interestRate = 5;
  const totalPayable = numAmount + (numAmount * interestRate) / 100;
  const dailyPayment = totalPayable / duration;

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case 1: return numAmount > 0 && duration > 0;
      case 2: return documentType.length > 0;
      case 3: return frontImage !== null && backImage !== null;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step === STEPS.length - 1) {
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) return;
    try {
      await apply.mutateAsync({
        amount: numAmount,
        duration,
        documentType,
        frontImage,
        backImage,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDone = () => {
    router.push('/loans');
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return (
          <LoanDetailsStep
            amount={amount}
            onAmountChange={setAmount}
            duration={duration}
            onDurationChange={setDuration}
            numAmount={numAmount}
            interestRate={interestRate}
            totalPayable={totalPayable}
            dailyPayment={dailyPayment}
          />
        );
      case 2:
        return (
          <IdentityStep
            documentType={documentType}
            onDocumentTypeChange={setDocumentType}
          />
        );
      case 3:
        return (
          <DocumentsStep
            frontImage={frontImage}
            onFrontImageChange={setFrontImage}
            backImage={backImage}
            onBackImageChange={setBackImage}
          />
        );
      case 4:
        return (
          <ReviewStep
            amount={numAmount}
            duration={duration}
            documentType={documentType}
            frontImage={frontImage}
            backImage={backImage}
            interestRate={interestRate}
            totalPayable={totalPayable}
            dailyPayment={dailyPayment}
          />
        );
      default:
        return null;
    }
  };

  const renderAnimation = () => {
    switch (step) {
      case 0: return <WelcomeAnimation />;
      case 1: return <LoanDetailsAnimation />;
      case 2: return <IdentityAnimation />;
      case 3: return <DocumentsAnimation />;
      case 4: return <ReviewAnimation />;
      default: return null;
    }
  };

  const stepTitles = [
    { title: 'Unlock Liquidity', subtitle: 'Borrow against your portfolio without selling your crypto assets' },
    { title: 'Loan Details', subtitle: 'Choose your loan amount and repayment duration' },
    { title: 'Verify Identity', subtitle: 'Select your document type for verification' },
    { title: 'Upload Documents', subtitle: 'Take a photo or upload your identity document' },
    { title: 'Review & Submit', subtitle: 'Verify all information before submitting your application' },
  ];

  if (submitted) {
    return (
      <div className="pb-24 md:pb-12 md:max-w-lg md:mx-auto px-6 pt-16 md:pt-10 min-h-[calc(100dvh-80px)] flex flex-col items-center justify-center">
        <div className="relative overflow-hidden rounded-[32px] bg-black/95 border border-[#10b981]/20 p-8 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.3)] flex flex-col items-center text-center w-full max-w-sm">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#10b981]/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#10b981]/10 rounded-full blur-[40px] pointer-events-none" />

          <SuccessAnimation />

          <h2 className="relative z-10 text-xl font-black text-white mb-2 tracking-tight">
            Application Submitted
          </h2>
          <p className="relative z-10 text-xs font-medium text-white/60 mb-3 max-w-[260px] leading-relaxed">
            Your loan application for <span className="text-[#10b981] font-bold">${formatCurrency(numAmount)}</span> has been submitted successfully.
          </p>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-white/40 mb-6">
            <Clock className="w-3 h-3" />
            <span>Review typically takes 1-24 hours</span>
          </div>

          <button
            onClick={handleDone}
            className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] w-full"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 md:max-w-lg md:mx-auto px-4 sm:px-6 pt-12 md:pt-8 min-h-[calc(100dvh-80px)] flex flex-col">
      {/* Progress Steps */}
      <div className="shrink-0 mb-4">
        <ProgressSteps steps={STEPS} currentStep={step} onStepClick={(s) => { if (s < step) setStep(s); }} />
      </div>

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-black/95 border border-primary/20 shadow-[0_15px_40px_-15px_var(--primary-glow)] flex flex-col flex-1 min-h-[480px]">
          {/* Background Glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/8 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/8 rounded-full blur-[50px] pointer-events-none" />

          {/* Animation */}
          <div className="relative z-10 flex justify-center pt-6 sm:pt-8 shrink-0" key={`anim-${step}`}>
            {renderAnimation()}
          </div>

          {/* Step Header */}
          <div className="relative z-10 text-center px-5 sm:px-6 shrink-0">
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">
              {stepTitles[step].title}
            </h1>
            <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed max-w-[280px] mx-auto">
              {stepTitles[step].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 py-4 hide-scrollbar">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300" key={step}>
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="relative z-10 p-4 sm:p-5 pt-2 sm:pt-3 space-y-2 shrink-0">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white/50 hover:text-white/80 text-xs font-bold transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={step === STEPS.length - 1 && apply.isPending}
              disabled={!canNext()}
              rightIcon={step === STEPS.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              onClick={handleNext}
              className="shadow-[0_0_25px_var(--primary-glow)]"
            >
              {step === 0 ? 'Get Started' : step === STEPS.length - 1 ? 'Submit Application' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  const features = [
    { icon: <Landmark className="w-4 h-4" />, text: 'Instant approval process' },
    { icon: <Percent className="w-4 h-4" />, text: 'Competitive 5% interest rate' },
    { icon: <Shield className="w-4 h-4" />, text: 'Secure document verification' },
    { icon: <CalendarDays className="w-4 h-4" />, text: 'Flexible 30-90 day terms' },
  ];

  return (
    <div className="space-y-3">
      {features.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
            {f.icon}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-white/70">{f.text}</span>
        </div>
      ))}
    </div>
  );
}

function LoanDetailsStep({
  amount,
  onAmountChange,
  duration,
  onDurationChange,
  numAmount,
  interestRate,
  totalPayable,
  dailyPayment,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  duration: number;
  onDurationChange: (v: number) => void;
  numAmount: number;
  interestRate: number;
  totalPayable: number;
  dailyPayment: number;
}) {
  const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="space-y-4">
      <Input
        label="Loan Amount"
        type="number"
        value={amount}
        leftAdornment={<span className="text-muted-foreground font-mono font-bold text-sm">$</span>}
        onChange={(e) => onAmountChange(e.target.value)}
      />

      <div className="flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((qa) => (
          <button
            key={qa}
            onClick={() => onAmountChange(String(qa))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
              numAmount === qa
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/[0.12] hover:text-white/60'
            )}
          >
            ${formatCurrency(qa, 0)}
          </button>
        ))}
      </div>

      <SelectGrid
        label="Repayment Duration"
        options={DURATIONS.map((d) => ({ value: String(d), label: `${d} days` }))}
        value={String(duration)}
        onChange={(v) => onDurationChange(Number(v))}
        columns={3}
      />

      {numAmount > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Interest</div>
            <div className="text-xs font-black text-primary">{interestRate}%</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Total</div>
            <div className="text-xs font-black text-white">${formatCurrency(totalPayable)}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Daily</div>
            <div className="text-xs font-black text-white">${formatCurrency(dailyPayment)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function IdentityStep({
  documentType,
  onDocumentTypeChange,
}: {
  documentType: string;
  onDocumentTypeChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SelectGrid
        label="Document Type"
        options={DOCUMENT_TYPES}
        value={documentType}
        onChange={onDocumentTypeChange}
        columns={1}
      />

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
        <div className="flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-white/70 mb-0.5">Why do we need this?</p>
            <p className="text-[10px] text-white/35 leading-relaxed">
              We verify your identity to comply with financial regulations and protect your account from unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({
  frontImage,
  onFrontImageChange,
  backImage,
  onBackImageChange,
}: {
  frontImage: File | null;
  onFrontImageChange: (f: File | null) => void;
  backImage: File | null;
  onBackImageChange: (f: File | null) => void;
}) {
  return (
    <div className="space-y-3">
      <CameraUpload
        label="Front of Document"
        value={frontImage}
        onChange={onFrontImageChange}
      />
      <CameraUpload
        label="Back of Document"
        value={backImage}
        onChange={onBackImageChange}
      />

      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-white/70 mb-0.5">Photo Tips</p>
            <p className="text-[10px] text-white/35 leading-relaxed">
              Ensure all corners are visible, text is readable, and the image is well-lit. Avoid glare and shadows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  amount,
  duration,
  documentType,
  frontImage,
  backImage,
  interestRate,
  totalPayable,
  dailyPayment,
}: {
  amount: number;
  duration: number;
  documentType: string;
  frontImage: File | null;
  backImage: File | null;
  interestRate: number;
  totalPayable: number;
  dailyPayment: number;
}) {
  return (
    <div className="space-y-3">
      {/* Loan Summary Card */}
      <div className="rounded-xl bg-primary/[0.06] border border-primary/20 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] text-primary/60 font-bold uppercase tracking-wider">Loan Amount</span>
          <span className="text-lg font-black text-primary">${formatCurrency(amount)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Duration</div>
            <div className="text-xs font-black text-white">{duration}d</div>
          </div>
          <div className="text-center border-x border-white/[0.06]">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Rate</div>
            <div className="text-xs font-black text-white">{interestRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Daily</div>
            <div className="text-xs font-black text-white">${formatCurrency(dailyPayment)}</div>
          </div>
        </div>
      </div>

      {/* Repayment */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Total Repayment</div>
            <div className="text-sm font-black text-white">${formatCurrency(totalPayable)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Verification Details */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04]">
        <div className="flex justify-between items-center px-3.5 py-2.5">
          <span className="text-[11px] text-white/40 font-semibold">Document Type</span>
          <span className="text-xs font-bold text-white/80 uppercase">{documentType.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between items-center px-3.5 py-2.5">
          <span className="text-[11px] text-white/40 font-semibold">Front Image</span>
          <span className="text-[10px] font-mono text-primary truncate max-w-[140px]">{frontImage?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between items-center px-3.5 py-2.5">
          <span className="text-[11px] text-white/40 font-semibold">Back Image</span>
          <span className="text-[10px] font-mono text-primary truncate max-w-[140px]">{backImage?.name ?? '—'}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
        <p className="text-[10px] text-white/30 leading-relaxed text-center">
          By submitting, you confirm that all information provided is accurate.
        </p>
      </div>
    </div>
  );
}
