import { useEffect, useRef } from "react";
import styles from "./Landing.module.css";
import gsap from "gsap";

export const LandingAadityaText = () => {
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The animation logic is handled by CSS classes defined in Landing.module.css
    // But we might want to trigger it specifically when visible if needed
    // For now, CSS animations starting on mount/class application should work
    // provided the parent container controls visibility
  }, []);

  return (
    <span ref={wrapperRef} className={styles.wordWrapper}>
      <span className={styles.sunCoreGlow}></span>
      <svg className={styles.sunRays} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rayGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: "rgba(255, 215, 0, 0.8)" }} />
            <stop offset="100%" style={{ stopColor: "rgba(255, 140, 0, 0)" }} />
          </radialGradient>
        </defs>
        <g fill="url(#rayGradient)">
          {/* Sun rays geometry */}
          <path d="M100,0 L110,80 L100,100 L90,80 Z" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(45 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(90 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(135 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(180 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(225 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(270 100 100)" />
          <path d="M100,0 L110,80 L100,100 L90,80 Z" transform="rotate(315 100 100)" />
          <circle cx="100" cy="100" r="40" opacity="0.4" />
        </g>
      </svg>
      <span className={styles.aadityaText}>Aaditya</span>
    </span>
  );
};

export const LandingAaryahiText = () => {
  const wrapperRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={wrapperRef} className={styles.wordWrapper}>
      <span className={styles.prismCoreGlow}></span>
      <svg className={styles.crystalPrism} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#00ffff" }} />
            <stop offset="50%" style={{ stopColor: "#ffffff" }} />
            <stop offset="100%" style={{ stopColor: "#00bfff" }} />
          </linearGradient>
        </defs>
        <g stroke="url(#crystalGradient)" strokeWidth="1.5" fill="none" opacity="0.8">
          {/* Outer Hexagon */}
          <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" />
          {/* Inner Star/Facet Connections */}
          <line x1="30" y1="60" x2="170" y2="140" opacity="0.5" />
          <line x1="170" y1="60" x2="30" y2="140" opacity="0.5" />
          <line x1="100" y1="20" x2="100" y2="180" opacity="0.5" />
          {/* Inner Diamond */}
          <polygon points="100,60 135,100 100,140 65,100" strokeWidth="2" stroke="white" opacity="0.9" />
          {/* Sparkle Dots at Vertices */}
          <circle cx="100" cy="20" r="2" fill="white" />
          <circle cx="170" cy="60" r="2" fill="white" />
          <circle cx="170" cy="140" r="2" fill="white" />
          <circle cx="100" cy="180" r="2" fill="white" />
          <circle cx="30" cy="140" r="2" fill="white" />
          <circle cx="30" cy="60" r="2" fill="white" />
        </g>
      </svg>
      <span className={styles.aaryahiText}>Aaryahi</span>
    </span>
  );
};

