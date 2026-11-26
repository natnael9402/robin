import { Suspense } from 'react';
import { VerifyEmailPage } from '../../src/features/auth/VerifyEmailPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading…</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
