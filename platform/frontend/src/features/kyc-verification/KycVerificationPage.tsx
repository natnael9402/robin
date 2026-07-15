'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useMutation } from '@tanstack/react-query';
import { verificationApi } from '../../shared/api';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { SelectGrid } from '../../shared/components/ui/SelectGrid';
import { CameraUpload } from '../../shared/components/ui/CameraUpload';
import { useToast } from '../../shared/contexts/ToastContext';
import { KycMotionGraphic } from './components/KycMotionGraphic';
import { ProgressSteps } from '../../shared/components/ui/ProgressSteps';
import { useAuth } from '../../shared/contexts/AuthContext';
import { ChevronRight } from 'lucide-react';

const STEPS = [
  { label: 'Document Type' },
  { label: 'Upload Documents' },
  { label: 'Selfie' },
  { label: 'Review' },
];

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driving_license', label: 'Driver License' },
];

function useSubmitKyc() {
  return useMutation({
    mutationFn: verificationApi.submit,
  });
}

export function KycVerificationPage() {
  useDocumentTitle('Verify Identity · Paxora');
  const router = useRouter();
  const toast = useToast();
  const { user, clearNewSignup, refresh } = useAuth();

  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState('passport');
  const [docNumber, setDocNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const submit = useSubmitKyc();

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (user?.kycStatus === 'approved' || user?.kycStatus === 'verified') {
      router.push('/home');
    } else if (user?.kycStatus === 'pending') {
      router.push('/kyc-pending');
    }
  }, [user, router]);

  const canNextStep = () => {
    switch (step) {
      case 0: return docType.trim().length > 0 && docNumber.trim().length > 0;
      case 1: return frontImage !== null && backImage !== null;
      case 2: return selfieImage !== null;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canNextStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    try {
      await submit.mutateAsync({
        documentType: docType,
        documentNumber: docNumber.trim(),
        frontImage: frontImage!,
        backImage: backImage!,
        selfieImage: selfieImage!,
      });
      clearNewSignup();
      router.push('/kyc-pending');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SelectGrid
              label="Document Type"
              options={DOC_TYPES}
              value={docType}
              onChange={(v) => setDocType(v)}
            />
            <Input
              label="Document Number"
              value={docNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocNumber(e.target.value)}
              placeholder="AB1234567"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CameraUpload label="Front of Document" value={frontImage} onChange={setFrontImage} />
            <CameraUpload label="Back of Document" value={backImage} onChange={setBackImage} />
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CameraUpload label="Selfie with Document" facingMode="user" value={selfieImage} onChange={setSelfieImage} />
          </div>
        );

      case 3:
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-2xl bg-surface border border-border p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">Document Type</span>
                <span className="text-sm font-bold text-foreground uppercase">{docType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">Document Number</span>
                <span className="text-sm font-bold text-foreground">{docNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">Front Image</span>
                <span className="text-sm font-bold text-primary">{frontImage?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">Back Image</span>
                <span className="text-sm font-bold text-primary">{backImage?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">Selfie</span>
                <span className="text-sm font-bold text-primary">{selfieImage?.name}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-3 sm:px-4 py-3">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-black/95 border border-primary/20 p-4 sm:p-6 shadow-[0_15px_40px_-15px_var(--primary-glow)]">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

          {/* Step progress */}
          <div className="relative z-10 mb-3">
            <ProgressSteps steps={STEPS} currentStep={step} onStepClick={(s) => setStep(s)} />
          </div>

          {/* Motion graphic slot */}
          <div className="relative z-10 flex justify-center">
            <KycMotionGraphic />
          </div>

          {/* Step content */}
          <div className="relative z-10 mb-3">
            <h2 className="text-sm sm:text-base font-black text-white mb-0.5 text-center tracking-tight">
              {step === 0 && 'Select Document'}
              {step === 1 && 'Upload Documents'}
              {step === 2 && 'Upload Selfie'}
              {step === 3 && 'Review & Submit'}
            </h2>
            <p className="text-[11px] text-white/60 text-center mb-3">
              {step === 0 && 'Choose your ID type and enter the document number'}
              {step === 1 && 'Upload the front and back of your document'}
              {step === 2 && 'Take a selfie holding your document'}
              {step === 3 && 'Verify all information before submitting'}
            </p>
            {renderStep()}
          </div>

          {/* Actions */}
          <div className="relative z-10 space-y-2">
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<ChevronRight className="w-4 h-4" />}
                disabled={!canNextStep()}
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                fullWidth
                loading={submit.isPending}
                onClick={handleSubmit}
              >
                Submit Verification
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
