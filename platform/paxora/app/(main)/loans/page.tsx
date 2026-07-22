import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { LoansPage } from '../../../src/features/loans/LoansPage';

export default function Page() {
  return (
    <GatedRoute>
      <LoansPage />
    </GatedRoute>
  );
}
