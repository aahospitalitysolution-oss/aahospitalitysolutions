import { useState, useRef, useCallback } from 'react';

// Global cache for images to persist across re-renders and page navigation
const imageCache: HTMLImageElement[] = [];
// Track which frames are actually loaded (for interpolation)
const loadedFrames: Set<number> = new Set();
let globalLoadProgress = 0;
let phase1Complete = false;
let phase2Complete = false;

// Interval for key frames (load every Nth frame in phase 1)
const KEY_FRAME_INTERVAL = 4;

export const useImagePreloader = (frameCount: number) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allFramesLoaded, setAllFramesLoaded] = useState(false);
  const loadingRef = useRef(false);
  const phase2StartedRef = useRef(false);

  const currentFrame = (index: number) =>
    `/frames/frame_${(index + 1).toString().padStart(4, "0")}.webp`;

  // Get the nearest loaded frame index for interpolation
  const getNearestLoadedFrame = useCallback((targetIndex: number): number => {
    if (loadedFrames.has(targetIndex)) {
      return targetIndex;
    }
    
    // Search outward for nearest loaded frame
    let lower = targetIndex;
    let upper = targetIndex;
    
    while (lower >= 0 || upper < frameCount) {
      if (lower >= 0 && loadedFrames.has(lower)) {
        return lower;
      }
      if (upper < frameCount && loadedFrames.has(upper)) {
        return upper;
      }
      lower--;
      upper++;
    }
    
    // Fallback to first loaded frame
    return loadedFrames.size > 0 ? loadedFrames.values().next().value : 0;
  }, [frameCount]);

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
          imageCache[frameIndex].onload = onLoad(frameIndex);
          imageCache[frameIndex].onerror = onLoad(frameIndex);
          imageCache[frameIndex].src = currentFrame(frameIndex);
        }
      }, Math.floor(i / 6) * 50); // Load 6 at a time with 50ms gaps
    });
  }, [frameCount]);

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

    // Load only key frames
    keyFrameIndices.forEach((frameIndex) => {
      if (!imageCache[frameIndex].src) {
        imageCache[frameIndex].onload = onKeyFrameLoad(frameIndex);
        imageCache[frameIndex].onerror = onKeyFrameLoad(frameIndex);
        imageCache[frameIndex].src = currentFrame(frameIndex);
      } else if (imageCache[frameIndex].complete) {
        onKeyFrameLoad(frameIndex)();
      } else {
        imageCache[frameIndex].onload = onKeyFrameLoad(frameIndex);
        imageCache[frameIndex].onerror = onKeyFrameLoad(frameIndex);
      }
    });
  }, [frameCount, loadRemainingFrames]);

  return { 
    imagesLoaded, 
    progress, 
    preloadImages, 
    images: imageCache,
    allFramesLoaded,
    getNearestLoadedFrame,
    isFrameLoaded: (index: number) => loadedFrames.has(index)
  };
};
