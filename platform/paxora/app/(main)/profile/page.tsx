import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { ProfilePage } from '../../../src/features/profile/ProfilePage';

export default function Page() {
  return (
    <GatedRoute>
      <ProfilePage />
    </GatedRoute>
  );
}
