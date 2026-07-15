import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { OptionsPage } from '../../../src/features/options/OptionsPage';

export default function Page() {
  return (
    <GatedRoute>
      <OptionsPage />
    </GatedRoute>
  );
}
