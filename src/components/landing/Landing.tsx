"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./Landing.module.css";
import { LandingHero } from "./LandingHero";
import { LandingCanvasHandle } from "./LandingCanvas";

import { useAnimationContext } from "@/contexts/AnimationContext";
import { OurStory } from "./OurStory";
import { BadgeCloud } from "./BadgeCloud";
import { EthosSection } from "./EthosSection";
import PartnersSection from "./PartnersSection";
import dynamic from "next/dynamic";

const Globe = dynamic(
  () => import("./Globe").then((mod) => mod.GlobeSection),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '100vh' }} />
  }
);

type GSAPStatic = any;
type ScrollTriggerStatic = any;
type LenisInstance = any;

// Hoist easing functions to avoid re-creation on every frame
const power2Out = (t: number) => 1 - Math.pow(1 - t, 2);
const power2InOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const power2In = (t: number) => t * t;

interface LandingProps {
  navRef?: React.RefObject<HTMLElement | null>;
}

export const Landing = ({ navRef }: LandingProps) => {
  const { imagesLoaded } = useAnimationContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<LandingCanvasHandle>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const aadityaRef = useRef<HTMLDivElement>(null);
  const aaryahiRef = useRef<HTMLDivElement>(null);
  const togetherRef = useRef<HTMLDivElement>(null);
  const textBlock4Ref = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<LenisInstance>(null);
  const scrollTriggerRef = useRef<ScrollTriggerStatic>(null);
  const [heroPinned, setHeroPinned] = useState(false);
  const progressRef = useRef({ resize: 0, timeline: 0 });
  const isCompleteRef = useRef(false);
  const heroContainerRef = useRef<HTMLDivElement | null>(null);

  const isAadityaAnimating = useRef(false);
  const isAaryahiAnimating = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const refs = [headerRef, aadityaRef, aaryahiRef, togetherRef, textBlock4Ref];
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
        }
      });
      setHeroPinned(true);
      return;
    }

    if (!imagesLoaded) return;

    let gsap: GSAPStatic;
    let ScrollTrigger: ScrollTriggerStatic;
    let Lenis: any;

    const initAnimation = async () => {
      const gsapModule = await import("gsap");
      gsap = gsapModule.default;
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      const lenisModule = await import("lenis");
      Lenis = lenisModule.default;

      gsap.registerPlugin(ScrollTrigger);

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

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      const frameCount = 385;
      const totalScrollDistance = window.innerHeight * 8;
      const resizePhaseEnd = window.innerHeight;

      // Optimized animation function: removed inner object creation
      const animateZoomBlock = (
        element: HTMLElement,
        progress: number,
        threshold: number,
        stayVisible: boolean = false,
        isCentered: boolean = false,
        skipEntry: boolean = false,
        shrinkDuringHold: boolean = false
      ) => {
        // Helper to reuse config object structure
        const applyStyle = (scale: number, opacity: number, pointerEvents: string) => {
          gsap.set(element, {
            scale,
            opacity,
            pointerEvents,
            xPercent: isCentered ? -50 : 0,
            yPercent: isCentered ? -50 : 0
          });
        };

        const zoomInDuration = 0.03;
        const reduceSizeDuration = 0.02;
        const holdDuration = 0.1333;
        const zoomOutDuration = 0.03;

        const entryStart = Math.max(0, threshold - zoomInDuration);
        const entryEnd = threshold;
        const reduceEnd = threshold + reduceSizeDuration;
        const holdEnd = threshold + reduceSizeDuration + holdDuration;
        const exitEnd = stayVisible
          ? 1
          : Math.min(1, threshold + reduceSizeDuration + holdDuration + zoomOutDuration);

        if (stayVisible) {
          if (progress < entryStart) {
            applyStyle(3, 0, "none");
          } else if (progress >= entryStart && progress < entryEnd) {
            const rawP = (progress - entryStart) / (entryEnd - entryStart);
            const p = power2Out(rawP);
            applyStyle(3 - p * 2, p, "none");
          } else if (progress >= entryEnd && progress < reduceEnd) {
            const rawP = (progress - entryEnd) / (reduceEnd - entryEnd);
            const p = power2InOut(rawP);
            applyStyle(1 - p * 0.15, 1, "auto");
          } else {
            // Optimization: If already at final state, avoiding redundant sets helps GSAP
            applyStyle(0.85, 1, "auto");
          }
        } else {
          // Normal temporary blocks
          if (progress < entryStart) {
            if (skipEntry) applyStyle(1, 1, "auto");
            else applyStyle(3, 0, "none");
          } else if (progress >= entryStart && progress < entryEnd) {
            if (skipEntry) applyStyle(1, 1, "auto");
            else {
              const rawP = (progress - entryStart) / (entryEnd - entryStart);
              const p = power2Out(rawP);
              applyStyle(3 - p * 2, p, "auto");
            }
          } else if (progress >= entryEnd && progress < reduceEnd) {
            if (skipEntry) applyStyle(1, 1, "auto");
            else {
              const rawP = (progress - entryEnd) / (reduceEnd - entryEnd);
              const p = power2InOut(rawP);
              applyStyle(1 - p * 0.15, 1, "auto");
            }
          } else if (progress >= reduceEnd && progress < holdEnd) {
            const startScale = skipEntry ? 1 : 0.85;
            let scale = startScale;
            if (shrinkDuringHold) {
              const rawP = (progress - reduceEnd) / (holdEnd - reduceEnd);
              scale = startScale * (1 - rawP * 0.1);
            }
            applyStyle(scale, 1, "auto");
          } else if (progress >= holdEnd && progress < exitEnd) {
            const rawP = (progress - holdEnd) / (exitEnd - holdEnd);
            const p = power2In(rawP);
            let startScale = skipEntry ? 1 : 0.85;
            if (shrinkDuringHold) startScale = startScale * 0.9;

            const scale = startScale - p * (startScale - 0.5);
            const opacity = 1 - p;
            applyStyle(scale, opacity, opacity > 0.5 ? "auto" : "none");
          } else if (progress >= exitEnd) {
            applyStyle(3, 0, "none");
          }
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: `+=${totalScrollDistance}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self: any) => {
          const scrolled = self.progress * totalScrollDistance;

          if (scrolled <= resizePhaseEnd) {
            // --- RESIZE PHASE ---
            const resizeProgress = scrolled / resizePhaseEnd;
            progressRef.current.resize = resizeProgress;
            progressRef.current.timeline = 0;
            isCompleteRef.current = false;

            if (heroContainerRef.current) {
              const scale = 0.5 + resizeProgress * 0.5;
              const overlayOpacity = resizeProgress * 0.65;
              const textOffset = 180;
              const currentY = textOffset * (1 - resizeProgress);
              const currentTop = (1 - resizeProgress) * 12; // 12vh to 0vh

              gsap.set(heroContainerRef.current, {
                '--container-scale': scale,
                '--overlay-opacity': overlayOpacity,
                '--container-y': `${currentY}px`,
                top: `${currentTop}vh`,
              });
            }

            const buttonWrapper = heroRef.current?.querySelector('[data-partner-button]');
            const navButtons = heroRef.current?.querySelector('[data-reach-out-button]');

            if (buttonWrapper) {
              gsap.set(buttonWrapper, {
                opacity: 1 - resizeProgress,
                pointerEvents: resizeProgress > 0.5 ? 'none' : 'auto',
              });
            }
            if (navButtons) {
              gsap.set(navButtons, {
                opacity: resizeProgress,
                pointerEvents: resizeProgress > 0.5 ? 'auto' : 'none',
              });
            }

            // Transition hero text color from blue to white
            if (headerRef.current) {
              gsap.set(headerRef.current, {
                '--hero-text-color-transition': resizeProgress,
              });
            }

            if (canvasRef.current) canvasRef.current.setFrame(0);

            const textOverlays = [aadityaRef, aaryahiRef, togetherRef, textBlock4Ref];
            textOverlays.forEach((ref) => {
              if (ref.current) gsap.set(ref.current, { opacity: 0, scale: 3, pointerEvents: "none" });
            });
            // if (headerRef.current) gsap.set(headerRef.current, { opacity: 1, scale: 1 });

          } else {
            // --- TIMELINE PHASE ---
            const timelineScrolled = scrolled - resizePhaseEnd;
            const timelineTotal = totalScrollDistance - resizePhaseEnd;
            const timelineProgress = timelineScrolled / timelineTotal;

            progressRef.current.resize = 1;
            progressRef.current.timeline = timelineProgress;
            isCompleteRef.current = timelineProgress >= 1;

            if (heroContainerRef.current) {
              gsap.set(heroContainerRef.current, {
                '--container-scale': 1,
                '--overlay-opacity': 0.65,
                '--container-y': '0px',
                top: '0px',
              });
            }

            // Force specific visibility states for buttons during timeline
            const buttonWrapper = heroRef.current?.querySelector('[data-partner-button]');
            const navButtons = heroRef.current?.querySelector('[data-reach-out-button]');
            if (buttonWrapper) gsap.set(buttonWrapper, { opacity: 0, pointerEvents: 'none' });
            if (navButtons) gsap.set(navButtons, { opacity: 1, pointerEvents: 'auto' });

            const targetFrame = Math.round(timelineProgress * (frameCount - 1));

            if (canvasRef.current) {
              canvasRef.current.setFrame(targetFrame);

              // Optimized freeze call - logic moved to LandingCanvas
              if (timelineProgress >= 1) {
                canvasRef.current.freeze();
              } else {
                canvasRef.current.unfreeze();
              }
            }

            // 0. Greek Header
            if (headerRef.current) {
              animateZoomBlock(headerRef.current, timelineProgress, 0.03, false, false, true, true);
            }

            // 1. Aaditya
            if (aadityaRef.current) {
              const aadityaStart = 0.2133;
              const aadityaEnd = 0.4266;
              const shouldBeActive = timelineProgress >= aadityaStart && timelineProgress <= aadityaEnd;

              if (shouldBeActive !== isAadityaAnimating.current) {
                isAadityaAnimating.current = shouldBeActive;
                aadityaRef.current.classList.toggle(styles.animateAaditya, shouldBeActive);
              }
              animateZoomBlock(aadityaRef.current, timelineProgress, 0.2433, false, true, false, true);
            }

            // 2. Aaryahi
            if (aaryahiRef.current) {
              const aaryahiStart = 0.4266;
              const aaryahiEnd = 0.64;
              const shouldBeActive = timelineProgress >= aaryahiStart && timelineProgress <= aaryahiEnd;

              if (shouldBeActive !== isAaryahiAnimating.current) {
                isAaryahiAnimating.current = shouldBeActive;
                aaryahiRef.current.classList.toggle(styles.animateAaryahi, shouldBeActive);
              }
              animateZoomBlock(aaryahiRef.current, timelineProgress, 0.4566, false, true, false, true);
            }

            // 3. Together
            if (togetherRef.current) {
              animateZoomBlock(togetherRef.current, timelineProgress, 0.67, false, true, false, true);
            }

            // 4. Final Block
            if (textBlock4Ref.current) {
              animateZoomBlock(textBlock4Ref.current, timelineProgress, 0.8833, true, true);
            }
          }
        },
      });

      scrollTriggerRef.current = trigger;

      let resizeTimeout: NodeJS.Timeout | null = null;
      const handleResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      };

      window.addEventListener("resize", handleResize);

      // Delay refresh to ensure DOM is fully settled after navigation
      // This fixes issues where sections (like "We understand...") might not appear correctly on return
      setTimeout(() => {
        ScrollTrigger.refresh();
        setHeroPinned(true);
      }, 100);

      return () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        window.removeEventListener("resize", handleResize);
        if (trigger) trigger.kill();
        setHeroPinned(false);
      };
    };

    const cleanup = initAnimation();

    return () => {
      cleanup.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      ScrollTrigger?.getAll().forEach((trigger: any) => trigger.kill());
      if (lenisRef.current) lenisRef.current.destroy();
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
          heroContainerRef={heroContainerRef}
          onImagesLoaded={() => { }}
        />
      </div>

      <OurStory startAnimation={heroPinned} />
      <EthosSection startAnimation={heroPinned} />
      <Globe />
      <PartnersSection />
      <BadgeCloud startAnimation={heroPinned} />


    </div>
  );
};
