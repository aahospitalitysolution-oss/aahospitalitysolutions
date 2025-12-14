"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react";
import { useLoaderAnimation } from "@/hooks/useLoaderAnimation";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import {
  hasSeenLoader,
  markLoaderSeen,
  markLoaderJustPlayed,
  resetBoxesInLogo,
} from "@/utils/animationStorage";
import { usePathname } from "next/navigation";

interface AnimationContextType {
  loaderComplete: boolean;
  shouldPlayLoader: boolean;
  heroPinned: boolean;
  setHeroPinned: (value: boolean) => void;
  isPageReady: boolean;
  pendingHash: string | null;
  setPendingHash: (hash: string | null) => void;
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
  const pathname = usePathname();
  const [loaderComplete, setLoaderComplete] = useState(false);
  // Default to true to avoid hydration mismatch, we correct it immediately on mount
  const [shouldPlayLoader, setShouldPlayLoader] = useState(true);
  // Track when hero section is pinned (GSAP ScrollTrigger setup complete)
  const [heroPinned, setHeroPinned] = useState(false);

  // Pending hash for cross-page navigation
  // Uses sessionStorage to persist across page navigations (React state is lost on navigation)
  const [pendingHash, setPendingHashState] = useState<string | null>(() => {
    // Initialize from sessionStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("pendingHash");
    }
    return null;
  });

  // Wrapper that syncs to sessionStorage
  const setPendingHash = (hash: string | null) => {
    if (typeof window !== "undefined") {
      if (hash) {
        sessionStorage.setItem("pendingHash", hash);
      } else {
        sessionStorage.removeItem("pendingHash");
      }
    }
    setPendingHashState(hash);
  };

  // Use our image preloader with progressive loading
  const {
    progress,
    imagesLoaded,
    preloadImages,
    images,
    allFramesLoaded,
    getNearestLoadedFrame,
    isFrameLoaded,
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
    // Only scroll to top if there is no hash AND no pending hash
    // This allows deep linking and cross-page hash navigation to work correctly
    if (!window.location.hash && !pendingHash) {
      window.scrollTo(0, 0);
    }

    // Disable browser's automatic scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Handle back/forward navigation
    const handlePopState = () => {
      // Only scroll to top if no hash present
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Restore default scroll restoration behavior on cleanup
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, [pathname, pendingHash]);

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
      value={useMemo(() => {
        // Derive isPageReady: all conditions must be met for safe hash scrolling
        // If loader is skipped, we still need heroPinned (layout ready)
        const isPageReady = shouldPlayLoader
          ? imagesLoaded && loaderComplete && heroPinned
          : imagesLoaded && heroPinned;

        return {
          loaderComplete,
          shouldPlayLoader,
          heroPinned,
          setHeroPinned,
          isPageReady,
          pendingHash,
          setPendingHash,
          boxRef,
          blueRef,
          stageRef,
          images,
          imagesLoaded,
          allFramesLoaded,
          getNearestLoadedFrame,
          isFrameLoaded,
        };
      }, [
        loaderComplete,
        shouldPlayLoader,
        heroPinned,
        pendingHash,
        images,
        imagesLoaded,
        allFramesLoaded,
        getNearestLoadedFrame,
        isFrameLoaded,
      ])}
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
          className="absolute z-0 h-12 w-48 opacity-0 hidden md:block"
        >
          <svg
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 199.72 32.63"
            className="w-full h-full"
          >
            <g style={{ isolation: "isolate" }}>
              <g style={{ isolation: "isolate" }}>
                <g style={{ isolation: "isolate" }}>
                  <g style={{ isolation: "isolate" }}>
                    <g style={{ isolation: "isolate" }}>
                      <g style={{ isolation: "isolate" }}>
                        <g style={{ isolation: "isolate" }}>
                          <path
                            d="M6.13,17.5l-2.68,7.51H0L8.77,1.12h4.02l8.81,23.89h-3.56l-2.76-7.51H6.13ZM14.59,15.09l-2.53-6.88c-.57-1.56-.96-2.98-1.34-4.36h-.08c-.38,1.42-.8,2.87-1.3,4.32l-2.53,6.91h7.77Z"
                            style={{ fill: "var(--logo-text-blue, #2b556d)" }}
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
            <g style={{ isolation: "isolate" }}>
              <g style={{ isolation: "isolate" }}>
                <g style={{ isolation: "isolate" }}>
                  <g style={{ isolation: "isolate" }}>
                    <g style={{ isolation: "isolate" }}>
                      <g style={{ isolation: "isolate" }}>
                        <g style={{ isolation: "isolate" }}>
                          <path
                            d="M36.14,17.5l-2.68,7.51h-3.45L38.78,1.12h4.02l8.81,23.89h-3.56l-2.76-7.51h-9.15ZM44.6,15.09l-2.53-6.88c-.57-1.56-.96-2.98-1.34-4.36h-.08c-.38,1.42-.8,2.87-1.3,4.32l-2.53,6.91h7.77Z"
                            style={{ fill: "var(--logo-text-blue, #2b556d)" }}
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
            <g style={{ isolation: "isolate" }}>
              <g style={{ isolation: "isolate" }}>
                <g style={{ isolation: "isolate" }}>
                  <path
                    d="M65.01,1.26v9.88h10.15V1.26h2.74v23.62h-2.74v-11.08h-10.15v11.08h-2.71V1.26h2.71Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M96.17,16.26c0,6.27-3.87,9.01-7.51,9.01-4.08,0-7.23-3.37-7.23-8.73,0-5.68,3.3-9.01,7.48-9.01s7.25,3.54,7.25,8.73h.01ZM84.2,16.43c0,3.72,1.9,6.52,4.58,6.52s4.58-2.77,4.58-6.59c0-2.87-1.28-6.52-4.52-6.52s-4.64,3.36-4.64,6.59h.01Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M99.26,21.73c.81.6,2.24,1.23,3.61,1.23,1.99,0,2.93-1.12,2.93-2.52,0-1.47-.78-2.28-2.8-3.12-2.71-1.09-3.99-2.77-3.99-4.8,0-2.73,1.97-4.98,5.2-4.98,1.52,0,2.87.49,3.71,1.05l-.69,2.24c-.59-.42-1.68-.98-3.09-.98-1.62,0-2.52,1.05-2.52,2.31,0,1.4.9,2.03,2.87,2.87,2.62,1.12,3.96,2.59,3.96,5.12,0,2.98-2.06,5.08-5.64,5.08-1.66,0-3.18-.46-4.23-1.16l.69-2.35h0Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M111.97,13.46c0-2.17-.07-3.93-.12-5.54h2.46l.12,2.91h.07c1.12-2.07,2.9-3.29,5.36-3.29,3.64,0,6.39,3.47,6.39,8.62,0,6.1-3.3,9.11-6.86,9.11-1.99,0-3.74-.98-4.64-2.66h-.07v9.22h-2.71V13.46h.01ZM114.68,17.98c0,.46.07.88.12,1.26.5,2.14,2.14,3.61,4.11,3.61,2.9,0,4.58-2.66,4.58-6.55,0-3.4-1.59-6.31-4.49-6.31-1.87,0-3.61,1.51-4.14,3.82-.09.39-.19.84-.19,1.26v2.91h.01Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M132.74,3.15c.03,1.05-.66,1.89-1.74,1.89-.97,0-1.66-.84-1.66-1.89s.71-1.93,1.71-1.93,1.68.84,1.68,1.93h.01ZM129.69,24.88V7.92h2.74v16.96h-2.74Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M140.27,3.05v4.87h3.92v2.35h-3.92v9.15c0,2.1.53,3.29,2.06,3.29.72,0,1.24-.11,1.59-.21l.12,2.31c-.53.25-1.37.42-2.43.42-1.28,0-2.31-.46-2.97-1.3-.78-.91-1.06-2.42-1.06-4.42v-9.25h-2.33v-2.35h2.33V3.84l2.68-.81v.02Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M155.64,24.88l-.22-2.14h-.09c-.84,1.33-2.47,2.52-4.61,2.52-3.06,0-4.61-2.42-4.61-4.87,0-4.1,3.24-6.34,9.07-6.31v-.35c0-1.4-.34-3.93-3.42-3.93-1.4,0-2.87.49-3.92,1.26l-.62-2.03c1.24-.91,3.06-1.51,4.96-1.51,4.61,0,5.73,3.54,5.73,6.94v6.34c0,1.47.07,2.91.24,4.07h-2.5ZM155.23,16.22c-2.99-.07-6.39.53-6.39,3.82,0,2,1.19,2.94,2.59,2.94,1.97,0,3.21-1.4,3.64-2.84.09-.32.16-.67.16-.98v-2.94Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M162.31,0h2.74v24.89h-2.74V0Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M172.7,3.15c.03,1.05-.66,1.89-1.74,1.89-.97,0-1.66-.84-1.66-1.89s.71-1.93,1.71-1.93,1.68.84,1.68,1.93h.01ZM169.66,24.88V7.92h2.74v16.96h-2.74Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M180.25,3.05v4.87h3.92v2.35h-3.92v9.15c0,2.1.53,3.29,2.06,3.29.72,0,1.24-.11,1.59-.21l.12,2.31c-.53.25-1.37.42-2.43.42-1.28,0-2.31-.46-2.97-1.3-.78-.91-1.06-2.42-1.06-4.42v-9.25h-2.33v-2.35h2.33V3.84l2.68-.81v.02Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                  <path
                    d="M188.54,7.92l3.3,10.02c.34,1.12.71,2.45.97,3.47h.07c.28-1.02.59-2.31.97-3.54l2.99-9.95h2.9l-4.11,12.09c-1.97,5.82-3.3,8.8-5.18,10.62-1.34,1.33-2.68,1.86-3.37,2l-.69-2.59c.69-.25,1.59-.74,2.4-1.51.74-.67,1.68-1.86,2.31-3.44.12-.32.22-.56.22-.74s-.07-.42-.19-.81l-5.58-15.63h2.99Z"
                    style={{ fill: "var(--logo-text-grey, #8e9aae)" }}
                  />
                </g>
              </g>
            </g>
            <g style={{ isolation: "isolate" }}>
              <g style={{ isolation: "isolate" }}>
                <g style={{ isolation: "isolate" }}>
                  <g style={{ isolation: "isolate" }}>
                    <g style={{ isolation: "isolate" }}>
                      <path
                        d="M20.6,16.13c0-2.14,1.03-4.03,2.52-4.59.21-.1.29-.15.29-.26s-.06-.15-.23-.28c-.89-.54-1.36-1.58-1.36-2.88,0-2.3,1.48-3.93,3.53-3.93,1.49,0,2.87,1.25,2.87,2.63,0,.41-.17.69-.45.69-.23,0-.39-.13-.56-.46-.45-.84-1.01-1.23-1.73-1.23-1.15,0-1.98,1.05-1.98,2.58,0,1.35.82,2.4,1.81,2.4.33,0,.49.23.49.82,0,.54-.17.82-.5.82-1.77,0-3.01,1.51-3.01,3.73,0,2.4,1.49,4.01,3.69,4.01s3.59-1.53,3.59-3.45c0-1.2-.78-2.12-1.53-2.12-.35,0-.72.56-.8,1.28-.06.61-.19.89-.47.89-.35,0-.56-.51-.56-1.15,0-1.22.56-2.07,2.43-3.5,1.75-1.28,2.31-2.02,2.31-2.83,0-.51-.25-.92-.6-.92-.37,0-.66.33-.74.84-.1.49-.23.74-.52.74s-.47-.36-.47-.89c0-1.23.83-2.17,1.96-2.17s1.98,1,1.98,2.48c0,1.28-.8,2.55-2.78,3.93-.37.26-.45.33-.45.43,0,.15,1.67.46,1.67,3.11s-2.17,4.95-5.12,4.95-5.28-2.37-5.28-5.67Z"
                        style={{ fill: "var(--logo-text-blue, #2b556d)" }}
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div ref={boxRef} className="absolute z-10 h-12 w-12 opacity-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="0 0 48 48"
            className="w-full h-full"
          >
            <defs>
              <style>
                {`.st0-sq { fill: none; }
                .st1-sq { fill: var(--logo-square, #28536b); }`}
              </style>
            </defs>
            <line
              className="st0-sq"
              x1="15.67"
              y1="1.25"
              x2="15.65"
              y2="1.28"
            />
            <path
              className="st1-sq"
              d="M34.59,45.13c-4.06-.12-8.99.16-11.74-2.76-1.8,1.38-6.65,3.24-11.59,2.69.42-1.13.85-2.26,1.27-3.39,2.78.33,5.6.47,8.27-1.86-2.43-4.44-2.78-10.94-.29-14.82,2.49,8.23.72,18.03,12.9,16.68.49,1.36,1.01,2.52,1.18,3.47Z"
            />
            <path
              className="st1-sq"
              d="M46.81,45.04L32,1.43h-2.86l-6.75,20.6c.87,2.58,1.5,4.65,1.92,6.11.11.38.49,1.53,1.24,3.85.64,1.95.97,2.94,1.2,2.89.1-.02.16-.22.29-1.47.15-1.46.23-2.18.23-2.86,0-.77-.04-2.06-.35-3.6-.15-.74-.3-1.27-.55-2.11-.31-1.06-.62-1.94-.85-2.55,1.71-5.19,3.42-10.38,5.14-15.57l9.21,27.42-8.4.03-1.28,3.55,10.97-.03,2.39,7.36h3.26Z"
            />
            <polygon
              className="st1-sq"
              points="15.7 1.43 1.19 45.11 4.42 45.11 6.96 37.65 16.53 37.65 15.36 34.23 8.09 34.18 17.15 6.84 21.25 19.89 22.93 14.88 18.45 1.43 15.7 1.43"
            />
            <path className="st1-sq" d="M33.1,46.75" />
          </svg>
        </div>
      </div>

      {/* Loading counter */}
      <div
        className="counter"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        <div ref={counter1Ref} className="counter-1 digit" />
        <div ref={counter2Ref} className="counter-2 digit" />
        <div ref={counter3Ref} className="counter-3 digit" />
      </div>

      <div className="site-content-wrapper">{children}</div>
    </AnimationContext.Provider>
  );
};
