import { useEffect, useRef } from "react";
import { MorphSection } from "../MorphSection";
import styles from "./EthosSection.module.css";
import { isMobileDevice } from "@/utils/deviceUtils";
import { getScrollTriggerConfig } from "@/utils/scrollConfig";

interface EthosSectionProps {
  startAnimation?: boolean;
}

export const EthosSection = ({ startAnimation = false }: EthosSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const definitionsRef = useRef<HTMLDivElement>(null);
  const sunSymbolRef = useRef<SVGSVGElement>(null);
  const lotusSymbolRef = useRef<SVGSVGElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const aadityaBlockRef = useRef<HTMLDivElement>(null);
  const aaryahiBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAnimation) return;
    if (typeof window === "undefined") return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const init = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.registerPlugin(ScrollTrigger);

      const ensureStaticState = () => {
        const sun = sunSymbolRef.current;
        const lotus = lotusSymbolRef.current;
        const closing = closingRef.current;
        const underline = underlinePathRef.current;

        if (sun) {
          sun.style.opacity = "0";
        }
        if (lotus) {
          lotus.style.opacity = "0.15";
          lotus.style.transform = "scale(1)";
        }
        if (closing) {
          closing.style.opacity = "1";
        }
        if (underline) {
          underline.style.strokeDasharray = "none";
          underline.style.strokeDashoffset = "0";
        }
      };

      if (prefersReducedMotion) {
        ensureStaticState();
        return;
      }

      ctx = gsap.context((self) => {
        const select =
          self.selector ||
          ((q: string) => gsap.utils.toArray<HTMLElement>(q));

        const sun = sunSymbolRef.current;
        const lotus = lotusSymbolRef.current;
        const section = sectionRef.current;

        if (!sun || !lotus || !section) return;

        gsap.set(lotus, { opacity: 0, rotate: -45, scale: 0.8 });
        gsap.set(sun, { opacity: 0, rotate: 0, scale: 0.8 });

        const revealTexts = gsap.utils.toArray<HTMLElement>(
          sectionRef.current?.querySelectorAll("[data-reveal-text]") || []
        );
        const aadityaBlock = aadityaBlockRef.current;
        const aaryahiBlock = aaryahiBlockRef.current;

        // Set initial states for blocks
        if (aadityaBlock) {
          gsap.set(aadityaBlock, { opacity: 0, x: -50 });
        }
        if (aaryahiBlock) {
          gsap.set(aaryahiBlock, { opacity: 0, x: 50 });
        }

        const textRevealTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 50%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        });

        textRevealTl.to(
          sun,
          {
            opacity: 0.15,
            rotate: 0,
            scale: 1,
            duration: 1.5,
            ease: "power3.out",
          },
          0
        );

        if (revealTexts.length) {
          textRevealTl.from(
            revealTexts,
            {
              y: 30,
              opacity: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power2.out",
            },
            0
          );
        }

        // Animate blocks directly using refs
        if (aadityaBlock) {
          textRevealTl.to(
            aadityaBlock,
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: "power3.out",
            },
            "-=0.5"
          );
        }

        if (aaryahiBlock) {
          textRevealTl.to(
            aaryahiBlock,
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: "power3.out",
            },
            "-=0.7"
          );
        }

        if (definitionsRef.current) {
          // Get device-optimized scrub value
          const isMobile = isMobileDevice();
          const scrollTriggerConfig = getScrollTriggerConfig(isMobile);

          gsap
            .timeline({
              scrollTrigger: {
                trigger: definitionsRef.current,
                start: "top center",
                end: "bottom center",
                scrub: scrollTriggerConfig.scrubValue, // Device-optimized scrub
              },
            })
            .to(
              sun,
              {
                opacity: 0,
                rotate: 45,
                scale: 1.2,
                duration: 1,
                ease: "power1.inOut",
              },
              "switch"
            )
            .to(
              lotus,
              {
                opacity: 0.15,
                rotate: 0,
                scale: 1,
                duration: 1,
                ease: "power1.inOut",
              },
              "switch"
            );
        }

        const registerHighlight = (target: HTMLDivElement | null) => {
          if (!target) return;

          gsap.to(target, {
            scrollTrigger: {
              trigger: target,
              start: "top center",
              end: "bottom center",
              toggleActions: "play reverse play reverse",
            },
            borderColor: "rgba(197, 160, 101, 1)",
            duration: 0.5,
          });
        };

        registerHighlight(aadityaBlockRef.current);
        registerHighlight(aaryahiBlockRef.current);

        if (closingRef.current) {
          const closingTl = gsap.timeline({
            scrollTrigger: {
              trigger: closingRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          closingTl.to(closingRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          });

          if (underlinePathRef.current) {
            const length = underlinePathRef.current.getTotalLength();
            gsap.set(underlinePathRef.current, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });

            closingTl.to(
              underlinePathRef.current,
              {
                strokeDashoffset: 0,
                duration: 1.5,
                ease: "power2.inOut",
              },
              "<"
            );
          }
        }
      }, sectionRef);
    };

    init();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [startAnimation]);

  return (
    <MorphSection
      variant="bottom"
      backgroundColor="var(--parchment)"
      textColor="var(--charcoal-blue)"
      className={styles.ethosSection}
      ref={sectionRef}
      id="ethos"
      aria-labelledby="ethos-title"
    >
      <div className={styles.symbolWrapper} aria-hidden="true">
        <svg
          ref={sunSymbolRef}
          className={styles.symbolGraphic}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="50" r="20" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="15" strokeWidth="0.6" />
          <path d="M50 15 L50 0" strokeWidth="0.8" />
          <path d="M50 85 L50 100" strokeWidth="0.8" />
          <path d="M15 50 L0 50" strokeWidth="0.8" />
          <path d="M85 50 L100 50" strokeWidth="0.8" />
          <path d="M25.2 25.2 L14.6 14.6" strokeWidth="0.8" />
          <path d="M74.8 74.8 L85.4 85.4" strokeWidth="0.8" />
          <path d="M25.2 74.8 L14.6 85.4" strokeWidth="0.8" />
          <path d="M74.8 25.2 L85.4 14.6" strokeWidth="0.8" />
          <g strokeWidth="0.6" opacity="0.6">
            <path d="M35 15 L32 5" />
            <path d="M65 15 L68 5" />
            <path d="M35 85 L32 95" />
            <path d="M65 85 L68 95" />
            <path d="M15 35 L5 32" />
            <path d="M85 35 L95 32" />
            <path d="M15 65 L5 68" />
            <path d="M85 65 L95 68" />
          </g>
        </svg>

        <svg
          ref={lotusSymbolRef}
          className={styles.symbolGraphic}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="50" r="5" strokeWidth="0.4" opacity="0.8" />
          <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.4" />
          <g strokeWidth="0.5">
            <path d="M50 50 L58 35 L50 10 L42 35 Z" />
            <path d="M50 50 L65 58 L90 50 L65 42 Z" />
            <path d="M50 50 L58 65 L50 90 L42 65 Z" />
            <path d="M50 50 L35 58 L10 50 L35 42 Z" />
          </g>
          <g strokeWidth="0.4" opacity="0.7">
            <path d="M60 40 L75 25" />
            <path d="M60 60 L75 75" />
            <path d="M40 60 L25 75" />
            <path d="M40 40 L25 25" />
            <path d="M50 50 L60 35 L75 25 L65 50 Z" />
            <path d="M50 50 L65 50 L75 75 L50 60 Z" />
            <path d="M50 50 L40 65 L25 75 L35 50 Z" />
            <path d="M50 50 L35 50 L25 25 L50 40 Z" />
          </g>
          <g strokeWidth="0.2" opacity="0.5">
            <line x1="50" y1="50" x2="50" y2="20" />
            <line x1="50" y1="50" x2="80" y2="50" />
            <line x1="50" y1="50" x2="50" y2="80" />
            <line x1="50" y1="50" x2="20" y2="50" />
          </g>
          <circle
            cx="50"
            cy="50"
            r="35"
            strokeWidth="0.2"
            opacity="0.3"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <span className={styles.subtitle} data-reveal-text>
            Our Philosophy
          </span>
          <h2 id="ethos-title" className={styles.title} data-reveal-text>
            Our name tells
            <br />
            our story.
          </h2>

          <div className={styles.definitions} ref={definitionsRef}>
            <div
              className={styles.textBlock}
              data-reveal-block
              ref={aadityaBlockRef}
            >
              <span className={styles.nameHighlight}>Aaditya</span>
              <p className={styles.meaning}>
                Means sun—energy, growth, illumination. It represents the light
                we bring to complex challenges.
              </p>
            </div>

            <div
              className={styles.textBlockRight}
              data-reveal-block
              ref={aaryahiBlockRef}
            >
              <span className={styles.nameHighlight}>Aaryahi</span>
              <p className={styles.meaning}>
                Means noble—integrity, excellence, the highest standards. It is
                our promise to uphold dignity in every decision.
              </p>
            </div>
          </div>

          <p className={styles.summary} data-reveal-text>
            Together, they represent our commitment. We believe in continuous
            growth powered by transparency and trust.
          </p>

          <div className={styles.closingStatement} ref={closingRef}>
            <span>That's authentic advisory.</span>
            <svg className={styles.underline} height="15" width="220">
              <path
                ref={underlinePathRef}
                d="M10 5 Q 110 12, 210 5"
                stroke="var(--steel-blue)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </MorphSection>
  );
};

