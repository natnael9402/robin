'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../../src/shared/components/ui/BottomNav';
import { AuthGateProvider } from '../../../src/shared/contexts/AuthGateContext';

export default function AMLPage() {
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
                Anti-Money Laundering Policy
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Last updated: July 2026</p>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-12 sm:pb-20">
          <div className="mx-auto w-full max-w-2xl space-y-8 p-5 sm:p-8 rounded-3xl bg-surface border border-white/5 shadow-2xl">

            <div className="space-y-5 sm:space-y-6 text-sm sm:text-[15px] text-muted-foreground leading-[1.65] sm:leading-relaxed">
              <p>
                Paxora Premium (&ldquo;Paxora,&rdquo; &ldquo;the Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to the highest standards of anti-money laundering (AML) and counter-terrorist financing (CTF) compliance. This Anti-Money Laundering Policy (&ldquo;AML Policy&rdquo;) sets forth our comprehensive framework for detecting, preventing, and reporting money laundering and terrorist financing activities in accordance with applicable laws and international standards.
              </p>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>1. Policy Statement & Commitment</h2>
                <p>Paxora Premium maintains a zero-tolerance policy toward money laundering, terrorist financing, and any form of financial crime. We are fully committed to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Complying with all applicable AML/CFT laws, regulations, and guidance in every jurisdiction where we operate</li>
                  <li>Implementing robust internal controls, policies, and procedures to mitigate money laundering and terrorist financing risks</li>
                  <li>Cooperating fully with law enforcement agencies, financial intelligence units (FIUs), and regulatory authorities</li>
                  <li>Promoting a culture of compliance throughout our organization through ongoing training and awareness</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>2. Scope & Applicability</h2>
                <p>This AML Policy applies to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>All directors, officers, employees, and contractors of Paxora Premium</li>
                  <li>All products, services, and activities offered through the Paxora Premium platform</li>
                  <li>All users, customers, and counterparties accessing or using our services</li>
                  <li>All geographic locations and jurisdictions in which Paxora Premium operates or provides services</li>
                </ul>
                <p className="mt-2">This Policy is supplementary to and does not replace any applicable local laws or regulatory requirements. Where local requirements are more stringent, those shall prevail.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>3. AML Compliance Officer & Governance</h2>
                <p>Paxora Premium has appointed a designated AML Compliance Officer (&ldquo;AMLCO&rdquo;) who holds ultimate responsibility for the implementation and oversight of this AML Policy. The AMLCO reports directly to senior management and the Board of Directors.</p>
                <p className="mt-2">The responsibilities of the AMLCO include, but are not limited to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Developing, implementing, and maintaining AML/CFT policies, procedures, and internal controls</li>
                  <li>Overseeing the Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) processes</li>
                  <li>Monitoring transactions for suspicious activity and filing Suspicious Activity Reports (SARs)</li>
                  <li>Serving as the primary point of contact for regulatory authorities and law enforcement</li>
                  <li>Coordinating AML/CFT training programs for all employees</li>
                  <li>Conducting periodic independent reviews and risk assessments</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>4. Customer Due Diligence (CDD)</h2>
                <p>Paxora Premium implements risk-based Customer Due Diligence procedures for all customers. CDD is conducted at the time of account opening and on an ongoing basis as required.</p>
                <p className="mt-2"><strong className="text-foreground">Standard CDD Requirements:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Full legal name, date of birth, and nationality</li>
                  <li>Valid government-issued photo identification (passport, national ID card, or driver&apos;s license)</li>
                  <li>Proof of residential address (utility bill, bank statement, or government document dated within the last 3 months)</li>
                  <li>Email address and phone number verification</li>
                  <li>Source of funds and source of wealth declaration</li>
                  <li>Purpose of account and expected transaction volume</li>
                </ul>
                <p className="mt-2"><strong className="text-foreground">Ongoing Due Diligence:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Periodic review and updating of customer information and documentation</li>
                  <li>Continuous monitoring of transactions against customer risk profiles</li>
                  <li>Trigger-based review upon detection of unusual activity or material changes in customer behavior</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>5. Enhanced Due Diligence (EDD)</h2>
                <p>Enhanced Due Diligence measures are applied to customers and transactions that present a higher risk of money laundering or terrorist financing. Circumstances requiring EDD include, but are not limited to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Customers residing in or transacting from high-risk jurisdictions (as identified by FATF, EU, or other relevant bodies)</li>
                  <li>Politically Exposed Persons (PEPs), their family members, and close associates</li>
                  <li>Customers with complex or opaque ownership structures</li>
                  <li>Transactions involving significant value or unusual patterns inconsistent with the customer&apos;s profile</li>
                  <li>Customers using intermediaries or nominee arrangements</li>
                  <li>Non-face-to-face business relationships where verification is more challenging</li>
                </ul>
                <p className="mt-2">EDD measures may include obtaining additional documentation, independent verification of source of funds, senior management approval for account opening, and enhanced transaction monitoring with reduced threshold triggers.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>6. Politically Exposed Persons (PEPs)</h2>
                <p>Paxora Premium maintains a robust framework for the identification and management of Politically Exposed Persons. Our PEP procedures include:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Screening of all customers against reputable PEP databases at onboarding and on an ongoing basis</li>
                  <li>Application of EDD measures for all identified PEPs, their immediate family members, and close associates</li>
                  <li>Senior management approval for establishing or continuing business relationships with PEPs</li>
                  <li>Enhanced ongoing monitoring of PEP accounts</li>
                  <li>Clear definition of the PEP risk period (12 months post-cessation of prominent public function for domestic PEPs)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>7. Transaction Monitoring & Surveillance</h2>
                <p>Paxora Premium operates a comprehensive transaction monitoring system designed to detect and flag potentially suspicious activity in real time and on a post-transaction basis.</p>
                <p className="mt-2"><strong className="text-foreground">Monitoring Parameters:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Transaction velocity and volume thresholds</li>
                  <li>Rapid round-tripping of funds (deposit followed immediately by withdrawal)</li>
                  <li>Trading patterns inconsistent with the customer&apos;s stated investment strategy</li>
                  <li>Transactions involving anonymous cryptocurrencies or privacy-enhancing techniques</li>
                  <li>Multiple accounts sharing the same IP address, device, or payment methods</li>
                  <li>Structuring or smurfing patterns (transactions just below reporting thresholds)</li>
                  <li>Geographic inconsistencies (transactions originating from unexpected locations)</li>
                </ul>
                <p className="mt-2"><strong className="text-foreground">Blockchain Analytics:</strong></p>
                <p>For cryptocurrency transactions, Paxora Premium utilizes advanced blockchain analytics tools to trace the provenance of funds and identify exposure to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Mixing services and tumblers</li>
                  <li>Darknet markets and illicit activity</li>
                  <li>Sanctioned addresses and entities</li>
                  <li>Stolen funds and hacking proceeds</li>
                  <li>Ransomware payments</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>8. Suspicious Activity Reporting (SAR)</h2>
                <p>Any employee or officer of Paxora Premium who becomes aware of any activity that may indicate money laundering, terrorist financing, or other financial crime must immediately report their concerns to the AMLCO.</p>
                <p className="mt-2"><strong className="text-foreground">Reporting Process:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>All potentially suspicious activities are documented and escalated to the AMLCO within 24 hours</li>
                  <li>The AMLCO conducts an independent review and investigation of the reported activity</li>
                  <li>Where suspicion is confirmed or remains after investigation, a Suspicious Activity Report (SAR) is filed with the relevant Financial Intelligence Unit (FIU) in accordance with local regulatory requirements</li>
                  <li>All SAR filings are conducted in strict confidentiality. Tipping-off (informing the subject of a SAR) is strictly prohibited and constitutes a criminal offense</li>
                  <li>Records of all SARs and related documentation are maintained for a minimum of 5 years</li>
                </ul>
                <p className="mt-2"><strong className="text-foreground">Protection for Reporting Persons:</strong></p>
                <p>Paxora Premium prohibits any form of retaliation, discrimination, or adverse action against any employee who reports suspicious activity in good faith. Reports may be made anonymously through our whistleblower channel.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>9. Record Keeping & Data Retention</h2>
                <p>Paxora Premium maintains comprehensive records in accordance with applicable legal and regulatory requirements:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-foreground">CDD Records:</strong> All customer identification documents, verification records, and risk assessments are retained for at least 5 years after the closure of the business relationship</li>
                  <li><strong className="text-foreground">Transaction Records:</strong> Complete records of all transactions, including amounts, counterparties, timestamps, IP addresses, and wallet addresses, are retained for a minimum of 5 years</li>
                  <li><strong className="text-foreground">SAR Records:</strong> All Suspicious Activity Reports and related investigation materials are retained for at least 5 years from the date of filing</li>
                  <li><strong className="text-foreground">Communication Records:</strong> All relevant correspondence and communications with customers and regulatory authorities are retained in accordance with our data retention schedule</li>
                </ul>
                <p className="mt-2">All records are stored securely with appropriate access controls, encryption, and backup procedures to ensure integrity and availability.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>10. Sanctions Compliance</h2>
                <p>Paxora Premium is committed to full compliance with applicable economic sanctions and trade embargoes administered by:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>The United Nations Security Council (UNSC)</li>
                  <li>The United States Office of Foreign Assets Control (OFAC)</li>
                  <li>The European Union (EU)</li>
                  <li>The United Kingdom Office of Financial Sanctions Implementation (OFSI)</li>
                  <li>The Gibraltar Financial Services Commission (GFSC)</li>
                  <li>Other applicable sanctions authorities</li>
                </ul>
                <p className="mt-2"><strong className="text-foreground">Sanctions Screening:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>All customers are screened against sanctions lists at onboarding, on a real-time basis during transactions, and periodically thereafter</li>
                  <li>Direct matches and fuzzy matches are reviewed and resolved by the AMLCO</li>
                  <li>Accounts and transactions involving sanctioned individuals, entities, or jurisdictions are immediately blocked and reported</li>
                  <li>Blockchain wallet addresses are screened against sanctions-related addresses</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>11. Training & Awareness</h2>
                <p>Paxora Premium is committed to ensuring that all employees and relevant contractors receive appropriate AML/CFT training commensurate with their roles and responsibilities.</p>
                <p className="mt-2"><strong className="text-foreground">Training Program Components:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-foreground">Initial Training:</strong> All new employees complete mandatory AML/CFT training as part of their onboarding process within 14 days of commencement</li>
                  <li><strong className="text-foreground">Ongoing Training:</strong> Refresher training is conducted at least annually, covering regulatory updates, emerging typologies, and lessons learned</li>
                  <li><strong className="text-foreground">Specialized Training:</strong> Enhanced training is provided to employees in high-risk roles (compliance, customer onboarding, transaction monitoring, investigations)</li>
                  <li><strong className="text-foreground">Testing & Assessment:</strong> All training is followed by competency assessments to ensure understanding and retention</li>
                  <li><strong className="text-foreground">Records:</strong> Complete training records, including attendance, materials, and assessment results, are maintained for audit purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>12. Risk Assessment Framework</h2>
                <p>Paxora Premium conducts a comprehensive enterprise-wide risk assessment at least annually, or more frequently if significant changes occur in our business, customer base, or regulatory environment.</p>
                <p className="mt-2"><strong className="text-foreground">Risk Assessment Factors:</strong></p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong className="text-foreground">Geographic Risk:</strong> Countries and regions associated with higher levels of corruption, financial crime, or inadequate AML frameworks</li>
                  <li><strong className="text-foreground">Customer Risk:</strong> Customer types, industries, and profiles that present elevated risk characteristics</li>
                  <li><strong className="text-foreground">Product & Service Risk:</strong> Products and services that may be more susceptible to money laundering (e.g., anonymity-enhanced cryptocurrencies, rapid trading features)</li>
                  <li><strong className="text-foreground">Channel Risk:</strong> Delivery channels that involve reduced face-to-face contact or increased anonymity</li>
                  <li><strong className="text-foreground">Transaction Risk:</strong> Transaction types, values, and patterns that may indicate unusual activity</li>
                </ul>
                <p className="mt-2">The results of the risk assessment inform our risk-based approach to CDD, EDD, transaction monitoring, and all other AML controls. Higher-risk customers and activities receive proportionally greater scrutiny and controls.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>13. Third-Party & Correspondent Relationships</h2>
                <p>Paxora Premium exercises caution and due diligence in all relationships with third parties, including:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Liquidity providers and trading counterparties</li>
                  <li>Custodians and wallet service providers</li>
                  <li>Payment processors and banking partners</li>
                  <li>KYC/identity verification service providers</li>
                  <li>Blockchain analytics and screening vendors</li>
                </ul>
                <p className="mt-2">All third-party relationships are subject to:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Pre-engagement due diligence and risk assessment</li>
                  <li>Written agreements incorporating AML/CFT obligations and data protection requirements</li>
                  <li>Periodic review and ongoing monitoring of the third party&apos;s compliance posture</li>
                  <li>Termination provisions for failure to maintain adequate AML/CFT standards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>14. Independent Review & Audit</h2>
                <p>This AML Policy and the effectiveness of its implementation are subject to independent review at least annually. The review may be conducted by:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Internal audit function (where operationally independent from the AMLCO)</li>
                  <li>External qualified auditors or AML/CFT consultants</li>
                  <li>Regulatory authorities as part of their supervisory examinations</li>
                </ul>
                <p className="mt-2">The scope of the independent review includes, at minimum:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Testing of CDD, EDD, and record-keeping processes</li>
                  <li>Evaluation of transaction monitoring system effectiveness</li>
                  <li>Review of SAR filing timeliness and quality</li>
                  <li>Assessment of training program adequacy and completion rates</li>
                  <li>Verification of sanctions screening coverage and accuracy</li>
                  <li>Overall assessment of the AML/CFT control framework</li>
                </ul>
                <p className="mt-2">Findings and recommendations from independent reviews are reported to senior management and the Board of Directors, with corrective actions tracked to completion.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>15. Violations & Disciplinary Measures</h2>
                <p>Violations of this AML Policy, whether by act or omission, are taken seriously and may result in disciplinary action up to and including termination of employment or business relationship. Disciplinary measures are applied regardless of whether the violation resulted in actual money laundering or terrorist financing.</p>
                <p className="mt-2">Customers found to have violated AML/CFT requirements may have their accounts suspended or terminated, funds frozen pending investigation, and relevant authorities notified. Paxora Premium reserves the right to report any suspicious activity to appropriate authorities without prior notice to the customer.</p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>16. Contact & Reporting</h2>
                <p>For inquiries regarding this AML Policy or to report suspicious activity, please contact our AML Compliance Officer:</p>
                <p className="mt-2 text-foreground">
                  Email: <span className="text-primary font-bold">Info@paxorapremiumlab.com</span><br />
                  Address: Paxora Capital Ltd., Gibraltar<br />
                  Attention: AML Compliance Officer
                </p>
                <p className="mt-2">Whistleblower reports may be submitted anonymously through our dedicated channel at <span className="text-primary font-bold">Info@paxorapremiumlab.com</span>.</p>
              </section>
            </div>

            <div className="pt-4 border-t border-white/5 text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <Link href="/legal/terms" className="text-primary font-bold text-sm hover:underline">
                Terms of Service
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
