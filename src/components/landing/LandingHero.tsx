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
  heroContainerRef: React.RefObject<HTMLDivElement | null>;
  onImagesLoaded?: () => void;
  variant?: "top" | "bottom" | "both";
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
      heroContainerRef,
      onImagesLoaded,
      variant = "bottom",
    },
    ref
  ) => {
    const [textHeight, setTextHeight] = useState(0);
    const sloganRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonWrapperRef = useRef<HTMLDivElement>(null);
    const navButtonsRef = useRef<HTMLDivElement>(null);

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

    // Note: Text color animation and button fading previously driven by resizeProgress
    // are now handled via CSS variables set by GSAP in Landing.tsx

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
          containerRef={heroContainerRef}
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
            <div ref={buttonWrapperRef} data-partner-button>
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

          {/* Reach Out button that appears when canvas scrolls in */}
          <div
            ref={navButtonsRef}
            data-reach-out-button
            style={{
              position: "fixed",
              top: 0,
              right: "calc(var(--space-6) + 80px + var(--space-4))", // Position to the left of hamburger menu (80px width + gap)
              height: "var(--space-20)", // Match nav height
              display: "flex",
              alignItems: "center",
              zIndex: 100,
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <SmartButton
              text="Reach Out"
              alignment="center"
              onClick={() => console.log("Reach Out clicked")}
              hoverColor="var(--charcoal-blue)"
              backgroundColor="var(--parchment)"
              theme="light"
              size="small"
            />
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
