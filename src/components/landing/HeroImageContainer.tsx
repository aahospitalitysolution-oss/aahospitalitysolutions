"use client";

import { useState, useEffect, CSSProperties } from "react";
import styles from "./HeroImageContainer.module.css";
import { isMobileDevice } from "@/utils/deviceUtils";

interface HeroImageContainerProps {
  children: React.ReactNode;
  className?: string;
  containerRef: React.RefObject<HTMLDivElement | null>; // For parent to attach ref for GSAP manipulation
  textHeight?: number; // Height of the text content for initial offset
}

export const HeroImageContainer = ({
  children,
  className = "",
  containerRef,
  textHeight = 0,
}: HeroImageContainerProps) => {
  // Track if component is mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile for initial positioning
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false;
  const initialTop = isMobile ? 25 : 12;

  // OPTIMIZATION F: Set initial transform values directly
  // GSAP will update scale, y, and top directly (no CSS variable overhead)
  const containerStyle: CSSProperties = {
    width: "100%",
    height: "130vh",
    position: "absolute",
    left: 0,
    zIndex: 0,
    transformOrigin: "center center",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transition: "none",
    overflow: "hidden",
    opacity: mounted ? 1 : 0,
    // Initial transform state - GSAP will override these
    transform: "scale(0.5) translateY(180px)",
    top: `${initialTop}vh`,
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      {children}
      {/* Overlay with data attribute for GSAP targeting */}
      <div className={styles.overlay} data-hero-overlay />
    </div>
  );
};
