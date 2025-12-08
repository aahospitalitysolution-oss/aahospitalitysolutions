"use client";

import React, { useRef, useEffect, forwardRef } from 'react';
import styles from './MorphSection.module.css';
import { isMobileDevice } from '@/utils/deviceUtils';

interface MorphSectionProps {
  children: React.ReactNode;
  variant?: 'top' | 'bottom' | 'both';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const MorphSection = forwardRef<HTMLElement, MorphSectionProps>(({
  children,
  variant = 'both',
  className = '',
  backgroundColor = 'var(--charcoal-blue)',
  textColor = 'var(--parchment)',
  height = '100svh',
  style = {},
  id
}, ref) => {
  const localRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Handle ref merging
    const element = (ref as React.RefObject<HTMLElement>)?.current || localRef.current;
    if (!element) return;

    // Mobile optimization: skip morph animation entirely on mobile
    // The curved edges are a subtle enhancement that's not critical on smaller screens
    const isMobile = isMobileDevice();
    if (isMobile) {
      // Set static border radius on mobile
      if (variant === 'top' || variant === 'both') {
        element.style.borderTopLeftRadius = '0';
        element.style.borderTopRightRadius = '0';
      }
      if (variant === 'bottom' || variant === 'both') {
        element.style.borderBottomLeftRadius = '0';
        element.style.borderBottomRightRadius = '0';
      }
      return; // Skip scroll listener setup for mobile
    }

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

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });
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
      id={id}
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
