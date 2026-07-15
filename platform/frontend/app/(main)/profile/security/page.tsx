import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { SecurityPage } from '../../../../src/features/profile/SecurityPage';

export default function Page() {
  return (
    <GatedRoute>
      <SecurityPage />
    </GatedRoute>
  );
}
