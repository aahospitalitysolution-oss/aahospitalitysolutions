import { useEffect, useRef, useState } from "react";
import { PaperPlaneCanvas } from "./PaperPlaneCanvas";
import SmartButton from "../SmartButton";
import styles from "./BadgeCloud.module.css";

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

  const handleBadgeClick = (path: string) => {
    // Navigation will be handled elsewhere - placeholder for now
    console.log(`Navigate to: ${path}`);
    // You can uncomment and modify this when ready:
    // window.location.href = path;
    // Or use Next.js router:
    // router.push(path);
  };

  useEffect(() => {
    if (!startAnimation) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ctx: any;

    const init = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      if (prefersReducedMotion) {
        // In reduced motion, ensure everything is visible and in final state
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
            scrub: 0.5, // Smooth scrub
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

        // 2. Badge 1 "Peak Performance"
        activateBadge(1, "var(--charcoal-blue)", 360, "back.out(1.7)");
        tl.to({}, { duration: 0.5 });

        // 3. " to function. They need "
        tl.to(q(`[data-text-id="2"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.4 });

        // 4. Badge 2 "Value Optimization"
        activateBadge(2, "var(--rosy-taupe)", -15, "elastic.out(1, 0.5)");
        tl.to({}, { duration: 0.5 });

        // 5. "in every step, combined with"
        tl.to(q(`[data-text-id="3"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.4 });

        // 6. Badge 3 "Owner Alignment"
        activateBadge(3, "var(--charcoal-blue)", 0, "back.out(2)");
        tl.to({}, { duration: 0.5 });

        // 7. " and "
        tl.to(q(`[data-text-id="4"]`), { opacity: 1, duration: 1.4 });
        tl.to({}, { duration: 0.4 });

        // 8. Badge 4 "Team Excellence"
        activateBadge(4, "#9c9273", 15, "elastic.out(1, 0.5)"); // Khaki specific text color used in CSS, approximating border
        tl.to({}, { duration: 0.6 });

        // 9. Transition to Outro
        tl.to({}, { duration: 0.5 });
        
        // Add label to mark the start of outro transition
        tl.addLabel("outroTransition");
        
        // Animate Section Background and Text Color
        // "flip the color" - transitions background to charcoal-blue and text to parchment
        tl.to(section, { 
            backgroundColor: "var(--charcoal-blue)", 
            color: "var(--parchment)", 
            duration: 2.5, // Increased duration for "more scrolls"
            ease: "power2.inOut"
        }, "outroTransition");

        // FADE OUT TEXT: Immediately fade out surrounding text
        tl.to(q("[data-text-id]"), {
            opacity: 0,
            duration: 0.2,
            ease: "power1.out"
        }, "outroTransition");

        // SCATTER BADGES: Move badges to corners without changing visual style
        // Specific corner targets for each badge (0-3)
        // Reduced values to ensure they are visible (stick out just a bit, not gone)
        // Previous was 45vw/40vh which pushed them too far.
        // Trying smaller values to keep them "in view" but at edges.
        const corners = [
            { x: "-24vw", y: "-24vh", rotation: -15 }, // Top-Left
            { x: "24vw", y: "-24vh", rotation: 15 },   // Top-Right
            { x: "-24vw", y: "24vh", rotation: -10 },  // Bottom-Left
            { x: "24vw", y: "24vh", rotation: 10 }     // Bottom-Right
        ];

        q("[data-badge-id]").forEach((badge, i) => {
            if (!corners[i]) return;
            
            tl.to(badge, {
                x: corners[i].x,
                y: corners[i].y,
                rotation: corners[i].rotation,
                pointerEvents: "none", // Disable interaction/hover
                duration: 2.5,
                ease: "power2.inOut"
            }, "outroTransition");
        });
        
        tl.to(q("[data-outro-text]"), { 
            opacity: 1, 
            color: "var(--parchment)", // Ensure text becomes light
            pointerEvents: "auto", 
            duration: 3.0, // Significantly increased duration
            ease: "power2.out" 
        }, "outroTransition+=0.5");

        // Hold at end
        tl.to({}, { duration: 2.5 });

      }, sectionRef);
    };

    init();

    return () => {
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
        but we aim to simplify all of that.
        <SmartButton 
          text="Find out how" 
          theme="light" 
          hoverColor="var(--rosy-taupe)"
        />
      </div>

      <div className={`contentWrapper ${styles.contentWrapper}`}>
        <h2 id="badge-cloud-heading" className={styles.screenReaderOnly}>
          Badge cloud variation
        </h2>
        <p className={styles.lede} data-lede>
          <span data-text-id="1">Brands require </span>
          <button 
            className={styles.badge} 
            data-badge-id="1" 
            onClick={() => handleBadgeClick("/advisory")}
            type="button"
          >
            <span className={styles.iconWrapper} data-icon="1">
              <span className={styles.iconCircle} data-icon-circle="1">
                <StarIcon />
              </span>
            </span>
            Peak Performance
          </button>{" "}
          <span data-text-id="2">to function. They need </span>
          <button 
            className={`${styles.badge} ${styles.rosy}`} 
            data-badge-id="2"
            onClick={() => handleBadgeClick("/precision")}
            type="button"
          >
            <span className={styles.iconWrapper} data-icon="2">
              <span className={styles.iconCircle} data-icon-circle="2">
                <OrbitIcon />
              </span>
            </span>
            Value Optimization
          </button>{" "}
          <span className={styles.lineBreakText} data-text-id="3">in every step, combined with</span>{" "}
          <button 
            className={styles.badge} 
            data-badge-id="3"
            onClick={() => handleBadgeClick("/partnership")}
            type="button"
          >
            <span className={styles.iconWrapper} data-icon="3">
              <span className={styles.iconCircle} data-icon-circle="3">
                <ChatIcon />
              </span>
            </span>
            Owner Alignment
          </button>{" "}
          <span data-text-id="4">and </span>
          <button 
            className={`${styles.badge} ${styles.khaki}`} 
            data-badge-id="4"
            onClick={() => handleBadgeClick("/strategy")}
            type="button"
          >
            <span className={styles.iconWrapper} data-icon="4">
              <span className={styles.iconCircle} data-icon-circle="4">
                <PencilIcon />
              </span>
            </span>
            Team Excellence
          </button>
        </p>
      </div>
    </section>
  );
};
