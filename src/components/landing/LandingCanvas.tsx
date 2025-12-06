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

    // State tracking refs
    const targetFrameRef = useRef<number>(0);
    const currentRenderedFrameRef = useRef<number>(-1);
    const isFrozenRef = useRef<boolean>(false);
    const animationFrameIdRef = useRef<number | null>(null);

    const frameCount = 385;

    const setCanvasSize = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      // Cap pixel ratio at 1 for performance
      const pixelRatio = 1;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(pixelRatio, pixelRatio);
    };

    const render = () => {
      // Double check freeze state before expensive draw
      if (isFrozenRef.current) return;

      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      const img = images[videoFramesRef.current.displayFrame];

      if (img && img.complete && img.naturalWidth > 0) {
        const imageAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (imageAspect > canvasAspect) {
          drawHeight = canvasHeight;
          drawWidth = drawHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvasWidth;
          drawHeight = drawWidth / imageAspect;
          drawX = 0;
          const verticalPosition = 0.3;
          drawY = (canvasHeight - drawHeight) * verticalPosition;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    };

    // Tick loop - Handles the actual rendering cadence
    const tick = useCallback(() => {
      if (isFrozenRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      // OPTIMIZATION: Only render if the target frame has changed
      if (targetFrameRef.current !== currentRenderedFrameRef.current) {
        const targetFrame = targetFrameRef.current;

        // Logic to handle progressive loading
        if (isFrameLoaded(targetFrame)) {
          videoFramesRef.current.displayFrame = targetFrame;
        } else {
          videoFramesRef.current.displayFrame = getNearestLoadedFrame(targetFrame);
        }

        render();
        currentRenderedFrameRef.current = targetFrame;
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    }, [isFrameLoaded, getNearestLoadedFrame]);

    // Exposed methods
    const setFrame = (frame: number) => {
      targetFrameRef.current = Math.max(0, Math.min(frame, frameCount - 1));
    };

    // FIXED: Added checks to prevent redundant operations
    const freeze = useCallback(() => {
      if (isFrozenRef.current) return; // Already frozen, do nothing

      isFrozenRef.current = true;
      if (canvasRef.current) {
        canvasRef.current.style.willChange = 'auto';
      }
    }, []);

    const unfreeze = useCallback(() => {
      if (!isFrozenRef.current) return; // Already unfrozen, do nothing

      isFrozenRef.current = false;
      // Force a re-render on the next tick
      currentRenderedFrameRef.current = -1;
      if (canvasRef.current) {
        canvasRef.current.style.willChange = 'transform';
      }
    }, []);

    useImperativeHandle(ref, () => ({
      setFrame,
      freeze,
      unfreeze,
    }));

    useEffect(() => {
      if (imagesLoaded) {
        currentRenderedFrameRef.current = -1;
      }
    }, [imagesLoaded]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true
      });

      if (!context) return;

      contextRef.current = context;
      setCanvasSize();

      tick();

      const handleResize = () => {
        setCanvasSize();
        currentRenderedFrameRef.current = -1;
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    }, [imagesLoaded, tick]);

    return <canvas ref={canvasRef} className={styles.canvas} />;
  }
);

LandingCanvas.displayName = "LandingCanvas";
