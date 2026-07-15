import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { VerificationPage } from '../../../src/features/verification/VerificationPage';

export default function Page() {
  return (
    <GatedRoute>
      <VerificationPage />
    </GatedRoute>
  );
}
