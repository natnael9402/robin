import { GatedRoute } from '../../../../src/shared/components/GatedRoute';
import { AboutUsPage } from '../../../../src/features/profile/AboutUsPage';

export default function Page() {
  return (
    <GatedRoute>
      <AboutUsPage />
    </GatedRoute>
  );
}
