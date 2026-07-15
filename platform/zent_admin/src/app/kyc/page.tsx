'use client';

import { useEffect, useState } from 'react';
import { getPendingVerifications, approveVerification, rejectVerification } from '@/lib/api';
import { Check, X, CreditCard, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ActionButtons } from '@/shared/components/ui/ActionButtons';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';

const getImageUrl = (urlPath: string | undefined | null) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('http')) return urlPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${baseUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

interface VerificationCardProps {
  item: any;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function VerificationCard({ item, onApprove, onReject }: VerificationCardProps) {
  return (
    <Card padding="lg" className="shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            <User size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{item.user?.name ?? item.fullName ?? 'Unknown User'}</h3>
            <p className="text-xs text-muted-foreground">User ID: #{item.userId ?? item.user?.id ?? '—'}</p>
          </div>
        </div>
        <StatusBadge status="pending" dot />
      </div>

      <div className="space-y-3 mb-6 bg-surface-hover p-3 rounded-lg border border-border-light">
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Document Type</p>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground capitalize">
            <CreditCard size={14} className="text-muted-foreground" />
            {(item.documentType ?? item.document_type ?? '—').replace(/_/g, ' ')}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Document Number</p>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground font-mono">
            <FileText size={14} className="text-muted-foreground" />
            {item.documentNumber}
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="pt-2 border-t border-border-light mt-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Uploaded Documents</p>
          <div className="flex gap-2">
            {getImageUrl(item.frontImage || item.front_image_url || item.front_image) && (
              <a 
                href={getImageUrl(item.frontImage || item.front_image_url || item.front_image)} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 block h-24 rounded-md overflow-hidden border border-border-light hover:border-primary transition-colors bg-zinc-100 dark:bg-zinc-900"
              >
                 <img src={getImageUrl(item.frontImage || item.front_image_url || item.front_image)} alt="Front" className="w-full h-full object-cover" />
              </a>
            )}
            {getImageUrl(item.backImage || item.back_image_url || item.back_image) && (
              <a 
                href={getImageUrl(item.backImage || item.back_image_url || item.back_image)} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 block h-24 rounded-md overflow-hidden border border-border-light hover:border-primary transition-colors bg-zinc-100 dark:bg-zinc-900"
              >
                 <img src={getImageUrl(item.backImage || item.back_image_url || item.back_image)} alt="Back" className="w-full h-full object-cover" />
              </a>
            )}
          </div>
        </div>
      </div>

      <ActionButtons
        onApprove={() => onApprove(item.id)}
        onReject={() => onReject(item.id)}
        approveIcon={<Check size={16} />}
        rejectIcon={<X size={16} />}
      />
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border-light border-dashed">
      <Check className="w-12 h-12 text-zinc-300 mb-4" />
      <p className="text-muted-foreground font-medium">No pending verification requests</p>
    </div>
  );
}

export default function KYCPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = () => {
    setLoading(true);
    getPendingVerifications()
      .then(setVerifications)
      .catch((err) => {
        console.error(err);
        alert('Failed to load pending verifications');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this verification request?')) return;
    try {
      await approveVerification(id);
      fetchVerifications();
    } catch (error: any) {
      alert(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this verification request?')) return;
    try {
      await rejectVerification(id);
      fetchVerifications();
    } catch (error: any) {
      alert(error.message || 'Failed to reject');
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4 lg:p-8 lg:pt-16">
        <PageHeader
          title="KYC Requests"
          subtitle="Manage identity verification submissions"
          badge={
            <StatusBadge status="pending" size="sm">
              {verifications.length} Pending
            </StatusBadge>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : verifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifications.map((item) => (
              <VerificationCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}