import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { MiningPage } from '../../../../src/features/mining/MiningPage';

export default function Page() {
  return (
    <GatedRoute>
      <MiningPage />
    </GatedRoute>
  );
}
