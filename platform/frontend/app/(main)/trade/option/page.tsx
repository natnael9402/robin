import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { TradeOptionPage } from '../../../../src/features/trade/TradeOptionPage';

export default function Page() {
  return (
    <GatedRoute>
      <TradeOptionPage />
    </GatedRoute>
  );
}
