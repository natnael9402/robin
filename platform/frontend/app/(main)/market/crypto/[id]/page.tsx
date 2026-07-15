import { CryptoDetailPage } from '../../../../../src/features/market/DetailPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CryptoDetailPage params={params} />;
}
