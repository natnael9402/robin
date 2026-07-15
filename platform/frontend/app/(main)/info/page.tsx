import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { InfoPage } from '../../../src/features/info/InfoPage';

export default function Page() {
  return (
    <GatedRoute>
      <InfoPage />
    </GatedRoute>
  );
}
