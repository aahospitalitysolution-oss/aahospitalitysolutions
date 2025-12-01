"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import styles from "./Landing.module.css";
import { useAnimationContext } from "@/contexts/AnimationContext";

export interface LandingCanvasHandle {
  setFrame: (frame: number) => void;
}

interface LandingCanvasProps {
  onImagesLoaded?: () => void;
}

export const LandingCanvas = forwardRef<LandingCanvasHandle, LandingCanvasProps>(
  ({ onImagesLoaded }, ref) => {
    const { images, imagesLoaded } = useAnimationContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const videoFramesRef = useRef({ frame: 0 });

    const frameCount = 832;

    const setCanvasSize = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      context.scale(pixelRatio, pixelRatio);
    };

    const render = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Use shared images array
      const img = images[videoFramesRef.current.frame];
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
          drawY = (canvasHeight - drawHeight) / 2;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Overlay to darken by 5%
        context.fillStyle = "rgba(0, 0, 0, 0.10)";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    };

    const setFrame = (frame: number) => {
      videoFramesRef.current.frame = Math.max(0, Math.min(frame, frameCount - 1));
      render();
    };

    useImperativeHandle(ref, () => ({
      setFrame,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      contextRef.current = context;
      setCanvasSize();

      // Initial render if images are ready
      if (imagesLoaded) {
        render();
      }

      const handleResize = () => {
        setCanvasSize();
        render();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [imagesLoaded]); // Re-run setup/render when imagesLoaded changes

    return <canvas ref={canvasRef} className={styles.canvas} />;
  }
);

LandingCanvas.displayName = "LandingCanvas";

