import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { ArbitragePage } from '../../../../src/features/arbitrage/ArbitragePage';

export default function Page() {
  return (
    <GatedRoute>
      <ArbitragePage />
    </GatedRoute>
  );
}
