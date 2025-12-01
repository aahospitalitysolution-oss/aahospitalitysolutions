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

      // Get position of the element center
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Sample elements at this point
      const elements = document.elementsFromPoint(x, y);
      
      let bgColor = "";
      
      // Traverse up the stack to find the first opaque background
      for (const el of elements) {
        // Skip the element itself and its children if sampled
        if (el === element || element.contains(el)) continue;

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;

        // Parse rgba/rgb
        // Usually returns "rgba(0, 0, 0, 0)" for transparent
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

          // If significantly opaque, use this color
          // Simple heuristic: if alpha > 0.1, we consider it contributing to background
          if (a > 0.1) {
            bgColor = bg;
            // Calculate luminance
            // Formula: 0.299*R + 0.587*G + 0.114*B
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            setColor(luminance < threshold ? lightColor : darkColor);
            return; // Found our background, stop searching
          }
        }
      }

      // If no background found (or all transparent), default to darkColor (assuming white page bg)
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


