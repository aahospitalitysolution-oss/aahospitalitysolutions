import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PaperPlaneCanvas } from "./PaperPlaneCanvas";
import SmartButton from "../SmartButton";
import styles from "./BadgeCloud.module.css";
import { isMobileDevice } from "@/utils/deviceUtils";
import { getScrollTriggerConfig } from "@/utils/scrollConfig";

interface BadgeCloudProps {
  startAnimation?: boolean;
}

const StarIcon = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

const OrbitIcon = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ChatIcon = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M21 11.5C21 16.1944 16.9706 20 12 20C10.96 20 9.95 19.83 9 19.52L4 21V16.5C2.76 15.2 2 13.44 2 11.5C2 6.80558 6.02944 3 11 3C15.9706 3 20 6.80558 20 11.5Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="8" cy="11" r="1.5" />
    <circle cx="12" cy="11" r="1.5" />
    <circle cx="16" cy="11" r="1.5" />
  </svg>
);

const PencilIcon = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M19 3L14.5 7.5L4 18V22H8L18.5 11.5L23 7L19 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M14.5 7.5L19 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const BadgeCloud = ({ startAnimation = true }: BadgeCloudProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [planesActive, setPlanesActive] = useState(false);
  const router = useRouter();

  const handleBadgeClick = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (!startAnimation) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const init = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      if (prefersReducedMotion) {
        // ... (existing reduced motion logic)
        const section = sectionRef.current;
        if (section) {
          section.querySelectorAll<HTMLElement>("[data-icon]").forEach((wrapper) => {
            wrapper.style.width = "1.5em";
          });
          section.querySelectorAll<HTMLElement>("[data-icon-circle]").forEach((circle) => {
            circle.style.transform = "scale(1)";
          });
          // Ensure text is opaque
          section.querySelectorAll<HTMLElement>("[data-text-id]").forEach((el) => {
            el.style.opacity = "1";
          });
          // Ensure badges are fully styled
          section.querySelectorAll<HTMLElement>("[data-badge-id]").forEach((el) => {
            el.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            el.style.borderColor = "var(--charcoal-blue)"; // Default fallback, specifics handled by CSS classes
            if (el.classList.contains(styles.rosy)) el.style.borderColor = "var(--rosy-taupe)";
            if (el.classList.contains(styles.khaki)) el.style.borderColor = "var(--khaki-beige)";
            el.style.fontStyle = "italic";
            el.style.opacity = "1";
          });
          const ledeEl = section.querySelector<HTMLElement>("[data-lede]");
          if (ledeEl) {
            ledeEl.style.opacity = "1";
          }
          const introText = section.querySelector<HTMLElement>("[data-intro-text]");
          if (introText) {
            introText.style.opacity = "0";
          }
          const emphasisWord = section.querySelector<HTMLElement>("[data-emphasis-word]");
          if (emphasisWord) {
            emphasisWord.style.fontWeight = "700";
            emphasisWord.style.fontStyle = "italic";
          }
          const emphasisUnderline = section.querySelector<HTMLElement>("[data-emphasis-underline]");
          if (emphasisUnderline) {
            emphasisUnderline.style.opacity = "1";
            emphasisUnderline.style.transform = "scaleX(1)";
          }
        }
        return;
      }

      ctx = gsap.context(() => {
        const section = sectionRef.current;
        if (!section) return;

        // Get device-optimized scrub value
        const isMobile = isMobileDevice();
        const scrollTriggerConfig = getScrollTriggerConfig(isMobile);

        const q = gsap.utils.selector(section);

        // Initial States
        // 1. Regular text hidden until intro completes
        gsap.set(q("[data-text-id]"), { opacity: 0 });
        gsap.set(q("[data-lede]"), { opacity: 0 });
        gsap.set(q("[data-intro-text]"), { opacity: 0 });
        gsap.set(q("[data-outro-text]"), { opacity: 0, pointerEvents: "none" });
        gsap.set(q("[data-emphasis-word]"), { fontWeight: 400, fontStyle: "normal" });
        gsap.set(q("[data-emphasis-underline]"), { opacity: 0, scaleX: 0 });

        // 2. Badges: Border/Bg transparent, Text translucent, normal style
        // We need to be careful not to override the class colors for the final state.
        // We will animate from transparent to the computed style or just use specific values.
        gsap.set(q("[data-badge-id]"), {
          opacity: 0,
          backgroundColor: "rgba(255, 255, 255, 0)",
          borderColor: "rgba(0,0,0,0)", // Generic transparent
          fontStyle: "normal"
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=5000", // Extended distance to provide additional scroll room
            scrub: scrollTriggerConfig.scrubValue, // Device-optimized scrub
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              // Check if we're past the "outroTransition" label
              // Get the label position (will be available after timeline is built)
              const outroLabelPos = tl.labels?.outroTransition;
              if (outroLabelPos !== undefined) {
                const currentTime = self.progress * tl.duration();
                const isInOutro = currentTime >= outroLabelPos;
                setPlanesActive(isInOutro);
              }
            },
          },
        });

        // Helper for badge activation
        const activateBadge = (index: number, colorVar: string, rotation: number, ease: string) => {
          const badge = q(`[data-badge-id="${index}"]`);
          const wrapper = q(`[data-icon="${index}"]`);
          const circle = q(`[data-icon-circle="${index}"]`);

          // 1. Badge Appearance & Text Morph
          tl.to(badge, {
            opacity: 1,
            borderColor: colorVar,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            fontStyle: "italic",
            duration: 1.5,
            ease: "power2.out"
          });

          // 2. Icon Expansion (Concurrent)
          tl.to(wrapper, { width: "1.5em", duration: 1, ease: "power2.out" }, "<");
          tl.to(circle, { scale: 1, rotation, duration: 1.5, ease }, "<0.2");
        };

        // --- Sequence ---

        // 0. Intro message
        tl.fromTo(
          q("[data-intro-text]"),
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.out" }
        );
        tl.to({}, { duration: 2 }); // Hold intro visible before emphasis morph
        tl.to(
          q("[data-emphasis-word]"),
          { fontWeight: 700, fontStyle: "italic", duration: 0.9, ease: "power2.out" },
          "<0.1"
        );
        tl.to(
          q("[data-emphasis-underline]"),
          { opacity: 1, scaleX: 1, duration: 0.9, ease: "power2.out" },
          "<"
        );
        tl.to({}, { duration: 1.5 }); // Keep intro visible after emphasis morph
        tl.to(
          q("[data-intro-text]"),
          { opacity: 0, duration: 0.6, ease: "power2.inOut" },
          "+=0.3"
        );
        tl.to({}, { duration: 0.8 });
        tl.set(q("[data-lede]"), { opacity: 1 });

        // 1. "Brands require "
        tl.to(q(`[data-text-id="1"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.4 });

        // 2. Badge 1 "Strategic Asset Management"
        activateBadge(1, "var(--charcoal-blue)", 360, "back.out(1.7)");
        tl.to({}, { duration: 0.5 });

        // 3. " to function. They need "
        tl.to(q(`[data-text-id="2"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.4 });

        // 4. Badge 2 "Operational Excellence"
        activateBadge(2, "var(--rosy-taupe)", -15, "elastic.out(1, 0.5)");
        tl.to({}, { duration: 0.5 });

        // 5. "in every step."
        tl.to(q(`[data-text-id="3"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.6 });

        // 9. Transition to Outro
        tl.to({}, { duration: 0.5 });

        // Add label to mark the start of outro transition
        tl.addLabel("outroTransition");

        // PRE-CALCULATE pixel values to avoid per-frame vw/vh conversions during scrub
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const xOffset = viewportWidth * 0.24; // 24vw in pixels
        const yOffset = viewportHeight * 0.24; // 24vh in pixels

        const corners = [
          { x: -xOffset, y: -yOffset, rotation: -15 }, // Top-Left
          { x: xOffset, y: yOffset, rotation: 10 }     // Bottom-Right
        ];

        // Prepare badges for animation with will-change hint
        const badges = q("[data-badge-id]");
        badges.forEach((badge) => {
          gsap.set(badge, { willChange: "transform, opacity" });
        });

        // STAGGERED SEQUENCE for better performance distribution:

        // 1. First: Background color change (0s offset)
        tl.to(section, {
          backgroundColor: "var(--charcoal-blue)",
          color: "var(--parchment)",
          duration: 2.5,
          ease: "power2.inOut"
        }, "outroTransition");

        // 2. Second: Text fadeout (0.1s offset)
        tl.to(q("[data-text-id]"), {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out"
        }, "outroTransition+=0.1");

        // 3. Third: Badge scattering (0.2s offset) - now with pixel values
        badges.forEach((badge, i) => {
          if (!corners[i]) return;

          tl.to(badge, {
            x: corners[i].x,
            y: corners[i].y,
            rotation: corners[i].rotation,
            pointerEvents: "none",
            duration: 2.5,
            ease: "power2.inOut"
          }, "outroTransition+=0.2");
        });

        // 4. Fourth: Outro text fade-in (0.5s offset)
        tl.to(q("[data-outro-text]"), {
          opacity: 1,
          color: "var(--parchment)",
          pointerEvents: "auto",
          duration: 3.0,
          ease: "power2.out"
        }, "outroTransition+=0.5");

        // 5. Remove will-change hints after animation completes to free GPU memory
        tl.call(() => {
          badges.forEach((badge) => {
            gsap.set(badge, { willChange: "auto" });
          });
        }, [], ">");

        // Hold at end
        tl.to({}, { duration: 2.5 });

      }, sectionRef);
    };

    init();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [startAnimation]);

  return (
    <section
      className={styles.badgeCloudSection}
      aria-labelledby="badge-cloud-heading"
      data-index="3"
      ref={sectionRef}
    >
      <PaperPlaneCanvas active={planesActive} />
      <div className={styles.introText} data-intro-text>
        We{" "}
        <span className={styles.emphasisWord} data-emphasis-word>
          understand
          <span className={styles.emphasisUnderline} data-emphasis-underline />
        </span>{" "}
        that
      </div>

      <div className={styles.outroText} data-outro-text>
        and we aim to simplify all of that.
        <SmartButton
          text="Find out how"
          theme="light"
          hoverColor="var(--rosy-taupe)"
          onClick={() => router.push("/services")}
        />
      </div>

      <div className={styles.contentWrapper}>
        <h2 id="badge-cloud-heading" className={styles.screenReaderOnly}>
          Core Competencies
        </h2>
        <p className={styles.lede} data-lede>
          <span data-text-id="1">Visionary growth requires </span>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}><button
            className={styles.badge}
            data-badge-id="1"
            onClick={() => handleBadgeClick("/services#branch-owner")}
            type="button"
            style={{ marginRight: 0 }}
          >
            <span className={styles.iconWrapper} data-icon="1">
              <span className={styles.iconCircle} data-icon-circle="1">
                <StarIcon />
              </span>
            </span>
            Strategic Asset Management
          </button><span data-text-id="2">.</span></span>
          <span data-text-id="2"> Flawless execution demands </span>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}><button
            className={`${styles.badge} ${styles.rosy}`}
            data-badge-id="2"
            onClick={() => handleBadgeClick("/services#branch-operator")}
            type="button"
            style={{ marginRight: 0 }}
          >
            <span className={styles.iconWrapper} data-icon="2">
              <span className={styles.iconCircle} data-icon-circle="2">
                <OrbitIcon />
              </span>
            </span>
            Operational Excellence
          </button><span data-text-id="3">.</span></span>
        </p>
      </div>
    </section>
  );
};
