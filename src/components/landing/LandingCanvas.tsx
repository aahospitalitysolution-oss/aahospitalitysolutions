"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import styles from "./Landing.module.css";
import { useAnimationContext } from "@/contexts/AnimationContext";

export interface LandingCanvasHandle {
  setFrame: (frame: number) => void;
  freeze: () => void;
  unfreeze: () => void;
}

interface LandingCanvasProps {
  onImagesLoaded?: () => void;
}

export const LandingCanvas = forwardRef<LandingCanvasHandle, LandingCanvasProps>(
  ({ onImagesLoaded }, ref) => {
    const { images, imagesLoaded, getNearestLoadedFrame, isFrameLoaded } = useAnimationContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const videoFramesRef = useRef({ frame: 0, displayFrame: 0 });
    const shouldRenderRef = useRef(true);
    
    // New refs for decoupled rendering (Task 1.1)
    const targetFrameRef = useRef<number>(0);
    const currentRenderedFrameRef = useRef<number>(-1); // -1 to force first render
    const isFrozenRef = useRef<boolean>(false);
    const animationFrameIdRef = useRef<number | null>(null);

    const frameCount = 385;

    const setCanvasSize = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const pixelRatio = 1;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      
      // Reset transformation matrix before applying scale
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(pixelRatio, pixelRatio);
    };

    const render = () => {
      if (!shouldRenderRef.current) return;
      
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      // Use the display frame (which accounts for progressive loading)
      const img = images[videoFramesRef.current.displayFrame];
      if (img && img.complete && img.naturalWidth > 0) {
        const imageAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, drawX, drawY;

        // "Cover" mode - fill viewport, may crop
        if (imageAspect > canvasAspect) {
          // Image is wider than canvas - fit to height, crop sides
          drawHeight = canvasHeight;
          drawWidth = drawHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2; // Center horizontally
          drawY = 0;
        } else {
          // Image is taller than canvas - fit to width, crop top/bottom
          drawWidth = canvasWidth;
          drawHeight = drawWidth / imageAspect;
          drawX = 0;
          // Adjust vertical position: 0 = top, 0.5 = center, 1 = bottom
          const verticalPosition = 0.3; // Show more of the top (30% from top)
          drawY = (canvasHeight - drawHeight) * verticalPosition;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    };

    // Task 1.2: setFrame only updates targetFrameRef, does NOT call render
    const setFrame = (frame: number) => {
      const clampedFrame = Math.max(0, Math.min(frame, frameCount - 1));
      targetFrameRef.current = clampedFrame;
    };

    // Task 1.3: tick() function as the rAF render loop
    const tick = useCallback(() => {
      // Skip if frozen
      if (isFrozenRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      // Only render if target frame differs from last rendered frame
      if (targetFrameRef.current !== currentRenderedFrameRef.current) {
        const targetFrame = targetFrameRef.current;
        
        // Update videoFramesRef for render() to use
        videoFramesRef.current.frame = targetFrame;
        
        // If the exact frame isn't loaded yet, use the nearest loaded frame
        if (isFrameLoaded(targetFrame)) {
          videoFramesRef.current.displayFrame = targetFrame;
        } else {
          videoFramesRef.current.displayFrame = getNearestLoadedFrame(targetFrame);
        }
        
        // Call render
        render();
        
        // Update currentRenderedFrameRef after successful render
        currentRenderedFrameRef.current = targetFrame;
      }

      // Schedule next frame
      animationFrameIdRef.current = requestAnimationFrame(tick);
    }, [isFrameLoaded, getNearestLoadedFrame]);

    // Task 1.7: Updated freeze/unfreeze methods
    const freeze = () => {
      isFrozenRef.current = true;
      shouldRenderRef.current = false;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.willChange = '';
      }
    };

    const unfreeze = () => {
      isFrozenRef.current = false;
      // Reset currentRenderedFrameRef to -1 to force redraw
      currentRenderedFrameRef.current = -1;
      shouldRenderRef.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.willChange = 'transform';
      }
    };

    useImperativeHandle(ref, () => ({
      setFrame,
      freeze,
      unfreeze,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Task 1.5: Canvas context with performance options
      const context = canvas.getContext("2d", {
        alpha: false,        // Opaque canvas for performance
        desynchronized: true // Reduced latency when supported
      });
      if (!context) return;

      contextRef.current = context;
      setCanvasSize();

      // Task 1.6: Start the tick loop
      tick();

      const handleResize = () => {
        setCanvasSize();
        // Force re-render on resize by resetting currentRenderedFrameRef
        currentRenderedFrameRef.current = -1;
      };

      window.addEventListener("resize", handleResize);

      // Task 1.6: Cleanup - cancel animation frame on unmount
      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
      };
    }, [imagesLoaded, tick]); // Re-run setup when imagesLoaded or tick changes

    return <canvas ref={canvasRef} className={styles.canvas} />;
  }
);

LandingCanvas.displayName = "LandingCanvas";

