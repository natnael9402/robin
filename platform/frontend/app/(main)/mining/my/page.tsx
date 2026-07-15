import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { MyPoolsPage } from '../../../../src/features/mining/MyPoolsPage';

export default function Page() {
  return (
    <GatedRoute>
      <MyPoolsPage />
    </GatedRoute>
  );
}
