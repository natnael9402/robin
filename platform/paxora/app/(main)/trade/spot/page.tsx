import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { TradeSpotPage } from '../../../../src/features/trade/TradeSpotPage';

export default function Page() {
  return (
    <GatedRoute>
      <TradeSpotPage />
    </GatedRoute>
  );
}
