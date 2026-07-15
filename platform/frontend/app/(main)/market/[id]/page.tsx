// Legacy /market/[id] route — unified onto the premium crypto detail page so
// there is a single, maintained detail experience. The market list links to
// /market/crypto/[id] and /market/stock/[symbol]; this keeps old links working.
import { CryptoDetailPage } from '../../../../src/features/market/DetailPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CryptoDetailPage params={params} />;
}
