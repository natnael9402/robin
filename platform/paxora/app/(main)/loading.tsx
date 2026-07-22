import { PageLoader } from '../../src/shared/components/ui/PageLoader';

// Next.js automatically wraps this route group's pages in <Suspense> with this
// fallback, so every authed page shows the animated PAXORA loader while it loads.
export default function Loading() {
  return <PageLoader />;
}
