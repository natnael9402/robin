import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { MyHostingsPage } from '../../../../src/features/arbitrage/MyHostingsPage';

export default function Page() {
  return (
    <GatedRoute>
      <MyHostingsPage />
    </GatedRoute>
  );
}
