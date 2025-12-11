"use client";

import Image from "next/image";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import ClientOnly from "@/components/ui/client-only";
import FadeIn, { FadeInStagger } from "@/components/ui/fade-in";
import { MorphSection } from "../MorphSection";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PartnersSection() {
    const { t } = useLanguage();
    return (
        <MorphSection
            id="partners"
            variant="bottom"
            backgroundColor="#28536b"
            // CHANGE 1: Reduced py-20 to py-12 for mobile, kept md:py-32
            // CHANGE 2: Added min-h-0 to override default height constraints
            className="py-12 md:py-32 relative z-20 min-h-0"
            // CHANGE 3: Force height to auto so it wraps content tightly
            height="auto"
        >
            <div className="container mx-auto px-6">
                <FadeInStagger>
                    {/* Text Content */}
                    {/* CHANGE 4: Reduced bottom margin from mb-16 to mb-8 for mobile */}
                    <FadeIn className="text-center max-w-3xl mx-auto mb-8 md:mb-24">
                        <span className="block text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[#7ea8be] mb-4 md:mb-6">
                            {t.partners.tag}
                        </span>
                        {/* CHANGE 5: Adjusted font sizes for mobile */}
                        <h2 className="text-3xl md:text-6xl font-serif text-[#f6f0ed] mb-4 md:mb-8 leading-tight">
                            {t.partners.titleStart} <span className="italic font-light text-[#c2948a]">{t.partners.titleItalic}</span>
                        </h2>
                        <p className="text-sm md:text-xl text-[#f6f0ed]/80 leading-relaxed max-w-2xl mx-auto">
                            {t.partners.description}
                        </p>
                    </FadeIn>

                    {/* Brand Logos Slider */}
                    <FadeIn>
                        <div className="relative w-full overflow-hidden py-4 md:py-6">
                            <ClientOnly
                                fallback={
                                    <div className="flex gap-14 overflow-hidden">
                                        <div className="flex items-center">
                                            <Image
                                                className="mx-auto h-32 w-auto object-contain"
                                                src="/images/logo-bg/01e69e16-50a9-4318-b6c8-f6b783015dc7.png"
                                                alt="Partner Logo"
                                                height={128}
                                                width={200}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <Image
                                                className="mx-auto h-32 w-auto object-contain"
                                                src="/images/logo-bg/0b6aee71-b84e-416a-a9ea-a5471cf88bf7.png"
                                                alt="Partner Logo"
                                                height={128}
                                                width={200}
                                            />
                                        </div>
                                    </div>
                                }
                            >
                                <InfiniteSlider speedOnHover={25} speed={50} gap={32}>
                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/01e69e16-50a9-4318-b6c8-f6b783015dc7.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/0b6aee71-b84e-416a-a9ea-a5471cf88bf7.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/5786684a-f166-464c-a81a-e89bfbd670b3.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/632e1eef-cdba-4c27-a07d-856f1e562811.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/a52d9a60-a909-4f9a-8e9c-a60b10c4fbc9.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/d43fa4cd-23cc-4d37-9692-96bccdd5462f.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <Image
                                            className="mx-auto h-32 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                            src="/images/logo-bg/f4ac1fed-210a-4f13-adb2-209614dbec26.png"
                                            alt="Partner Logo"
                                            height={128}
                                            width={200}
                                            sizes="(max-width: 768px) 150px, 200px"
                                        />
                                    </div>
                                </InfiniteSlider>
                            </ClientOnly>
                        </div>
                    </FadeIn>
                </FadeInStagger>
            </div>
        </MorphSection>
    );
}
