import { useState, useRef, useCallback } from 'react';
import { getNearestLoadedFrame } from '../utils/frameUtils';

// Global cache for images to persist across re-renders and page navigation
const imageCache: HTMLImageElement[] = [];
// Track which frames are actually loaded (for interpolation)
const loadedFrames: Set<number> = new Set();
// Track frames that failed to load from mobile and fell back to desktop
const fallbackFrames: Set<number> = new Set();
let globalLoadProgress = 0;
let phase1Complete = false;
let phase2Complete = false;

// Interval for key frames (load every Nth frame in phase 1)
const KEY_FRAME_INTERVAL = 4;

// Resolution configuration constants
export const MOBILE_BREAKPOINT = 768;

export const RESOLUTION_CONFIG = {
  desktop: {
    width: 1920,
    height: 1080,
    quality: 70,
    path: '/frames'
  },
  mobile: {
    width: 1280,
    height: 720,
    quality: 65,
    path: '/frames/mobile'
  }
} as const;

/**
 * Detects if the current device should use mobile resolution frames.
 * Returns false for SSR (server-side rendering) to default to desktop.
 */
export const detectIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};

/**
 * Gets the frame path for a given index based on the resolution tier.
 * This is a pure utility function that can be used independently.
 * 
 * @param index - The frame index (0-based)
 * @param isMobile - Whether to use mobile resolution tier
 * @returns The path to the frame image
 * 
 * Requirements: 1.1, 1.2, 3.4, 3.5
 */
export const getFramePath = (index: number, isMobile: boolean): string => {
  const frameNumber = (index + 1).toString().padStart(4, '0');
  const basePath = isMobile ? RESOLUTION_CONFIG.mobile.path : RESOLUTION_CONFIG.desktop.path;
  return `${basePath}/frame_${frameNumber}.webp`;
};

export const useImagePreloader = (frameCount: number) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const loadingRef = useRef(false);
  const phase2StartedRef = useRef(false);
  
  // Lock isMobile value at initialization - won't change on resize
  const isMobileRef = useRef<boolean | null>(null);
  if (isMobileRef.current === null) {
    isMobileRef.current = detectIsMobile();
  }
  const isMobile = isMobileRef.current;

  /**
   * Gets the frame path for a given index, using the locked isMobile state.
   * Maintains backward compatibility by wrapping the exported getFramePath utility.
   * 
   * Requirements: 1.1, 1.2
   */
  const currentFrame = useCallback((index: number): string => {
    return getFramePath(index, isMobile);
  }, [isMobile]);

  // Get the nearest loaded frame index for interpolation
  // Uses the extracted utility function for testability
  const getNearestLoadedFrameCallback = useCallback((targetIndex: number): number => {
    return getNearestLoadedFrame(targetIndex, loadedFrames, frameCount);
  }, [frameCount]);

  /**
   * Creates an error handler that implements fallback logic for missing mobile frames.
   * On error, if we're on mobile and haven't already tried fallback, retry with desktop path.
   * 
   * Requirements: 1.3, 1.4
   */
  const createFallbackErrorHandler = useCallback((index: number, onSuccess: () => void) => {
    return () => {
      const img = imageCache[index];
      const currentSrc = img.src;
      
      // Check if we're on mobile and the current path is a mobile path (not already fallen back)
      if (isMobile && currentSrc.includes(RESOLUTION_CONFIG.mobile.path) && !fallbackFrames.has(index)) {
        // Log warning about fallback
        console.warn(`[useImagePreloader] Mobile frame ${index + 1} failed to load, falling back to desktop`);
        
        // Mark this frame as using fallback
        fallbackFrames.add(index);
        
        // Retry with desktop path
        const desktopPath = getFramePath(index, false);
        img.onload = onSuccess;
        img.onerror = () => {
          // Even desktop failed, still mark as loaded to not block progress
          console.error(`[useImagePreloader] Frame ${index + 1} failed to load from both mobile and desktop paths`);
          onSuccess();
        };
        img.src = desktopPath;
      } else {
        // Not mobile, already tried fallback, or desktop path failed - just continue
        onSuccess();
      }
    };
  }, [isMobile]);

  // Phase 2: Load remaining frames in background
  const loadRemainingFrames = useCallback(() => {
    if (phase2StartedRef.current || phase2Complete) return;
    phase2StartedRef.current = true;

    // Get indices of frames not yet loaded (non-key frames)
    const remainingIndices: number[] = [];
    for (let i = 0; i < frameCount; i++) {
      if (!loadedFrames.has(i)) {
        remainingIndices.push(i);
      }
    }

    if (remainingIndices.length === 0) {
      phase2Complete = true;
      setAllFramesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalRemaining = remainingIndices.length;

    const onLoad = (index: number) => () => {
      loadedFrames.add(index);
      loadedCount++;
      
      if (loadedCount === totalRemaining) {
        phase2Complete = true;
        setAllFramesLoaded(true);
      }
    };

    // Load remaining frames with slight staggering to not overwhelm the browser
    remainingIndices.forEach((frameIndex, i) => {
      setTimeout(() => {
        if (!imageCache[frameIndex].src) {
          const successHandler = onLoad(frameIndex);
          imageCache[frameIndex].onload = successHandler;
          imageCache[frameIndex].onerror = createFallbackErrorHandler(frameIndex, successHandler);
          imageCache[frameIndex].src = currentFrame(frameIndex);
        }
      }, Math.floor(i / 6) * 50); // Load 6 at a time with 50ms gaps
    });
  }, [frameCount, currentFrame, createFallbackErrorHandler]);

  // Phase 1: Load key frames (every Nth frame)
  const preloadImages = useCallback(() => {
    // If already loaded, just return
    if (phase1Complete) {
      setImagesLoaded(true);
      setProgress(100);
      // Kick off phase 2 if not already started
      loadRemainingFrames();
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    // Initialize cache if empty
    if (imageCache.length === 0) {
      for (let i = 0; i < frameCount; i++) {
        imageCache.push(new Image());
      }
    }

    // Calculate key frame indices (every Nth frame)
    const keyFrameIndices: number[] = [];
    for (let i = 0; i < frameCount; i += KEY_FRAME_INTERVAL) {
      keyFrameIndices.push(i);
    }
    // Always include the last frame
    if (!keyFrameIndices.includes(frameCount - 1)) {
      keyFrameIndices.push(frameCount - 1);
    }

    const totalKeyFrames = keyFrameIndices.length;
    let loadedCount = 0;

    const onKeyFrameLoad = (index: number) => () => {
      loadedFrames.add(index);
      loadedCount++;
      
      // Progress is based on key frames loaded
      const currentProgress = Math.round((loadedCount / totalKeyFrames) * 100);
      globalLoadProgress = currentProgress;
      setProgress(currentProgress);

      if (loadedCount === totalKeyFrames) {
        phase1Complete = true;
        setImagesLoaded(true);
        loadingRef.current = false;
        
        // Start loading remaining frames in background
        loadRemainingFrames();
      }
    };

    // Load only key frames with fallback error handling
    keyFrameIndices.forEach((frameIndex) => {
      if (!imageCache[frameIndex].src) {
        const successHandler = onKeyFrameLoad(frameIndex);
        imageCache[frameIndex].onload = successHandler;
        imageCache[frameIndex].onerror = createFallbackErrorHandler(frameIndex, successHandler);
        imageCache[frameIndex].src = currentFrame(frameIndex);
      } else if (imageCache[frameIndex].complete) {
        onKeyFrameLoad(frameIndex)();
      } else {
        const successHandler = onKeyFrameLoad(frameIndex);
        imageCache[frameIndex].onload = successHandler;
        imageCache[frameIndex].onerror = createFallbackErrorHandler(frameIndex, successHandler);
      }
    });
  }, [frameCount, loadRemainingFrames, currentFrame, createFallbackErrorHandler]);

  return { 
    imagesLoaded, 
    progress, 
    preloadImages, 
    images: imageCache,
    allFramesLoaded,
    getNearestLoadedFrame: getNearestLoadedFrameCallback,
    isFrameLoaded: (index: number) => loadedFrames.has(index),
    isMobile
  };
};
