'use client';

import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808] text-white" style={{ colorScheme: 'dark' }}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <img src="/onboard.png" alt="Welcome" className="w-full h-full object-cover" />
        </div>
        <div className="shrink-0 px-5 pb-8 pt-4 space-y-3">
          <button
            onClick={() => router.push('/signup')}
            className="w-full rounded-2xl bg-[#2563EB] py-3.5 text-sm font-bold text-black transition-all active:scale-[0.98] hover:shadow-[0_0_24px_rgba(37,99,235,0.3)]"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full rounded-2xl border border-white/10 py-3.5 text-sm font-bold text-white/70 transition-all active:scale-[0.98] hover:bg-white/[0.04]"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
