"use client";

import { useEffect, useState, RefObject } from "react";

interface AdaptiveColorOptions {
  threshold?: number; // Luminance threshold (0-255), default 128
  lightColor?: string; // Color to return on dark backgrounds
  darkColor?: string; // Color to return on light backgrounds
}

export function useAdaptiveColor(
  ref: RefObject<HTMLElement | null>,
  options: AdaptiveColorOptions = {}
) {
  const {
    threshold = 128,
    lightColor = "white",
    darkColor = "black",
  } = options;

  const [color, setColor] = useState<string>(darkColor);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const checkContrast = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // On mobile, sometimes the header height pushes the logo off "scannable" areas.
      // We clamp the Y check to ensure it's within the viewport.
      const sampleY = Math.max(10, Math.min(window.innerHeight - 10, y));

      const elements = document.elementsFromPoint(x, sampleY);

      for (const el of elements) {
        if (el === element || element.contains(el)) continue;

        const style = window.getComputedStyle(el);

        // Skip transparent elements or pointer-events-none elements (often overlays)
        if (style.pointerEvents === 'none' && style.backgroundColor.includes('rgba(0, 0, 0, 0)')) continue;

        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);

        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

          // Increased alpha threshold for mobile reliability
          if (a > 0.5) {
            // Calculate luminance
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            setColor(luminance < threshold ? lightColor : darkColor);
            return;
          }
        }
      }
      setColor(darkColor);
    };

    // Throttled scroll handler
    let ticking = false;
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkContrast();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    // Initial check with a small delay to ensure page is rendered
    // This helps avoid incorrect color detection during page transitions
    const initialCheckTimeout = setTimeout(() => {
      checkContrast();
    }, 100);

    // Recheck after animations typically complete (e.g., after loader)
    const postAnimationCheckTimeout = setTimeout(() => {
      checkContrast();
    }, 1500);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      clearTimeout(initialCheckTimeout);
      clearTimeout(postAnimationCheckTimeout);
    };
  }, [ref, threshold, lightColor, darkColor]);

  return color;
}


