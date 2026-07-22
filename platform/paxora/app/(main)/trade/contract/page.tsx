import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { TradeContractPage } from '../../../../src/features/trade/TradeContractPage';

export default function Page() {
  return (
    <GatedRoute>
      <TradeContractPage />
    </GatedRoute>
  );
}
