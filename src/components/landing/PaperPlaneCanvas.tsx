import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import styles from "./PaperPlaneCanvas.module.css";

interface PaperPlaneCanvasProps {
  active: boolean;
}

export const PaperPlaneCanvas = ({ active }: PaperPlaneCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const activePlanesRef = useRef(0);
  const MAX_PLANES = 3;
  const loopRef = useRef<number | null>(null);
  const planeCleanupRef = useRef<Record<string, () => void>>({});

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const cancelLoop = () => {
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current);
        loopRef.current = null;
      }
    };

    const cleanupAllPlanes = () => {
      Object.values(planeCleanupRef.current).forEach((cleanup) => cleanup());
      planeCleanupRef.current = {};
      activePlanesRef.current = 0;
    };

    if (!active) {
      cancelLoop();
      cleanupAllPlanes();
      return () => {
        cancelLoop();
        cleanupAllPlanes();
      };
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

    const generatePath = (width: number, height: number, direction: number) => {
      // Direction: 1 = Left to Right, -1 = Right to Left
      const isLTR = direction === 1;
      const startX = isLTR ? -100 : width + 100;
      const endX = isLTR ? width + 100 : -100;

      const startY = Math.random() * (height * 0.8) + (height * 0.1);
      const endY = Math.random() * (height * 0.8) + (height * 0.1);

      // Control points
      // We want them to progress across the screen so the plane doesn't loop back wildly
      const cp1x = isLTR ? width * 0.33 : width * 0.66;
      const cp1y = Math.random() * height;
      const cp2x = isLTR ? width * 0.66 : width * 0.33;
      const cp2y = Math.random() * height;

      return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
    };

    const spawnPlane = () => {
      if (activePlanesRef.current >= MAX_PLANES) return;

      activePlanesRef.current++;

      const id = Date.now() + Math.random(); // Unique ID for mask references
      const planeKey = `plane_${id}`;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Random direction: true = LTR, false = RTL
      const direction = Math.random() > 0.5 ? 1 : -1;

      // 1. Generate Path Data
      const d = generatePath(width, height, direction);

      // 2. Create Elements
      // Mask Group
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

      // Visible Dashed Path
      const flightPath = createSVGElement("path", {
        d: d,
        class: styles.dashedPath,
        mask: `url(#${maskId})`,
        id: `path_${id}`, // Needed for MotionPathPlugin reference
        "data-plane-id": planeKey,
      });

      // Plane Group
      const planeGroup = createSVGElement("g", { id: planeKey, "data-plane-id": planeKey });

      // Clone the template content
      const template = document.getElementById("planeTemplate");
      if (template) {
        Array.from(template.children).forEach((child) => {
          planeGroup.appendChild(child.cloneNode(true));
        });
      }

      // Center the plane pivot
      gsap.set(planeGroup, { transformOrigin: "50% 50%", x: -15, y: -10, scale: 1.5 });

      // Append to SVG
      svg.appendChild(mask);
      svg.appendChild(flightPath);
      svg.appendChild(planeGroup);

      // 3. Animation Setup
      // maskPath is an SVGElement but TS might need casting for getTotalLength
      const length = (maskPath as SVGPathElement).getTotalLength();
      gsap.set(maskPath, { strokeDasharray: length, strokeDashoffset: length });

      const duration = 6 + Math.random() * 4; // Slower speed: 6 to 10 seconds

      let tl: gsap.core.Timeline | null = null;
      let cleaned = false;

      const cleanupPlane = (killTimeline: boolean) => {
        if (cleaned) return;
        cleaned = true;

        if (killTimeline && tl) {
          tl.kill();
        }

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

      // Move Plane
      tl.to(
        planeGroup,
        {
          motionPath: {
            path: flightPath as SVGPathElement,
            align: flightPath as SVGPathElement,
            autoRotate: true,
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
    };

    const gameLoop = () => {
      if (activePlanesRef.current < MAX_PLANES && Math.random() < 0.02) {
        spawnPlane();
      }
      loopRef.current = requestAnimationFrame(gameLoop);
    };

    // Initial spawn to get things started immediately
    spawnPlane();
    gameLoop();

    return () => {
      cancelLoop();
      cleanupAllPlanes();
    };
  }, [active]);

  return (
    <div
      className={`${styles.canvasContainer} ${active ? styles.isActive : ""}`}
      aria-hidden={!active}
    >
      <svg ref={svgRef} className={styles.canvas} preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Filter for wobble effect */}
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

