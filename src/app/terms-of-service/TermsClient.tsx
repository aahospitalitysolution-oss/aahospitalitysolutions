"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsClient() {
    const { t } = useLanguage();
    const terms = t.termsOfService;

    return (
        <main className="min-h-screen bg-[var(--parchment)] text-[var(--charcoal-blue)] px-6 py-32 md:py-40">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-12 reveal">{terms.title}</h1>

                <div className="prose prose-lg max-w-none font-sans text-[var(--charcoal-blue)] opacity-90 space-y-8 reveal">
                    {terms.sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="font-serif text-2xl md:text-3xl mb-4">{section.title}</h2>
                            <p>{section.content}</p>
                            {section.bullets && (
                                <ul className="list-disc pl-5 space-y-2 mt-4">
                                    {section.bullets.map((bullet, idx) => (
                                        <li key={idx}>{bullet}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}

                    <div className="pt-8 text-sm opacity-70">
                        <p>{terms.lastUpdated} {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
