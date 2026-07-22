import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { ReferralPage } from '../../../src/features/referral/ReferralPage';

export default function Page() {
  return (
    <GatedRoute>
      <ReferralPage />
    </GatedRoute>
  );
}
