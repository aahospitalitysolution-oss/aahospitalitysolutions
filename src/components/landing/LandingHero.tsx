"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Landing.module.css";
import { LandingCanvas, LandingCanvasHandle } from "./LandingCanvas";
import SmartButton from "../SmartButton";
import { MorphSection } from "../MorphSection";
import { HeroImageContainer } from "./HeroImageContainer";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const router = useRouter();
    const [textHeight, setTextHeight] = useState(0);
    const sloganRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonWrapperRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

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

    return (
      <MorphSection
        ref={ref}
        variant={variant}
        className={styles.hero}
        backgroundColor="transparent"
        textColor="var(--parchment)"
        height="100svh"
      >
        <div className="reveal container-reveal-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <HeroImageContainer
            containerRef={heroContainerRef}
            textHeight={textHeight}
          >
            <LandingCanvas ref={canvasRef} onImagesLoaded={onImagesLoaded} />
          </HeroImageContainer>
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.heroDiv} ref={headerRef}>
            <p ref={sloganRef} className={`${styles.slogan} reveal`}>
              {t.landingHero.slogan}
            </p>
            <h1 ref={headingRef} className={`${styles.heroHeading} reveal`}>
              {t.landingHero.heading}
            </h1>
            <div ref={buttonWrapperRef} data-partner-button>
              <div className="reveal">
                <SmartButton
                  text={t.landingHero.partnerButton}
                  alignment="center"
                  onClick={() => router.push("/#contact")}
                  hoverColor="var(--rosy-taupe)"
                  backgroundColor="var(--charcoal-blue)"
                  theme="dark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clarity Section (Upper Center) */}

        <div
          ref={aadityaRef}
          className={`${styles.quadrantText} ${styles.quadrantTextLowerCenter}`}
        >
          <p>
            {t.landingHero.quadrant1}
          </p>
        </div>

        {/* Elevation Section (Lower Center) */}
        <div
          ref={aaryahiRef}
          className={`${styles.quadrantText} ${styles.quadrantTextLowerCenter}`}
        >
          <p>
            {t.landingHero.quadrant2}
          </p>
        </div>

        {/* Together Section (Center) */}
        <div
          ref={togetherRef}
          className={`${styles.quadrantText} ${styles.quadrantTextCenter}`}
        >
          <p>
            {t.landingHero.quadrant3}
          </p>
        </div>

        <div
          ref={textBlock4Ref}
          className={`${styles.quadrantText} ${styles.quadrantTextCenter}`}
        >
          <p>
            {t.landingHero.quadrant4}
            <br />
            <br />
            <strong>{t.landingHero.quadrant4Bold}</strong>
          </p>
          <SmartButton
            text={t.landingHero.learnMoreButton}
            alignment="center"
            onClick={() => router.push("/#our-story")}
            hoverColor="var(--charcoal-blue)"
          />
        </div>
      </MorphSection>
    );
  }
);

LandingHero.displayName = "LandingHero";
