import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { LoanApplicationPage } from '../../../../src/features/loans/LoanApplicationPage';

export default function Page() {
  return (
    <GatedRoute>
      <LoanApplicationPage />
    </GatedRoute>
  );
}
