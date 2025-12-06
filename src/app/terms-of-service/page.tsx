import React from 'react';
import { Navbar } from '@/components/Navbar';

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-[var(--parchment)] text-[var(--charcoal-blue)] px-6 py-32 md:py-40">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-12 reveal">Terms of Service</h1>

                <div className="prose prose-lg max-w-none font-sans text-[var(--charcoal-blue)] opacity-90 space-y-8 reveal">
                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using the website of A&A Hospitality Solutions ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">2. Intellectual Property</h2>
                        <p>
                            The Site and its original content, features, and functionality are owned by A&A Hospitality Solutions and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">3. Use of Site</h2>
                        <p>
                            You agree not to use the Site for any purpose that is unlawful or prohibited by these Terms. You agree not to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                            <li>Disrupt or interfere with the security of, or otherwise abuse, the Site, or any services, system resources, accounts, servers or networks connected to or accessible through the Site.</li>
                            <li>Upload, post, or otherwise transmit through or on this Site any viruses or other harmful, disruptive or destructive files.</li>
                            <li>Attempt to obtain unauthorized access to the Site or portions of the Site that are restricted from general access.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">4. Limitation of Liability</h2>
                        <p>
                            In no event shall A&A Hospitality Solutions, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">5. Disclaimer</h2>
                        <p>
                            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">6. Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us.
                        </p>
                    </section>

                    <div className="pt-8 text-sm opacity-70">
                        <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
