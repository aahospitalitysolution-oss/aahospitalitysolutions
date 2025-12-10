import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./OurStory.module.css";
import { useLanguage } from "@/contexts/LanguageContext";

interface OurStoryProps {
    startAnimation?: boolean;
}

export const OurStory = ({ startAnimation = false }: OurStoryProps) => {
    const { t } = useLanguage();
    const sectionRef = useRef<HTMLElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<HTMLImageElement>(null);
    const founderDetailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!startAnimation) return;
        if (typeof window === "undefined") return;

        let ctx: gsap.Context | null = null;
        let cancelled = false;

        const initAnimation = async () => {
            const { default: gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");

            if (cancelled) return;

            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                const section = sectionRef.current;
                const image = imageRef.current;
                const content = contentRef.current;
                const signature = signatureRef.current;
                const founderDetails = founderDetailsRef.current;

                if (!section || !image || !content) return;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse",
                    },
                });

                tl.fromTo(image,
                    { opacity: 0, x: -50 },
                    { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
                )
                    .fromTo(content,
                        { opacity: 0, x: 50 },
                        { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
                        "-=0.8"
                    );

                // Signature Animation - Wipe in from left using clip-path
                if (signature && founderDetails) {
                    // Reset signature wipe
                    gsap.set(signature, {
                        clipPath: "inset(0 100% 0 0)",
                        webkitClipPath: "inset(0 100% 0 0)", // Safari support
                        opacity: 1
                    });

                    tl.to(signature, {
                        clipPath: "inset(0 0% 0 0)",
                        webkitClipPath: "inset(0 0% 0 0)",
                        duration: 2,
                        ease: "power2.inOut"
                    }, "-=0.5")
                        .fromTo(founderDetails,
                            { opacity: 0, y: 10 },
                            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                            "-=1.5"
                        );
                }
            }, sectionRef);
        };

        initAnimation();

        return () => {
            cancelled = true;
            ctx?.revert();
        };
    }, [startAnimation]);

    return (
        <section id="our-story" className={styles.section} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.imageWrapper} ref={imageRef}>
                    <div className={styles.blueBox}></div>
                    <Image
                        src="/images/founder.png"
                        alt="Shankar Sreekumar, Founder of A&A Hospitality"
                        className={styles.founderImage}
                        width={600}
                        height={800}
                        style={{ width: '100%', height: 'auto' }}
                        priority
                    />
                </div>

                <div className={styles.content} ref={contentRef}>
                    <h2 className={styles.title}>{t.ourStory.title}</h2>

                    <p className={styles.paragraph}>
                        {t.ourStory.para1}
                    </p>

                    <p className={styles.paragraph}>
                        {t.ourStory.para2}
                    </p>

                    <p className={styles.paragraph}>
                        {t.ourStory.para3}
                    </p>

                    <div className={styles.signatureSection}>
                        <Image
                            ref={signatureRef}
                            src="/images/founder-signature.png"
                            alt="Shankar Sreekumar Signature"
                            className={styles.signatureImage}
                            width={300}
                            height={150}
                            style={{ width: '200px', height: 'auto' }}
                        />
                        <div className={styles.founderDetails} ref={founderDetailsRef}>
                            <h4 className={styles.founderName}>{t.ourStory.founderName}</h4>
                            <span className={styles.founderRole}>{t.ourStory.founderRole}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
