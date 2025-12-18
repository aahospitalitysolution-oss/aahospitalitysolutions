/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { getLenisConfig, getScrollTriggerConfig } from "@/utils/scrollConfig";
import { isMobileDevice, isIOSDevice } from "@/utils/deviceUtils";
import { usePathname } from "next/navigation";
import { useAnimationContext } from "./AnimationContext";

// Define the context shape
interface ScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: any) => void;
  isSmoothResponse: boolean; // True if Lenis is active
  pendingHash: string | null;
  setPendingHash: (hash: string | null) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within ScrollProvider");
  }
  return context;
};

interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider = ({ children }: ScrollProviderProps) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // Get pendingHash and isPageReady from AnimationContext (parent provider)
  const { isPageReady, pendingHash, setPendingHash } = useAnimationContext();

  // Initialize Lenis and ScrollTrigger
  useLayoutEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const isMobile = isMobileDevice();
    const isIOS = isIOSDevice();
    const lenisConfig = getLenisConfig(isMobile);
    const scrollTriggerConfig = getScrollTriggerConfig(isMobile);

    // Apply global ScrollTrigger config
    if (scrollTriggerConfig.ignoreMobileResize) {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // Initialize Lenis only if NOT on iOS (as per original logic)
    // or if you want to force it everywhere, remove the !isIOS check.
    // The original logic was: "Skip Lenis on iOS - native iOS scroll is already smooth"
    if (!isIOS) {
      const lenisInstance = new Lenis({
        ...(lenisConfig as any),
        // Ensure we don't prevent touch on non-smooth touch devices
        smoothTouch: lenisConfig.smoothTouch,
      });

      lenisRef.current = lenisInstance;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLenis(lenisInstance);

      // Sync Lenis with GSAP ScrollTrigger
      lenisInstance.on("scroll", ScrollTrigger.update);

      // Add to GSAP ticker
      const updateTicker = (time: number) => {
        lenisInstance.raf(time * 1000);
      };
      gsap.ticker.add(updateTicker);

      // Cleanup
      return () => {
        gsap.ticker.remove(updateTicker);
        lenisInstance.destroy();
        lenisRef.current = null;
        setLenis(null);
      };
    } else {
      // If we are on iOS/Native, we still want ScrollTrigger to work
      // No special setup needed for Native scroll other than default ScrollTrigger behavior
    }
  }, []);

  /**
   * Unified ScrollTo Function
   * Handles both Lenis and Native scrolling
   */
  const scrollTo = (
    target: string | HTMLElement | number,
    options: any = {}
  ) => {
    const defaultOptions = {
      offset: 0,
      immediate: false,
      duration: 1.5,
      ...options,
    };

    let elementOffset = 0;
    let targetEl: HTMLElement | null = null;

    // Determine target element and read data-scroll-offset if applicable
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    }

    if (targetEl) {
      const elementOffsetStr = targetEl.getAttribute("data-scroll-offset");
      if (elementOffsetStr) {
        elementOffset = parseInt(elementOffsetStr, 10);
      }
    }

    const finalOptions = {
      ...defaultOptions,
      offset: (defaultOptions.offset || 0) + elementOffset,
    };

    // If Lenis is active, use it
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, finalOptions);
    } else {
      // Native Fallback
      let targetPos = 0;

      if (typeof target === "number") {
        targetPos = target;
      } else if (typeof target === "string") {
        targetEl = document.querySelector(target);
      } else if (target instanceof HTMLElement) {
        targetEl = target;
      }

      if (targetEl) {
        // Check for data-scroll-offset
        const elementOffsetStr = targetEl.getAttribute("data-scroll-offset");
        const elementOffset = elementOffsetStr
          ? parseInt(elementOffsetStr, 10)
          : 0;
        const finalOffset = defaultOptions.offset + elementOffset;

        // We need to account for GSAP Pinning Spacers manually if we aren't using Lenis
        // But often window.scrollTo is enough if we trust the browser.
        // For pinned sections, standard scrollIntoView can be tricky.
        // Let's try a smooth window scroll first.
        const rect = targetEl.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top + finalOffset;

        window.scrollTo({
          top: absoluteTop,
          behavior: defaultOptions.immediate ? "auto" : "smooth",
        });
      } else if (typeof target === "number") {
        window.scrollTo({
          top: target,
          behavior: defaultOptions.immediate ? "auto" : "smooth",
        });
      }
    }
  };

  /**
   * Global Anchor Click Interceptor
   * Delegates all clicks on links starting with "#" to our unified scrollTo
   */
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Check if it's a local hash link (e.g. "#contact" or "/#contact")
      // We want to handle:
      // 1. href="#contact"
      // 2. href="/#contact" (if we are already on "/")
      // 3. href="current-page#contact"

      const isLocalHash = href.startsWith("#");
      const isRootHash = href.startsWith("/#") && pathname === "/";

      if (isLocalHash || isRootHash) {
        const hash = isLocalHash ? href : href.substring(1); // remove leading /
        const targetId = hash; // e.g. "#contact"

        e.preventDefault();

        // Push state manually to update URL without jumping
        window.history.pushState(null, "", hash);

        scrollTo(targetId);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname, lenis]);

  /**
   * Reactive Hash Scroll - Triggered when page becomes ready
   * This replaces the old setTimeout-based approach
   */
  // Track the last hash we scrolled to, to prevent double-execution
  const lastScrolledHashRef = useRef<string | null>(null);

  useEffect(() => {
    // Only proceed if we're on the home page
    if (pathname !== "/") {
      // Reset last scrolled hash when leaving home page
      lastScrolledHashRef.current = null;
      return;
    }

    // Check for pending hash OR hash in URL
    const hashToScroll = pendingHash || window.location.hash;

    // Skip if we already scrolled to this hash (prevents double-execution)
    // Only allow re-scroll if pendingHash is explicitly set (user clicked again)
    if (
      !pendingHash &&
      hashToScroll &&
      hashToScroll === lastScrolledHashRef.current
    ) {
      return;
    }

    if (hashToScroll && isPageReady) {
      // Mark this hash as being scrolled to (before timeout to prevent race)
      lastScrolledHashRef.current = hashToScroll;

      // Delay scroll to ensure ScrollTrigger pin spacing is fully calculated
      setTimeout(() => {
        const target = document.querySelector(
          hashToScroll
        ) as HTMLElement | null;

        if (target) {
          // Use offsetTop which includes the pin spacer height in the document flow
          // This gives us the TRUE scroll position needed, not the visual position
          const elementOffsetStr = target.getAttribute("data-scroll-offset");
          const elementOffset = elementOffsetStr
            ? parseInt(elementOffsetStr, 10)
            : 0;

          // offsetTop gives position relative to offsetParent, we need absolute position
          let absoluteTop = 0;
          let el: HTMLElement | null = target;
          while (el) {
            absoluteTop += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }

          const finalScrollPosition = absoluteTop + elementOffset;

          // BYPASS LENIS - it doesn't properly handle ScrollTrigger pin spacers
          // Stop Lenis temporarily to prevent interference
          if (lenisRef.current) {
            lenisRef.current.stop();
          }

          // Use native scroll
          window.scrollTo({ top: finalScrollPosition, behavior: "auto" });

          // Re-enable Lenis after a short delay
          if (lenisRef.current) {
            setTimeout(() => {
              lenisRef.current?.start();
            }, 50);
          }

          // Update URL hash
          window.history.replaceState(null, "", hashToScroll);
        }

        // Clear pending hash after scroll
        if (pendingHash) {
          setPendingHash(null);
        }
      }, 150);
    }
  }, [isPageReady, pendingHash, pathname]);

  /**
   * Clear pendingHash when navigating away from home page
   * Only triggers when we actually navigate FROM "/" to elsewhere,
   * not when setting pendingHash while already on a non-home page
   */
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Only clear if we were on "/" and navigated away
    if (prevPathname === "/" && pathname !== "/" && pendingHash) {
      setPendingHash(null);
    }
  }, [pathname, pendingHash]);

  return (
    <ScrollContext.Provider
      value={{
        lenis,
        scrollTo,
        isSmoothResponse: !!lenis,
        pendingHash,
        setPendingHash,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
