'use client';

import { useEffect, useState } from 'react';
import { getKycSubmissionsByStatus, approveVerification, rejectVerification } from '@/lib/api';
import { Check, X, CreditCard, User, FileText } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import { ActionButtons } from '@/shared/components/ui/ActionButtons';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { cn } from '@/shared/lib/utils';

const getImageUrl = (urlPath: string | undefined | null) => {
  if (!urlPath) return '';
  if (urlPath.startsWith('http')) return urlPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${baseUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
};

const statusMap: Record<string, 'pending' | 'approved' | 'rejected'> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

interface VerificationCardProps {
  item: any;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  showActions?: boolean;
}

function VerificationCard({ item, onApprove, onReject, showActions = true }: VerificationCardProps) {
  const status = statusMap[item.status] || 'pending';
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
        <StatusBadge status={status} dot />
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
        {/* Rejection Reason */}
        {status === 'rejected' && (item.rejectionReason ?? item.rejection_reason) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 mt-3">
            <p className="text-[10px] font-bold uppercase text-destructive mb-0.5">Rejection Reason</p>
            <p className="text-xs text-foreground">{item.rejectionReason ?? item.rejection_reason}</p>
          </div>
        )}
      </div>

      {showActions && (
        <ActionButtons
          onApprove={() => onApprove(item.id)}
          onReject={() => onReject(item.id)}
          approveIcon={<Check size={16} />}
          rejectIcon={<X size={16} />}
        />
      )}
    </Card>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border-light border-dashed">
      <Check className="w-12 h-12 text-zinc-300 mb-4" />
      <p className="text-muted-foreground font-medium">No {tab} KYC requests</p>
    </div>
  );
}

export default function KYCPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchVerifications = (status: string) => {
    setLoading(true);
    getKycSubmissionsByStatus(status as any)
      .then(setVerifications)
      .catch((err) => {
        console.error(err);
        alert('Failed to load KYC submissions');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifications(tab);
  }, [tab]);

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this verification request?')) return;
    try {
      await approveVerification(id);
      fetchVerifications(tab);
    } catch (error: any) {
      alert(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this verification request?')) return;
    try {
      await rejectVerification(id);
      fetchVerifications(tab);
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
            <StatusBadge status={tab} size="sm">
              {verifications.length} {tab}
            </StatusBadge>
          }
        />

        <div className="mb-6 flex gap-1 rounded-2xl border border-glass-border bg-glass-bg p-1 shadow-glass w-fit">
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all',
                tab === t ? 'bg-foreground text-background shadow-glass' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t} {!loading && tab === t && <span className="ml-1 opacity-60">{verifications.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : verifications.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifications.map((item) => (
              <VerificationCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={tab === 'pending'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}