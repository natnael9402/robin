'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../../src/shared/components/ui/BottomNav';
import { AuthGateProvider } from '../../../src/shared/contexts/AuthGateContext';

export default function TermsPage() {
  const router = useRouter();

  return (
    <AuthGateProvider>
      <div className="min-h-screen bg-background pb-28 md:pb-0">
        {/* Sticky header: back button + title */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl px-4 pt-12 pb-4 border-b border-white/5">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-foreground transition-transform active:scale-95 hover:scale-105 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div>
              <Link href="/onboarding" className="inline-block text-xl sm:text-2xl font-black text-primary tracking-widest drop-shadow-[0_0_20px_rgba(180,134,8,0.3)] hover:opacity-90 transition-opacity">
                PAXORA
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight mt-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                Terms of Service
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Last updated: June 2026</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-12 sm:pb-20">
          <div className="mx-auto w-full max-w-2xl space-y-8 p-5 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl">

            <div className="space-y-5 sm:space-y-6 text-sm sm:text-[15px] text-muted-foreground leading-[1.65] sm:leading-relaxed">
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Paxora Capital platform, website, and related services. By creating an account or using our services, you agree to be bound by these Terms.
              </p>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>1. Acceptance</h2>
                <p>
                  By registering for or using the Paxora platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any additional terms incorporated by reference. If you do not agree, you must not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>2. Eligibility</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You must be at least 18 years old (or the age of majority in your jurisdiction)</li>
                  <li>You must have the legal capacity to enter into binding contracts</li>
                  <li>You must not be a resident of any jurisdiction where trading cryptocurrency is restricted or prohibited</li>
                  <li>You must not be listed on any sanctions or restricted-party lists</li>
                  <li>You must provide accurate, current, and complete registration information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>3. Account Registration & Security</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activity occurring under your account. You agree to notify us immediately of any unauthorized access or security breach. We are not liable for any loss or damage arising from your failure to safeguard your account.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>4. Risk Disclosure</h2>
                <div className="space-y-2">
                  <p><strong className="text-foreground">Trading Risk:</strong> Trading financial instruments carries substantial risk. Prices can fluctuate significantly, and past performance is not indicative of future results. You may lose some or all of your invested capital.</p>
                  <p><strong className="text-foreground">Arbitrage & Mining Risk:</strong> Returns from arbitrage hosting and mining activities depend on market conditions, network difficulty, and other factors that are inherently unpredictable.</p>
                  <p><strong className="text-foreground">No Guarantees:</strong> Paxora does not guarantee any specific return, profit, or performance. All investments and trading decisions are made at your own risk.</p>
                  <p><strong className="text-foreground">Professional Advice:</strong> The information provided on our platform does not constitute financial, legal, or investment advice. Consult a qualified professional before making financial decisions.</p>
                </div>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>5. Fees & Transactions</h2>
                <p>
                  All applicable fees are displayed at the time of transaction. Paxora reserves the right to modify fee schedules with reasonable notice. You are responsible for any network fees (gas fees, blockchain transaction fees) associated with your activities.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>6. Prohibited Activities</h2>
                <p>You agree not to engage in any of the following:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Using the platform for illegal, fraudulent, or unauthorized purposes</li>
                  <li>Manipulating prices, volumes, or exploiting system vulnerabilities</li>
                  <li>Launching denial-of-service attacks or otherwise disrupting platform operations</li>
                  <li>Reverse-engineering, decompiling, or attempting to extract source code</li>
                  <li>Creating multiple accounts to abuse promotions or referral programs</li>
                  <li>Money laundering, terrorist financing, or any activity prohibited by applicable law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>7. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time, with or without cause, including for violation of these Terms or suspicious activity. Upon termination, your right to access the platform ceases immediately. Outstanding obligations (e.g., pending withdrawals) will be processed in accordance with our standard procedures.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Paxora Capital, its affiliates, directors, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>9. Intellectual Property</h2>
                <p>
                  The Paxora name, logo, platform design, and all related intellectual property are owned by Paxora Capital. You may not reproduce, distribute, or create derivative works without our prior written consent.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>10. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Gibraltar. Any disputes arising under these Terms shall be resolved through binding arbitration in accordance with the rules of the Gibraltar Arbitration Centre.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>11. Changes to Terms</h2>
                <p>
                  We may modify these Terms at any time. Material changes will be communicated via email or platform notice. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>12. Contact</h2>
                <p>
                  For questions about these Terms, please contact us:
                </p>
                <p className="mt-2 text-foreground">
                  Email: <span className="text-primary font-bold">Info@paxorapremiumlab.com</span><br />
                  Address: Paxora Capital Ltd., Gibraltar
                </p>
              </section>
            </div>

            <div className="pt-4 border-t border-white/5 text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <Link href="/signup" className="text-primary font-bold text-sm hover:underline">
                Sign Up
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/legal/privacy" className="text-primary font-bold text-sm hover:underline">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/profile" className="text-primary font-bold text-sm hover:underline">
                Profile
              </Link>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </AuthGateProvider>
  );
}
