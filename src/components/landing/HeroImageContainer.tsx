"use client";

import { useMemo, useState, useEffect, CSSProperties } from "react";
import styles from "./HeroImageContainer.module.css";

interface HeroImageContainerProps {
  children: React.ReactNode;
  className?: string;
  resizeProgress: number; // 0-1, controlled by ScrollTrigger
  isResizePhase?: boolean; // Optional: Reserved for future phase-specific behavior
  textHeight?: number; // Height of the text content for initial offset
}

export const HeroImageContainer = ({
  children,
  className = "",
  resizeProgress,
  isResizePhase = false,
  textHeight = 0,
}: HeroImageContainerProps) => {
  // Track if component is mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate transform based on resize progress
  const containerStyle = useMemo((): CSSProperties => {
    // If not mounted yet, return a default style to avoid hydration mismatch
    if (!mounted) {
      return {
        opacity: 0, // Hide until mounted
      };
    }

    // Reference Logic:
    // Initial: scale 0.5, y = textHeight (starts below text)
    // Final: scale 1.0, y = 0 (covers viewport)

    const scale = 0.5 + 0.5 * resizeProgress;

    // Calculate Y translation
    // At progress 0: translate Y = textHeight (pixels)
    // At progress 1: translate Y = 0
    // We use calc() to combine percentage (if needed) and pixels, but here pixels are sufficient for the offset
    // However, we might want to keep the -20% logic if it was part of the "feel", but the requirement is "meet top edge".
    // "meet top edge" implies y=0 at the end.
    // "start below text" implies y=textHeight at start.

    const currentY = textHeight * (1 - resizeProgress);

    return {
      width: "100%",
      height: "180vh", // Tall enough to extend past bottom when scaled
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 0, // Behind text
      // Apply transform
      transform: `scale(${scale}) translateY(${currentY}px)`,
      transformOrigin: "center center",

      // Performance optimizations
      willChange: "transform",
      // Force GPU acceleration
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      // Smooth transition
      transition: "none", // Controlled by GSAP
      overflow: "hidden",
      opacity: 1, // Visible when mounted
    };
  }, [mounted, resizeProgress, textHeight]);

  // Calculate overlay opacity based on resize progress
  // Overlay appears gradually as canvas resizes (0 to 1) during resize phase
  // Then stays visible during timeline phase (when frames play)
  // Using a max opacity of 0.4 for translucency (40% opacity)
  const overlayOpacity = useMemo(() => {
    // During resize phase, gradually increase opacity
    // After resize phase (when frames play), keep overlay at full opacity
    if (isResizePhase) {
      return resizeProgress * 0.4;
    }
    // Timeline phase: keep overlay visible at full opacity
    return 0.4;
  }, [resizeProgress, isResizePhase]);

  return (
    <div
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      {children}
      {/* Translucent blue overlay that appears during resize phase */}
      <div
        className={styles.overlay}
        style={{
          opacity: overlayOpacity,
        }}
      />
    </div>
  );
};
