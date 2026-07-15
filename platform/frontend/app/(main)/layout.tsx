'use client';

import { AuthGateProvider } from '../../src/shared/contexts/AuthGateContext';
import { MainShell } from '../../src/shared/components/MainShell';
import { KycGate } from '../../src/shared/components/KycGate';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGateProvider>
      <KycGate>
        <MainShell>{children}</MainShell>
      </KycGate>
    </AuthGateProvider>
  );
}
