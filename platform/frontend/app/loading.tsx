import { PageLoader } from '../src/shared/components/ui/PageLoader';

// Root-level Suspense fallback for the unauthenticated routes (login, signup,
// onboarding, legal) and the initial app shell — the animated PAXORA loader.
export default function Loading() {
  return <PageLoader />;
}
