"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useLayoutEffect,
  useEffect,
} from "react";
import { useLoaderAnimation } from "@/hooks/useLoaderAnimation";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { hasSeenLoader, markLoaderSeen, markLoaderJustPlayed, resetBoxesInLogo } from "@/utils/animationStorage";

interface AnimationContextType {
  loaderComplete: boolean;
  shouldPlayLoader: boolean;
  boxRef: React.RefObject<HTMLDivElement | null>;
  blueRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  images: HTMLImageElement[];
  imagesLoaded: boolean;
  allFramesLoaded: boolean;
  getNearestLoadedFrame: (index: number) => number;
  isFrameLoaded: (index: number) => boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
);

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error(
      "useAnimationContext must be used within AnimationProvider"
    );
  }
  return context;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  const [loaderComplete, setLoaderComplete] = useState(false);
  // Default to true to avoid hydration mismatch, we correct it immediately on mount
  const [shouldPlayLoader, setShouldPlayLoader] = useState(true);

  // Use our image preloader with progressive loading
  const { 
    progress, 
    imagesLoaded, 
    preloadImages, 
    images,
    allFramesLoaded,
    getNearestLoadedFrame,
    isFrameLoaded
  } = useImagePreloader(385);
  const [visualProgress, setVisualProgress] = useState(0);
  const progressRef = useRef(0);
  
  // Reset nav box placement flag when the page unloads (reloads or closes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      resetBoxesInLogo();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Sync ref with progress for the animation loop
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Enforce minimum duration
  useEffect(() => {
    if (!shouldPlayLoader) return;

    const startTime = performance.now();
    const MIN_DURATION = 1500; // 1.5 seconds
    let rafId: number;

    const update = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const timeProgress = Math.min(100, (elapsed / MIN_DURATION) * 100);
      
      // We can't go faster than time allows, but we also can't go faster than real loading
      // So visual progress is the minimum of "allowed by time" and "actual loaded"
      // exception: if time is up (100), we are purely bound by real loading. 
      // Actually, Math.min handles that naturally.
      // If real=100, time=50 -> 50. 
      // If real=50, time=100 -> 50.
      
      const currentVisual = Math.min(progressRef.current, timeProgress);
      setVisualProgress(currentVisual);

      if (currentVisual < 100) {
        rafId = requestAnimationFrame(update);
      }
    };

    rafId = requestAnimationFrame(update);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldPlayLoader]); // Only run once when loader starts

  // Scroll to top on mount and on navigation (back/forward)
  useLayoutEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);

    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Handle back/forward navigation
    const handlePopState = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Restore default scroll restoration behavior on cleanup
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Check storage on mount
  useLayoutEffect(() => {
    // Allow loader to play on every reload
    // if (hasSeenLoader()) {
    //   setShouldPlayLoader(false);
    //   // Ensure class is removed if it was there
    //   document.documentElement.classList.remove("is-loading");
    // }
  }, []);

  // Start loading images if loader should play
  useEffect(() => {
    if (shouldPlayLoader) {
      preloadImages();
    }
  }, [shouldPlayLoader, preloadImages]);

  // Remove loading class when done
  useLayoutEffect(() => {
    if (loaderComplete || !shouldPlayLoader) {
      document.documentElement.classList.remove("is-loading");
    }
  }, [loaderComplete, shouldPlayLoader]);

  // Refs for loader elements
  const stageRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const blueRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const counter1Ref = useRef<HTMLDivElement | null>(null);
  const counter2Ref = useRef<HTMLDivElement | null>(null);
  const counter3Ref = useRef<HTMLDivElement | null>(null);

  // Run loader animation
  useLoaderAnimation({
    shouldPlay: shouldPlayLoader,
    onComplete: () => {
      markLoaderSeen();
      // Set a one-shot flag so page transition can skip slide/fade immediately after loader
      markLoaderJustPlayed();
      setLoaderComplete(true);
    },
    stageRef,
    boxRef,
    blueRef,
    heroBgRef,
    counter1Ref,
    counter2Ref,
    counter3Ref,
    progress: visualProgress,
  });

  return (
    <AnimationContext.Provider
      value={{ 
        loaderComplete, 
        shouldPlayLoader, 
        boxRef, 
        blueRef, 
        stageRef, 
        images, 
        imagesLoaded,
        allFramesLoaded,
        getNearestLoadedFrame,
        isFrameLoaded
      }}
    >
      {/* Loader elements - rendered globally */}
      <div ref={heroBgRef} className="hero-bg" aria-hidden="true" />

      {/* Stage with boxes for loader animation */}
      <div
        ref={stageRef}
        className="loader-stage"
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          width: "100%",
          height: "320px",
          transform: "translateY(-50%)",
          zIndex: 35,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div
          ref={blueRef}
          className="absolute z-0 h-12 w-48 opacity-0"
        >
          <img
            src="/logo-text-blue.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        <div
          ref={boxRef}
          className="absolute z-10 h-12 w-12 opacity-0"
        >
          <img
            src="/logo-blue-square.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Loading counter */}
      <div className="counter" aria-live="polite" aria-atomic="true" role="status">
        <div ref={counter1Ref} className="counter-1 digit" />
        <div ref={counter2Ref} className="counter-2 digit" />
        <div ref={counter3Ref} className="counter-3 digit" />
      </div>

      <div className="site-content-wrapper">
        {children}
      </div>
    </AnimationContext.Provider>
  );
};

