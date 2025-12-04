"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./Landing.module.css";
import { LandingHero } from "./LandingHero";
import { LandingCanvasHandle } from "./LandingCanvas";
import { MorphSection } from "../MorphSection";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { OurStory } from "./OurStory";
import { BadgeCloud } from "./BadgeCloud";
import { EthosSection } from "./EthosSection";
import dynamic from "next/dynamic";

// Dynamically import Globe to avoid bundling three.js in the main chunk
const Globe = dynamic(
  () => import("./Globe").then((mod) => mod.GlobeSection),
  { 
    ssr: false,
    loading: () => <div style={{ minHeight: '100vh' }} /> // Placeholder to prevent layout shift
  }
);

// GSAP types placeholder for loose typing without full @types/gsap
// In a strict project, we should use import { GSAPStatic, ScrollTriggerStatic } from "gsap"
type GSAPStatic = any;
type ScrollTriggerStatic = any;
type LenisInstance = any;

interface LandingProps {
  navRef?: React.RefObject<HTMLElement | null>;
}

export const Landing = ({ navRef }: LandingProps) => {
  const { imagesLoaded } = useAnimationContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<LandingCanvasHandle>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // New refs for the requested flow
  const aadityaRef = useRef<HTMLDivElement>(null);
  const aaryahiRef = useRef<HTMLDivElement>(null);
  const togetherRef = useRef<HTMLDivElement>(null);
  const textBlock4Ref = useRef<HTMLDivElement>(null); // Keeping name for minimal diff, refers to final block

  // Ref for resize phase ScrollTrigger target
  const resizePhaseRef = useRef<HTMLDivElement>(null);

  const lenisRef = useRef<LenisInstance>(null);
  const scrollTriggerRef = useRef<ScrollTriggerStatic>(null);

  // State to coordinate animation initialization
  const [heroPinned, setHeroPinned] = useState(false);

  // Two-phase animation state
  const [currentPhase, setCurrentPhase] = useState<
    "resize" | "timeline" | "complete"
  >("resize");
  const [resizeProgress, setResizeProgress] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      const refs = [
        headerRef,
        aadityaRef,
        aaryahiRef,
        togetherRef,
        textBlock4Ref,
      ];
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
        }
      });
      // Also signal OurStory to show static content
      setHeroPinned(true);
      return;
    }

    // Only initialize after images are loaded
    if (!imagesLoaded) return;

    let gsap: GSAPStatic;
    let ScrollTrigger: ScrollTriggerStatic;
    let Lenis: any;

    const initAnimation = async () => {
      // Dynamic imports to avoid SSR issues
      const gsapModule = await import("gsap");
      gsap = gsapModule.default;

      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      const lenisModule = await import("lenis");
      Lenis = lenisModule.default;

      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis smooth scroll
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });
      lenisRef.current = lenis;

      // Integrate Lenis with GSAP ticker
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      const frameCount = 385;

      // --- COMBINED SCROLLTRIGGER FOR BOTH PHASES ---
      // Single ScrollTrigger handles both resize and timeline phases to avoid double-pinning
      const totalScrollDistance = window.innerHeight * 16; // 1vh for resize + 15vh for timeline
      const resizePhaseEnd = window.innerHeight; // First 100vh is resize phase

      // Helper for 4-phase animation cycle:
      // 1. Fade/zoom in: scale 3→1, opacity 0→1
      // 2. Reduce size: scale 1→0.85
      // 3. Hold: maintain scale 0.85 for 2 viewport heights
      // 4. Zoom out while fading: scale 0.85→3, opacity 1→0
      const animateZoomBlock = (
        element: HTMLElement,
        progress: number,
        threshold: number, // Single threshold point (e.g., 0.25, 0.70, 0.90)
        stayVisible: boolean = false,
        isCentered: boolean = false,
        skipEntry: boolean = false,
        shrinkDuringHold: boolean = false
      ) => {
        const baseConfig = (overrides: Record<string, unknown>) => {
          const config: Record<string, unknown> = { ...overrides };
          // If centered, ensure we keep the translation
          if (isCentered) {
            config.xPercent = -50;
            config.yPercent = -50;
          }
          return config;
        };

        // Easing functions
        const power2Out = (t: number) => {
          return 1 - Math.pow(1 - t, 2);
        };
        const power2InOut = (t: number) => {
          return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };
        const power2In = (t: number) => {
          return t * t;
        };

        // Phase durations (as percentages of timeline) - tightened for smoother transitions
        const zoomInDuration = 0.03; // 3% of timeline
        const reduceSizeDuration = 0.02; // 2% of timeline
        const holdDuration = 0.1333; // 13.33% of timeline (2 viewport heights)
        const zoomOutDuration = 0.03; // 3% of timeline

        // Timeline phase boundaries
        const entryStart = Math.max(0, threshold - zoomInDuration);
        const entryEnd = threshold; // End of zoom in
        const reduceEnd = threshold + reduceSizeDuration; // End of size reduction
        const holdEnd = threshold + reduceSizeDuration + holdDuration; // End of hold phase
        const exitEnd = stayVisible
          ? 1 // For stayVisible, no exit phase
          : Math.min(
              1,
              threshold + reduceSizeDuration + holdDuration + zoomOutDuration
            ); // End of zoom out

        if (stayVisible) {
          // For elements that stay visible (final overlay) - phases 1-3 only
          if (progress < entryStart) {
            // Before animation: hidden
            gsap.set(
              element,
              baseConfig({
                scale: 3,
                opacity: 0,
                pointerEvents: "none",
              })
            );
          } else if (progress >= entryStart && progress < entryEnd) {
            // Phase 1: Zoom in from 3 to 1, opacity 0 to 1
            const rawP = (progress - entryStart) / (entryEnd - entryStart);
            const p = power2Out(rawP);

            const scale = 3 - p * 2; // 3 → 1
            const opacity = p; // 0 → 1

            gsap.set(
              element,
              baseConfig({
                scale: scale,
                opacity: opacity,
                pointerEvents: "none",
              })
            );
          } else if (progress >= entryEnd && progress < reduceEnd) {
            // Phase 2: Reduce size from 1 to 0.85, opacity stays 1
            const rawP = (progress - entryEnd) / (reduceEnd - entryEnd);
            const p = power2InOut(rawP);

            const scale = 1 - p * 0.15; // 1 → 0.85
            const opacity = 1;

            gsap.set(
              element,
              baseConfig({
                scale: scale,
                opacity: opacity,
                pointerEvents: "auto",
              })
            );
          } else {
            // Phase 3: Hold at reduced size (scale 0.85, opacity 1)
            gsap.set(
              element,
              baseConfig({
                scale: 0.85,
                opacity: 1,
                pointerEvents: "auto",
              })
            );
          }
        } else {
          // For elements that appear and disappear - all 4 phases
          if (progress < entryStart) {
            if (skipEntry) {
              // Skip entry: start fully visible
              gsap.set(
                element,
                baseConfig({
                  scale: 1,
                  opacity: 1,
                  pointerEvents: "auto",
                })
              );
            } else {
              // Before entry: hidden
              gsap.set(
                element,
                baseConfig({
                  scale: 3,
                  opacity: 0,
                  pointerEvents: "none",
                })
              );
            }
          } else if (progress >= entryStart && progress < entryEnd) {
            if (skipEntry) {
              // Skip entry: stay fully visible
              gsap.set(
                element,
                baseConfig({
                  scale: 1,
                  opacity: 1,
                  pointerEvents: "auto",
                })
              );
            } else {
              // Phase 1: Zoom in from 3 to 1, opacity 0 to 1
              const rawP = (progress - entryStart) / (entryEnd - entryStart);
              const p = power2Out(rawP);

              const scale = 3 - p * 2; // 3 → 1
              const opacity = p; // 0 → 1

              gsap.set(
                element,
                baseConfig({
                  scale: scale,
                  opacity: opacity,
                  pointerEvents: "auto",
                })
              );
            }
          } else if (progress >= entryEnd && progress < reduceEnd) {
            // Phase 2: Reduce size from 1 to 0.85, opacity stays 1
            if (skipEntry) {
              // If skipEntry, we don't reduce size. Stay at scale 1.
              gsap.set(
                element,
                baseConfig({
                  scale: 1,
                  opacity: 1,
                  pointerEvents: "auto",
                })
              );
            } else {
              const rawP = (progress - entryEnd) / (reduceEnd - entryEnd);
              const p = power2InOut(rawP);

              const scale = 1 - p * 0.15; // 1 → 0.85
              const opacity = 1;

              gsap.set(
                element,
                baseConfig({
                  scale: scale,
                  opacity: opacity,
                  pointerEvents: "auto",
                })
              );
            }
          } else if (progress >= reduceEnd && progress < holdEnd) {
            // Phase 3: Hold at reduced size (scale 0.85, opacity 1)
            const startScale = skipEntry ? 1 : 0.85;
            let scale = startScale;

            if (shrinkDuringHold) {
              const rawP = (progress - reduceEnd) / (holdEnd - reduceEnd);
              // Use a gentle ease for the shrink
              const p = rawP;
              // Shrink to 90% of the start scale
              scale = startScale * (1 - p * 0.1);
            }

            gsap.set(
              element,
              baseConfig({
                scale: scale,
                opacity: 1,
                pointerEvents: "auto",
              })
            );
          } else if (progress >= holdEnd && progress < exitEnd) {
            // Phase 4: Zoom out from 0.85 to 0.5, opacity 1 to 0
            const rawP = (progress - holdEnd) / (exitEnd - holdEnd);
            const p = power2In(rawP);

            // If skipEntry is true, we start from scale 1 instead of 0.85
            let startScale = skipEntry ? 1 : 0.85;

            // If we shrank during hold, start from the shrunk size (90%)
            if (shrinkDuringHold) {
              startScale = startScale * 0.9;
            }

            const scale = startScale - p * (startScale - 0.5); // startScale → 0.5
            const opacity = 1 - p; // 1 → 0

            gsap.set(
              element,
              baseConfig({
                scale: scale,
                opacity: opacity,
                pointerEvents: opacity > 0.5 ? "auto" : "none",
              })
            );
          } else if (progress >= exitEnd) {
            // After exit: hidden
            gsap.set(
              element,
              baseConfig({
                scale: 3,
                opacity: 0,
                pointerEvents: "none",
              })
            );
          }
        }
      };

      // --- COMBINED SCROLLTRIGGER ---
      // Single ScrollTrigger handles both resize and timeline phases
      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: `+=${totalScrollDistance}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self: any) => {
          const scrolled = self.progress * totalScrollDistance;

          // Determine which phase we're in based on scroll distance
          if (scrolled <= resizePhaseEnd) {
            // RESIZE PHASE (0 - 100vh)
            const resizeProgress = scrolled / resizePhaseEnd;
            setResizeProgress(resizeProgress);
            setCurrentPhase("resize");

            // Keep canvas at frame 0 during resize
            if (canvasRef.current) {
              canvasRef.current.setFrame(0);
            }

            // Hide text overlays during Resize Phase (except Greek header which stays visible)
            const textOverlays = [
              aadityaRef,
              aaryahiRef,
              togetherRef,
              textBlock4Ref,
            ];
            textOverlays.forEach((ref) => {
              if (ref.current) {
                gsap.set(ref.current, {
                  opacity: 0,
                  scale: 3,
                  pointerEvents: "none",
                });
              }
            });

            // Show header during resize (it will animate during timeline phase)
            if (headerRef.current) {
              gsap.set(headerRef.current, {
                opacity: 1,
                scale: 1,
              });
            }
          } else {
            // TIMELINE PHASE (100vh - 1600vh)
            const timelineScrolled = scrolled - resizePhaseEnd;
            const timelineTotal = totalScrollDistance - resizePhaseEnd;
            const timelineProgress = timelineScrolled / timelineTotal;

            setResizeProgress(1); // Keep at 100%
            setTimelineProgress(timelineProgress);
            setCurrentPhase(timelineProgress >= 1 ? "complete" : "timeline");

            // Frame scrubbing during timeline phase
            const targetFrame = Math.round(timelineProgress * (frameCount - 1));
            if (canvasRef.current) {
              canvasRef.current.setFrame(targetFrame);
            }

            // --- Animation Timeline ---
            // Sequential animations with no gaps:
            // Each block: 3% zoom in + 2% reduce + 13.33% hold + 3% zoom out = 21.33% total
            // Greek header: 0.0 → 0.2133
            // Aaditya: 0.2133 → 0.4266
            // Aaryahi: 0.4266 → 0.64
            // Together: 0.64 → 0.8533
            // Final block: 0.8533 → (stays visible)

            // 0. Greek Header - Full 4-phase cycle, starts at timeline beginning
            if (headerRef.current) {
              animateZoomBlock(
                headerRef.current,
                timelineProgress,
                0.03, // Threshold: zoom-in completes at 3%
                false, // stayVisible - will fade out
                false, // isCentered
                true, // skipEntry
                true // shrinkDuringHold
              );
            }

            // 1. Aaditya (Upper Center)
            if (aadityaRef.current) {
              const aadityaStart = 0.2133;
              const aadityaEnd = 0.4266;

              // Toggle animation class for internal SVG animations
              if (
                timelineProgress >= aadityaStart &&
                timelineProgress <= aadityaEnd
              ) {
                aadityaRef.current.classList.add(styles.animateAaditya);
              } else {
                aadityaRef.current.classList.remove(styles.animateAaditya);
              }

              animateZoomBlock(
                aadityaRef.current,
                timelineProgress,
                0.2433, // Threshold: 0.2133 + 0.03
                false, // stayVisible
                true, // isCentered
                false, // skipEntry
                true // shrinkDuringHold
              );
            }

            // 2. Aaryahi (Lower Center)
            if (aaryahiRef.current) {
              const aaryahiStart = 0.4266;
              const aaryahiEnd = 0.64;

              // Toggle animation class for internal SVG animations
              if (
                timelineProgress >= aaryahiStart &&
                timelineProgress <= aaryahiEnd
              ) {
                aaryahiRef.current.classList.add(styles.animateAaryahi);
              } else {
                aaryahiRef.current.classList.remove(styles.animateAaryahi);
              }

              animateZoomBlock(
                aaryahiRef.current,
                timelineProgress,
                0.4566, // Threshold: 0.4266 + 0.03
                false, // stayVisible
                true, // isCentered
                false, // skipEntry
                true // shrinkDuringHold
              );
            }

            // 3. Together Section (Center)
            if (togetherRef.current) {
              animateZoomBlock(
                togetherRef.current,
                timelineProgress,
                0.67, // Threshold: 0.64 + 0.03
                false, // stayVisible
                true, // isCentered
                false, // skipEntry
                true // shrinkDuringHold
              );
            }

            // 4. Final Block (Center)
            if (textBlock4Ref.current) {
              animateZoomBlock(
                textBlock4Ref.current,
                timelineProgress,
                0.8833, // Threshold: 0.8533 + 0.03
                true, // Stay visible
                true // isCentered
              );
            }
          }
        },
      });

      scrollTriggerRef.current = trigger;

      // Handle window resize with debouncing
      let resizeTimeout: NodeJS.Timeout | null = null;

      const handleResize = () => {
        // Clear existing timeout
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        // Debounce resize handler to 100ms
        resizeTimeout = setTimeout(() => {
          // Call ScrollTrigger.refresh() to recalculate positions
          ScrollTrigger.refresh();

          // Recalculate responsive breakpoint values
          const viewportWidth = window.innerWidth;
          const isMobile = viewportWidth < 768;

          // Update container dimensions based on new viewport
          // The HeroImageContainer component will automatically respond to the
          // resizeProgress state, but we need to ensure ScrollTrigger recalculates
          // the animation parameters for the new viewport size

          // Force a re-render to update any viewport-dependent calculations
          setResizeProgress((prev) => prev); // Trigger state update without changing value

          // Log resize event for debugging
          if (process.env.NODE_ENV === "development") {
            console.log("Viewport resized:", {
              width: viewportWidth,
              height: window.innerHeight,
              isMobile,
            });
          }
        }, 100); // 100ms debounce delay
      };

      window.addEventListener("resize", handleResize);

      // Force refresh so everything knows about the new pinned height
      ScrollTrigger.refresh();

      // Signal that hero is pinned and downstream components can initialize their triggers
      setHeroPinned(true);

      return () => {
        // Clear any pending resize timeout
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        window.removeEventListener("resize", handleResize);

        // Kill ScrollTrigger instance
        if (trigger) {
          trigger.kill();
        }

        // Reset state on cleanup
        setHeroPinned(false);
      };
    };

    const cleanup = initAnimation();

    return () => {
      cleanup.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });

      // Kill ScrollTrigger instances
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger?.getAll().forEach((trigger: any) => trigger.kill());

      // Destroy Lenis
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, [imagesLoaded, navRef]);

  return (
    <div className={styles.landingContainer}>
      <div ref={heroRef} className={styles.heroWrapper}>
        <LandingHero
          variant="bottom"
          canvasRef={canvasRef}
          headerRef={headerRef}
          aadityaRef={aadityaRef}
          aaryahiRef={aaryahiRef}
          togetherRef={togetherRef}
          textBlock4Ref={textBlock4Ref}
          resizeProgress={resizeProgress}
          isResizePhase={currentPhase === "resize"}
          // No longer needed, handled globally
          onImagesLoaded={() => {}}
        />
      </div>

      {/* Section 2: Our Story (Replaces refined space spacer) */}
      {/* Pass startAnimation prop to ensure it initializes after pinning */}
      <OurStory startAnimation={heroPinned} />

      {/* Section 2b: Ethos narrative */}
      <EthosSection startAnimation={heroPinned} />

      {/* Section 2c: Globe */}
      <Globe />

      {/* Section 2d: Badge Cloud Variant */}
      <BadgeCloud startAnimation={heroPinned} />

      {/* Section 3: Final Form - Variant Top */}
      <MorphSection
        variant="top"
        backgroundColor="var(--charcoal-blue)"
        textColor="var(--parchment)"
        className={styles.finalSection}
      >
        <div className={styles.finalContent}>
          <h1 className={styles.finalHeading}>Final Form</h1>
          <p className={styles.finalParagraph}>
            This section uses <code>variant=&quot;top&quot;</code> to curve
            upwards into the previous section.
          </p>
        </div>
      </MorphSection>
    </div>
  );
};
