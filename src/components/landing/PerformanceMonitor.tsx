"use client";

import { useEffect, useRef } from "react";

interface PerformanceMonitorProps {
  enabled?: boolean;
  onPerformanceIssue?: (fps: number) => void;
}

export const PerformanceMonitor = ({ 
  enabled = process.env.NODE_ENV === "development",
  onPerformanceIssue 
}: PerformanceMonitorProps) => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        fpsRef.current = fps;
        
        // Warn if FPS drops below 45
        if (fps < 45) {
          console.warn(`Performance warning: FPS dropped to ${fps}`);
          onPerformanceIssue?.(fps);
        }
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, onPerformanceIssue]);

  return null; // This is a utility component with no UI
};





