import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { AssetsPage } from '../../../src/features/assets/AssetsPage';

export default function Page() {
  return (
    <GatedRoute>
      <AssetsPage />
    </GatedRoute>
  );
}
