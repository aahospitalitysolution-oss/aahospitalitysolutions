"use client";

import React, { useRef, useEffect, forwardRef } from 'react';
import styles from './MorphSection.module.css';

interface MorphSectionProps {
  children: React.ReactNode;
  variant?: 'top' | 'bottom' | 'both';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const MorphSection = forwardRef<HTMLElement, MorphSectionProps>(({
  children,
  variant = 'both',
  className = '',
  backgroundColor = 'var(--charcoal-blue)',
  textColor = 'var(--parchment)',
  height = '100vh',
  style = {}
}, ref) => {
  const localRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Handle ref merging
    const element = (ref as React.RefObject<HTMLElement>)?.current || localRef.current;
    if (!element) return;

    const CONFIG = {
      maxRadiusVw: 15, // The "curvature" intensity (in VW)
    };

    // Easing: EaseInOutCubic
    const easeInOutCubic = (x: number) => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    const updateShape = () => {
      const windowHeight = window.innerHeight;
      const rect = element.getBoundingClientRect();

      // --- TOP LOGIC ---
      if (variant === 'top' || variant === 'both') {
        let rawTop = 0;
        // Only animate if the top edge is visible or transitioning
        if (rect.top < windowHeight) {
          rawTop = 1 - (rect.top / windowHeight);
        }
        const progress = easeInOutCubic(Math.max(0, Math.min(1, rawTop)));
        const radius = progress * CONFIG.maxRadiusVw;
        
        element.style.borderTopLeftRadius = `${radius}vw`;
        element.style.borderTopRightRadius = `${radius}vw`;
      }

      // --- BOTTOM LOGIC ---
      if (variant === 'bottom' || variant === 'both') {
        let rawBottom = 0;
        if (rect.bottom < windowHeight) {
          rawBottom = 1 - (rect.bottom / windowHeight);
        }
        const progress = easeInOutCubic(Math.max(0, Math.min(1, rawBottom)));
        const radius = progress * CONFIG.maxRadiusVw;
        
        element.style.borderBottomLeftRadius = `${radius}vw`;
        element.style.borderBottomRightRadius = `${radius}vw`;
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateShape();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    // Initial calculation
    updateShape();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [variant, ref]);

  return (
    <section
      ref={(node) => {
        // Assign to local ref
        localRef.current = node;
        // Assign to forwarded ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      }}
      className={`${styles.morphSection} ${className}`}
      data-morph={variant}
      style={{
        backgroundColor,
        color: textColor,
        minHeight: height,
        ...style
      }}
    >
      <div className={styles.contentWrapper}>
        {children}
      </div>
    </section>
  );
});

MorphSection.displayName = 'MorphSection';
