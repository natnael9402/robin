'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../../src/shared/components/ui/BottomNav';
import { AuthGateProvider } from '../../../src/shared/contexts/AuthGateContext';

export default function PrivacyPage() {
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
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Last updated: June 2026</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-12 sm:pb-20">
          <div className="mx-auto w-full max-w-2xl space-y-8 p-5 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl">

            <div className="space-y-5 sm:space-y-6 text-sm sm:text-[15px] text-muted-foreground leading-[1.65] sm:leading-relaxed">
              <p>
                Paxora Capital (&quot;Paxora,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services.
              </p>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>1. Information We Collect</h2>
                <div className="space-y-2">
                  <p><strong className="text-foreground">Account Information:</strong> When you register, we collect your name, email address, and encrypted password. You may also provide a profile picture and communication preferences.</p>
                  <p><strong className="text-foreground">Transaction Data:</strong> We record all trading, deposit, withdrawal, and arbitrage hosting activity associated with your account to maintain accurate ledgers and comply with regulatory obligations.</p>
                  <p><strong className="text-foreground">Device & Usage Data:</strong> We automatically collect your IP address, browser type, operating system, device identifiers, and pages visited to improve platform security and performance.</p>
                  <p><strong className="text-foreground">Verification Data:</strong> If you complete KYC identity verification, we collect government-issued identification documents and selfie images. This data is encrypted and stored securely.</p>
                </div>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>2. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Operate, maintain, and improve your trading experience</li>
                  <li>Process transactions and send confirmations</li>
                  <li>Detect and prevent fraud, abuse, and unauthorized access</li>
                  <li>Comply with applicable laws and regulatory requirements</li>
                  <li>Send service-related communications (security alerts, policy updates)</li>
                  <li>Personalize your dashboard and recommendations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>3. Data Sharing & Disclosure</h2>
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who help us host, monitor, and secure our platform (e.g., cloud infrastructure, analytics). They are contractually bound to protect your data.</li>
                  <li><strong className="text-foreground">Legal Authorities:</strong> If required by law, subpoena, or court order, we may disclose information to government entities.</li>
                  <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your data may be transferred to the acquiring entity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>4. Data Security</h2>
                <p>
                  We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, multi-factor authentication options, and regular third-party security audits. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>5. Your Rights</h2>
                <p>Depending on your jurisdiction, you may have the right to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Data portability — receive your data in a structured, machine-readable format</li>
                  <li>Withdraw consent at any time where processing is based on consent</li>
                </ul>
                <p className="mt-2">To exercise these rights, contact us at <span className="text-primary font-bold">Info@paxorapremiumlab.com</span>. We will respond within 30 days.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>6. Cookies & Tracking</h2>
                <p>
                  We use essential cookies to maintain session state and security. Analytics cookies help us understand platform usage. You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>7. Data Retention</h2>
                <p>
                  We retain your account data for as long as your account is active and for a period thereafter to comply with legal obligations, resolve disputes, and enforce agreements. Transaction records are retained for a minimum of 5 years per regulatory requirements.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>8. International Transfers</h2>
                <p>
                  Your data may be processed in countries outside your residence. We ensure appropriate safeguards (Standard Contractual Clauses, Data Processing Agreements) are in place to protect your data in accordance with applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Material changes will be notified via email or a prominent notice on our platform. Continued use after changes take effect constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>10. Contact</h2>
                <p>
                  For questions, concerns, or data requests, contact our Data Protection Officer:
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
              <Link href="/legal/terms" className="text-primary font-bold text-sm hover:underline">
                Terms of Service
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
