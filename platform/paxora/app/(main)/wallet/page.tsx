import { GatedRoute } from '../../../src/shared/components/GatedRoute';
import { WalletPage } from '../../../src/features/wallet/WalletPage';

export default function Page() {
  return (
    <GatedRoute>
      <WalletPage />
    </GatedRoute>
  );
}
