import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { PositionsPage } from '../../../../src/features/options/PositionsPage';

export default function Page() {
  return (
    <GatedRoute>
      <PositionsPage />
    </GatedRoute>
  );
}
