import { useEffect, useRef } from "react";
import styles from "./OurStory.module.css";

interface OurStoryProps {
    startAnimation?: boolean;
}

export const OurStory = ({ startAnimation = false }: OurStoryProps) => {
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

                // Signature Animation
                if (signature && founderDetails) {
                    // Reset signature wipe
                    gsap.set(signature, {
                        clipPath: "inset(0 100% 0 0)",
                        opacity: 1
                    });

                    tl.to(signature, {
                        clipPath: "inset(0 0% 0 0)",
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
                    <img
                        src="/images/founder.png"
                        alt="A&A Hospitality Founder"
                        className={styles.founderImage}
                    />
                </div>

                <div className={styles.content} ref={contentRef}>
                    <h2 className={styles.title}>Built on 25 Years of True Hospitality</h2>

                    <p className={styles.paragraph}>
                        I'm Shankar Sreekumar, and I've spent my career in the trenches and the boardrooms of hospitality. From F&B floors to regional leadership across South and Southeast Asia, I've seen what works—and what doesn't.
                    </p>

                    <p className={styles.paragraph}>
                        Born in India, educated in Australia, and shaped by roles at IHG, Onyx Hospitality, and La Vie Hotels & Resorts, I founded A&A Hospitality to bring clarity, energy, and uncompromising standards to every partnership.
                    </p>

                    <p className={styles.paragraph}>
                        This isn't about templates or one-size-fits-all solutions. It's about understanding your asset, your market, and your goals—then delivering results that matter.
                    </p>

                    <div className={styles.signatureSection}>
                        <img
                            ref={signatureRef}
                            src="/images/founder-signature.png"
                            alt="Shankar Sreekumar Signature"
                            className={styles.signatureImage}
                        />
                        <div className={styles.founderDetails} ref={founderDetailsRef}>
                            <h4 className={styles.founderName}>Shankar Sreekumar</h4>
                            <span className={styles.founderRole}>Founder & Managing Director</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
