'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../../shared/api';
import { config } from '../../shared/lib/config';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { PageHeader } from '../../shared/components/ui/PageHeader';
import { SelectGrid } from '../../shared/components/ui/SelectGrid';
import { useToast } from '../../shared/contexts/ToastContext';
import { Modal } from '../../shared/components/ui/Modal';
import { FileUpload } from '../../shared/components/ui/FileUpload';
import { VerificationMotionGraphic } from './components/VerificationMotionGraphic';
import type { Verification } from '../../shared/types';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'driving_license', label: 'Driver License' },
];

function useVerificationStatus() {
  return useQuery<Verification>({
    queryKey: ['verification', 'status'],
    queryFn: () => verificationApi.getStatus(),
    staleTime: config.staleTime,
  });
}

function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verificationApi.submit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verification', 'status'] }),
  });
}

export function VerificationPage() {
  useDocumentTitle('Verification · Paxora Capital');
  const router = useRouter();
  const { data } = useVerificationStatus();
  const [open, setOpen] = useState(false);

  return (
    <div className="pb-24 md:pb-12 md:max-w-4xl md:mx-auto px-6 md:px-0 min-h-[calc(100dvh-80px)] flex flex-col">
      
      <div className="sticky top-0 z-10 pt-16 md:pt-10 bg-background pb-2 -mx-6 px-6 md:mx-0 md:px-0">
        <PageHeader title="Verification" className="mb-0" />
      </div>
      
      {/* Centered container for the box */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative overflow-hidden rounded-[32px] bg-black/95 border border-primary/20 p-8 shadow-[0_15px_40px_-15px_var(--primary-glow)] flex flex-col items-center text-center w-full max-w-sm">
          
          {/* Glows */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
          
          {/* Motion Graphics */}
          <VerificationMotionGraphic />
          
          <h2 className="relative z-10 text-xl font-black text-white mb-2 tracking-tight">
            {data?.status === 'approved' ? 'Fully Verified' : data?.status === 'pending' ? 'Verification Pending' : data?.status === 'rejected' ? 'Verification Rejected' : 'Secure Account'}
          </h2>
          
          <p className="relative z-10 text-xs font-medium text-white/60 mb-6 max-w-[240px] leading-relaxed">
            {data?.status === 'approved' ? 'Your identity is verified. Enjoy full access and maximum withdrawal limits.' : 'Complete the KYC process securely to confirm your identity and unlock trading.'}
          </p>
          
          {data?.status !== 'approved' && (
            <button
              onClick={() => setOpen(true)}
              className="relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-primary-foreground font-black text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_var(--primary-glow)] w-full overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_forwards]" />
              <FileText className="w-4 h-4 relative z-10" /> 
              <span className="relative z-10">{data?.status === 'pending' ? 'Resubmit Documents' : 'Start Verification'}</span>
            </button>
          )}
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface/40 border border-white/5 hover:bg-white/5 transition-colors text-sm font-bold text-foreground mt-4 shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <SubmitModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function SubmitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [docType, setDocType] = useState('passport');
  const [docNumber, setDocNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const submit = useSubmitVerification();
  const toast = useToast();

  const handle = async () => {
    if (!docNumber.trim()) return toast.error('Enter your document number');
    if (!frontImage) return toast.error('Upload the front of your document');
    if (!backImage) return toast.error('Upload the back of your document');
    if (!selfieImage) return toast.error('Upload a selfie holding your document');
    try {
      await submit.mutateAsync({
        documentType: docType,
        documentNumber: docNumber.trim(),
        frontImage,
        backImage,
        selfieImage,
      });
      toast.success('Verification submitted successfully. Please allow 5 to 24 hours for review.');
      setDocNumber('');
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title="Submit Verification">
      <div className="space-y-4">
        <SelectGrid
          label="Document Type"
          options={DOC_TYPES}
          value={docType}
          onChange={setDocType}
          columns={3}
        />
        <Input label="Document Number" value={docNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocNumber(e.target.value)} placeholder="AB1234567" />
        <FileUpload label="Document Front" value={frontImage} onChange={setFrontImage} />
        <FileUpload label="Document Back" value={backImage} onChange={setBackImage} />
        <FileUpload label="Selfie with Document" value={selfieImage} onChange={setSelfieImage} />
        <Button variant="primary" size="lg" fullWidth onClick={handle} loading={submit.isPending}>
          Submit
        </Button>
      </div>
    </Modal>
  );
}
