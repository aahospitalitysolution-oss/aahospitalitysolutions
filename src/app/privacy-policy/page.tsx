import React from 'react';
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy - A&A Hospitality Solutions",
  description:
    "Learn how A&A Hospitality Solutions collects, uses, and protects your personal information. Our commitment to privacy and data security for our clients and website visitors.",
  image: "/og-image.png",
  url: "/privacy-policy",
  keywords: [
    "privacy policy",
    "data protection",
    "personal information",
    "A&A Hospitality",
    "privacy",
  ],
});

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-[var(--parchment)] text-[var(--charcoal-blue)] px-6 py-32 md:py-40">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-12 reveal">Privacy Policy</h1>

                <div className="prose prose-lg max-w-none font-sans text-[var(--charcoal-blue)] opacity-90 space-y-8 reveal">
                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">1. Introduction</h2>
                        <p>
                            Welcome to A&A Hospitality Solutions ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">2. Information We Collect</h2>
                        <p className="mb-4">
                            We may collect the following types of information when you visit our website or interact with our services:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Personal Information:</strong> Name, email address, phone number, and other contact details you voluntarily provide when you reach out to us or sign up for our services.
                            </li>
                            <li>
                                <strong>Usage Data:</strong> Information about how you access and use our website, including your IP address, browser type, operating system, and pages visited.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">3. How We Use Your Information</h2>
                        <p>
                            We use the information we collect for various purposes, including to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                            <li>Provide, maintain, and improve our services to you.</li>
                            <li>Respond to your comments, questions, and requests.</li>
                            <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
                            <li>Monitor and analyze trends, usage, and activities in connection with our website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">4. Sharing of Information</h2>
                        <p>
                            We do not share your personal information with third parties except as described in this policy. We may share information with:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                            <li>Service providers who perform services on our behalf.</li>
                            <li>Professional advisors, such as lawyers, auditors, and insurers.</li>
                            <li>Government bodies and law enforcement officials, if required by law.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">5. Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">6. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl md:text-3xl mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us via our website's contact form or email us directly.
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
