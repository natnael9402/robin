'use client';

import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { HomeHeader } from './components/HomeHeader';
import { AppGrid } from './components/AppGrid';
import { MarketsSection } from './components/MarketsSection';

export function HomePage() {
  useDocumentTitle('Home · Paxora Capital');
  return (
    <div className="p-6 pt-10 pb-24 md:pb-12 md:max-w-[1600px] md:mx-auto md:px-10 xl:px-16">
      <HomeHeader />
      <AppGrid />
      <MarketsSection />
    </div>
  );
}
