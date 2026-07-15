import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { TradeHistoryPage } from '../../../../src/features/profile/TradeHistoryPage';

export default function Page() {
  return (
    <GatedRoute>
      <TradeHistoryPage />
    </GatedRoute>
  );
}
