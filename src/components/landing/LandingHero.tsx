"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import styles from "./Landing.module.css";
import { LandingCanvas, LandingCanvasHandle } from "./LandingCanvas";
import SmartButton from "../SmartButton";
import { MorphSection } from "../MorphSection";
import { HeroImageContainer } from "./HeroImageContainer";

interface LandingHeroProps {
  canvasRef: React.RefObject<LandingCanvasHandle | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  aadityaRef: React.RefObject<HTMLDivElement | null>;
  aaryahiRef: React.RefObject<HTMLDivElement | null>;
  togetherRef: React.RefObject<HTMLDivElement | null>;
  textBlock4Ref: React.RefObject<HTMLDivElement | null>;
  onImagesLoaded?: () => void;
  variant?: "top" | "bottom" | "both";
  resizeProgress: number;
  isResizePhase: boolean;
}

export const LandingHero = forwardRef<HTMLElement, LandingHeroProps>(
  (
    {
      canvasRef,
      headerRef,
      aadityaRef,
      aaryahiRef,
      togetherRef,
      textBlock4Ref,
      onImagesLoaded,
      variant = "bottom",
      resizeProgress,
      isResizePhase,
    },
    ref
  ) => {
    const [textHeight, setTextHeight] = useState(0);
    const sloganRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!headerRef.current) return;

      const updateHeight = () => {
        if (headerRef.current) {
          setTextHeight(headerRef.current.offsetHeight);
        }
      };

      // Initial measure
      updateHeight();

      const observer = new ResizeObserver(updateHeight);
      observer.observe(headerRef.current);

      return () => observer.disconnect();
    }, [headerRef]);

    // Animate text color from blue to white during resize phase
    useEffect(() => {
      if (typeof window === "undefined") return;

      const animateTextColor = async () => {
        const { default: gsap } = await import("gsap");

        const slogan = sloganRef.current;
        const heading = headingRef.current;

        if (!slogan || !heading) return;

        // Interpolate color from charcoal-blue to white (parchment)
        // Using RGB interpolation for smooth transition
        const startColor = { r: 40, g: 83, b: 107 }; // #28536b
        const endColor = { r: 246, g: 240, b: 237 }; // #f6f0ed (parchment/white)

        const r = Math.round(
          startColor.r + (endColor.r - startColor.r) * resizeProgress
        );
        const g = Math.round(
          startColor.g + (endColor.g - startColor.g) * resizeProgress
        );
        const b = Math.round(
          startColor.b + (endColor.b - startColor.b) * resizeProgress
        );

        const color = `rgb(${r}, ${g}, ${b})`;

        gsap.set([slogan, heading], {
          color: color,
        });

        if (buttonWrapperRef.current) {
          gsap.set(buttonWrapperRef.current, {
            opacity: 1 - resizeProgress,
            pointerEvents: resizeProgress > 0.5 ? "none" : "auto",
          });
        }
      };

      animateTextColor();
    }, [resizeProgress]);

    return (
      <MorphSection
        ref={ref}
        variant={variant}
        className={styles.hero}
        backgroundColor="transparent"
        textColor="var(--parchment)"
        height="100vh"
      >
        <HeroImageContainer
          resizeProgress={resizeProgress}
          isResizePhase={isResizePhase}
          textHeight={textHeight}
        >
          <LandingCanvas ref={canvasRef} onImagesLoaded={onImagesLoaded} />
        </HeroImageContainer>

        <div className={styles.heroContainer}>
          <div className={styles.heroDiv} ref={headerRef}>
            <div ref={sloganRef} className={styles.slogan}>
              Advisory Grounded in Authenticity
            </div>
            <h1 ref={headingRef} className={styles.heroHeading}>
              Strategic excellence for hospitality owners and operators
            </h1>
            <div ref={buttonWrapperRef}>
              <SmartButton
                text="Partner With Us"
                alignment="center"
                onClick={() => console.log("Partner With Us clicked")}
                hoverColor="var(--rosy-taupe)"
                backgroundColor="var(--charcoal-blue)"
                theme="dark"
              />
            </div>
          </div>
        </div>

        {/* Clarity Section (Upper Center) */}
        <div
          ref={aadityaRef}
          className={`${styles.quadrantText} ${styles.quadrantTextUpperCenter}`}
        >
          <p>
            We bring clarity to complex hotel operations, helping owners
            understand their asset, strengthen performance, and make informed
            decisions that protect long-term value.
          </p>
        </div>

        {/* Elevation Section (Lower Center) */}
        <div
          ref={aaryahiRef}
          className={`${styles.quadrantText} ${styles.quadrantTextLowerCenter}`}
        >
          <p>
            We elevate how hotels run, working side-by-side with operators to
            sharpen systems, improve guest experience, and build capable,
            aligned teams.
          </p>
        </div>

        {/* Together Section (Center) */}
        <div
          ref={togetherRef}
          className={`${styles.quadrantText} ${styles.quadrantTextCenter}`}
        >
          <p>
            Together, we transform strategy into results — ensuring every hotel
            performs the way it was meant to.
          </p>
        </div>

        <div
          ref={textBlock4Ref}
          className={`${styles.quadrantText} ${styles.quadrantTextCenter}`}
        >
          <p>
            Every hotel carries a story, and our role is to help shape the
            chapters that lead to lasting value. From strategic oversight to
            daily operational excellence, we bring structure, insight, and
            momentum to your vision. Curious how we turn possibility into
            performance?
            <br />
            <br />
            <strong>Come find out.</strong>
          </p>
          <SmartButton
            text="Learn More"
            alignment="center"
            onClick={() => console.log("Learn more clicked")}
            hoverColor="var(--charcoal-blue)"
          />
        </div>
      </MorphSection>
    );
  }
);

LandingHero.displayName = "LandingHero";
