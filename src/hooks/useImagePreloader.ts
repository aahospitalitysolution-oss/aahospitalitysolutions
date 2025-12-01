import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache for images to persist across re-renders and page navigation
const imageCache: HTMLImageElement[] = [];
let globalLoadProgress = 0;

export const useImagePreloader = (frameCount: number) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const loadingRef = useRef(false);

  const currentFrame = (index: number) =>
    `/frames/frame_${(index + 1).toString().padStart(4, "0")}.jpg`;

  const preloadImages = useCallback(() => {
    if (loadingRef.current || imageCache.length === frameCount) {
      setImagesLoaded(true);
      setProgress(100);
      return;
    }

    loadingRef.current = true;
    let loadedCount = 0;

    // Initialize cache if empty
    if (imageCache.length === 0) {
        for (let i = 0; i < frameCount; i++) {
            imageCache.push(new Image());
        }
    }

    const onLoad = () => {
      loadedCount++;
      const currentProgress = Math.round((loadedCount / frameCount) * 100);
      globalLoadProgress = currentProgress;
      setProgress(currentProgress);

      if (loadedCount === frameCount) {
        setImagesLoaded(true);
        loadingRef.current = false;
      }
    };

    for (let i = 0; i < frameCount; i++) {
      if (!imageCache[i].src) {
          imageCache[i].onload = onLoad;
          imageCache[i].onerror = onLoad; // Continue even if one fails
          imageCache[i].src = currentFrame(i);
      } else if (imageCache[i].complete) {
          onLoad();
      } else {
          // Already started loading but not complete, attach listeners again just in case
           imageCache[i].onload = onLoad;
           imageCache[i].onerror = onLoad;
      }
    }
  }, [frameCount]);

  return { imagesLoaded, progress, preloadImages, images: imageCache };
};








