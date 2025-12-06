"use client";

import { useState, useEffect, CSSProperties } from "react";
import styles from "./HeroImageContainer.module.css";

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

  // Base style without transform/opacity calculations
  // Transform and overlay opacity will be controlled via CSS variables set by GSAP
  const containerStyle: CSSProperties = {
    width: "100%",
    height: "130vh", // Tall enough to extend past bottom when scaled
    position: "absolute",
    left: 0,
    zIndex: 0, // Behind text
    transformOrigin: "center center",
    // Performance optimizations
    willChange: "transform",
    // Force GPU acceleration
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    // Smooth transition
    transition: "none", // Controlled by GSAP
    overflow: "hidden",
    opacity: mounted ? 1 : 0, // Hide until mounted to avoid hydration mismatch
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      {children}
      {/* Translucent blue overlay controlled via CSS variable */}
      <div className={styles.overlay} />
    </div>
  );
};
