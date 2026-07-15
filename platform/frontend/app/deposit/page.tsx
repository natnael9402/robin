'use client';

import { KycGate } from '../../src/shared/components/KycGate';
import { DepositPage } from '../../src/features/deposit/DepositPage';

export default function Page() {
  return (
    <KycGate>
      <DepositPage />
    </KycGate>
  );
}
