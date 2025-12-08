import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styles from "./PaperPlaneCanvas.module.css";
import { isMobileDevice } from "@/utils/deviceUtils";

interface PaperPlaneCanvasProps {
  active: boolean;
}

// Pre-defined plane pool size based on device
const getMaxPlanes = () => (isMobileDevice() ? 1 : 3);

export const PaperPlaneCanvas = ({ active }: PaperPlaneCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activePlanesRef = useRef(0);
  const maxPlanesRef = useRef(getMaxPlanes());
  const spawnTimerRef = useRef<gsap.core.Tween | null>(null);
  const planeCleanupRef = useRef<Record<string, () => void>>({});
  const isMobileRef = useRef(isMobileDevice());
  const fadeAnimRef = useRef<gsap.core.Tween | null>(null);

  // Memoized path generator to avoid recalculating on every spawn
  const generatePath = useCallback((width: number, height: number, direction: number) => {
    const isLTR = direction === 1;
    const startX = isLTR ? -100 : width + 100;
    const endX = isLTR ? width + 100 : -100;

    const startY = Math.random() * (height * 0.8) + height * 0.1;
    const endY = Math.random() * (height * 0.8) + height * 0.1;

    // Simplified control points for smoother, more predictable curves
    const cp1x = isLTR ? width * 0.33 : width * 0.66;
    const cp1y = Math.random() * height;
    const cp2x = isLTR ? width * 0.66 : width * 0.33;
    const cp2y = Math.random() * height;

    return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Cache device check result
    const isMobile = isMobileRef.current;
    const maxPlanes = maxPlanesRef.current;

    const cancelSpawnTimer = () => {
      if (spawnTimerRef.current) {
        spawnTimerRef.current.kill();
        spawnTimerRef.current = null;
      }
    };

    const cleanupAllPlanes = () => {
      Object.values(planeCleanupRef.current).forEach((cleanup) => cleanup());
      planeCleanupRef.current = {};
      activePlanesRef.current = 0;
    };

    if (!active) {
      // Fade out container
      if (containerRef.current) {
        fadeAnimRef.current?.kill();
        fadeAnimRef.current = gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out"
        });
      }
      cancelSpawnTimer();
      cleanupAllPlanes();
      return () => {
        cancelSpawnTimer();
        cleanupAllPlanes();
        fadeAnimRef.current?.kill();
      };
    }

    // Fade in container
    if (containerRef.current) {
      fadeAnimRef.current?.kill();
      fadeAnimRef.current = gsap.to(containerRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out"
      });
    }

    gsap.registerPlugin(MotionPathPlugin);

    // Utility to create SVG elements with attributes
    const createSVGElement = (tag: string, attrs: Record<string, string | number>) => {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const k in attrs) {
        el.setAttribute(k, String(attrs[k]));
      }
      return el;
    };

    // Cache viewport dimensions to avoid repeated reads
    let cachedWidth = window.innerWidth;
    let cachedHeight = window.innerHeight;

    const spawnPlane = () => {
      if (activePlanesRef.current >= maxPlanes) {
        scheduleNextSpawn();
        return;
      }

      activePlanesRef.current++;

      const id = Date.now() + Math.random();
      const planeKey = `plane_${id}`;

      // Random direction
      const direction = Math.random() > 0.5 ? 1 : -1;

      // Generate path using cached dimensions
      const d = generatePath(cachedWidth, cachedHeight, direction);

      // Create mask
      const maskId = `mask_${id}`;
      const mask = createSVGElement("mask", { id: maskId, "data-plane-id": planeKey });
      const maskPath = createSVGElement("path", {
        d: d,
        stroke: "white",
        "stroke-width": 5,
        fill: "none",
        "stroke-linecap": "round",
      });
      mask.appendChild(maskPath);

      // Visible dashed path - use mobile-optimized class on mobile
      const flightPath = createSVGElement("path", {
        d: d,
        class: isMobile ? styles.dashedPathMobile : styles.dashedPath,
        mask: `url(#${maskId})`,
        id: `path_${id}`,
        "data-plane-id": planeKey,
      });

      // Plane group
      const planeGroup = createSVGElement("g", { id: planeKey, "data-plane-id": planeKey });

      // Clone template content
      const template = document.getElementById("planeTemplate");
      if (template) {
        Array.from(template.children).forEach((child) => {
          const cloned = child.cloneNode(true) as Element;
          // On mobile, use the mobile-optimized classes
          if (isMobile) {
            if (cloned.classList.contains(styles.planeFill)) {
              cloned.classList.remove(styles.planeFill);
              cloned.classList.add(styles.planeFillMobile);
            }
            if (cloned.classList.contains(styles.sketchStroke)) {
              cloned.classList.remove(styles.sketchStroke);
              cloned.classList.add(styles.sketchStrokeMobile);
            }
          }
          planeGroup.appendChild(cloned);
        });
      }

      // Set initial transform
      gsap.set(planeGroup, {
        transformOrigin: "50% 50%",
        x: -15,
        y: -10,
        scale: 1.5,
        willChange: "transform"
      });

      // Append to SVG
      svg.appendChild(mask);
      svg.appendChild(flightPath);
      svg.appendChild(planeGroup);

      // Animation setup
      const length = (maskPath as SVGPathElement).getTotalLength();
      gsap.set(maskPath, { strokeDasharray: length, strokeDashoffset: length });

      // Slightly faster on mobile for snappier feel
      const duration = isMobile ? 5 + Math.random() * 3 : 6 + Math.random() * 4;

      let tl: gsap.core.Timeline | null = null;
      let cleaned = false;

      const cleanupPlane = (killTimeline: boolean) => {
        if (cleaned) return;
        cleaned = true;

        if (killTimeline && tl) {
          tl.kill();
        }

        // Remove will-change before removing elements
        gsap.set(planeGroup, { willChange: "auto" });

        if (svg.contains(mask)) svg.removeChild(mask);
        if (svg.contains(flightPath)) svg.removeChild(flightPath);
        if (svg.contains(planeGroup)) svg.removeChild(planeGroup);

        activePlanesRef.current = Math.max(0, activePlanesRef.current - 1);
        delete planeCleanupRef.current[planeKey];
      };

      tl = gsap.timeline({
        onComplete: () => cleanupPlane(false),
        onInterrupt: () => cleanupPlane(true),
      });

      planeCleanupRef.current[planeKey] = () => cleanupPlane(true);

      // Reveal path
      tl.to(
        maskPath,
        {
          strokeDashoffset: 0,
          duration: duration,
          ease: "none",
        },
        0
      );

      // Move plane - disable autoRotate on mobile for performance
      tl.to(
        planeGroup,
        {
          motionPath: {
            path: flightPath as SVGPathElement,
            align: flightPath as SVGPathElement,
            autoRotate: !isMobile, // Disable on mobile for performance
            alignOrigin: [0.5, 0.5],
          },
          duration: duration,
          ease: "none",
        },
        0
      );

      // Fade out trail
      tl.to(
        flightPath,
        {
          opacity: 0,
          duration: 0.5,
        },
        ">-0.5"
      );

      // Schedule next spawn
      scheduleNextSpawn();
    };

    // Use gsap.delayedCall instead of rAF loop - much more efficient
    const scheduleNextSpawn = () => {
      if (!active) return;

      // Random delay between spawns: 1.5-4 seconds on desktop, 3-6 on mobile
      const minDelay = isMobile ? 3 : 1.5;
      const maxDelay = isMobile ? 6 : 4;
      const delay = minDelay + Math.random() * (maxDelay - minDelay);

      spawnTimerRef.current = gsap.delayedCall(delay, spawnPlane);
    };

    // Handle resize - update cached dimensions
    const handleResize = () => {
      cachedWidth = window.innerWidth;
      cachedHeight = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initial spawn
    spawnPlane();

    return () => {
      cancelSpawnTimer();
      cleanupAllPlanes();
      window.removeEventListener("resize", handleResize);
    };
  }, [active, generatePath]);

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      aria-hidden={!active}
    >
      <svg ref={svgRef} className={styles.canvas} preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Filter for wobble effect - only used on desktop via CSS classes */}
          <filter id="pencilTexture" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.03"
              numOctaves="3"
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Lightweight filter for mobile - simple blur for slight softness */}
          <filter id="pencilTextureMobile" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
          </filter>

          {/* Template for the Plane Group */}
          <g id="planeTemplate">
            {/* Main body */}
            <path className={styles.planeFill} d="M0,0 L30,10 L0,20 L5,10 Z" />
            {/* Center crease line for doodle look */}
            <path className={styles.sketchStroke} d="M5,10 L30,10" />
          </g>
        </defs>
      </svg>
    </div>
  );
};

