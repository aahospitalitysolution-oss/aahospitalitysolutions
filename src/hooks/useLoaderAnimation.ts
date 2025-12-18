import { useLayoutEffect, RefObject, useRef } from "react";
import { gsap } from "gsap";
import { boxesInLogo } from "@/utils/animationStorage";

interface UseLoaderAnimationProps {
  shouldPlay: boolean;
  onComplete: () => void;
  stageRef: RefObject<HTMLDivElement | null>;
  boxRef: RefObject<HTMLDivElement | null>;
  blueRef: RefObject<HTMLDivElement | null>;
  heroBgRef: RefObject<HTMLDivElement | null>;
  counter1Ref: RefObject<HTMLDivElement | null>;
  counter2Ref: RefObject<HTMLDivElement | null>;
  counter3Ref: RefObject<HTMLDivElement | null>;
  progress: number; // Add progress prop
}

/**
 * First-time loader animation hook
 * Plays only once per session (on first page load)
 * Includes: box animations, background rise, counter sequence
 */
export const useLoaderAnimation = ({
  shouldPlay,
  onComplete,
  stageRef,
  boxRef,
  blueRef,
  heroBgRef,
  counter1Ref,
  counter2Ref,
  counter3Ref,
  progress,
}: UseLoaderAnimationProps) => {
  useLayoutEffect(() => {
    if (!shouldPlay) {
      // Skip loader: set elements to their final states immediately
      if (heroBgRef.current) {
        gsap.set(heroBgRef.current, { autoAlpha: 1, scaleY: 1 });
      }
      if (counter1Ref.current?.parentElement) {
        gsap.set(".counter", { autoAlpha: 0 });
      }
      // If boxes were already placed into the navbar earlier this session,
      // don't modify them - let the page transition handle their visibility
      if (stageRef.current && boxRef.current && blueRef.current) {
        if (!boxesInLogo()) {
          // Set boxes to their post-loader position (after moving left)
          // When loader is skipped and boxes haven't been moved yet, they should be visible
          // and in their final loader position so the page transition can animate them.
          const stage = stageRef.current;
          const stageWidth = stage.offsetWidth;
          const squareWidth = boxRef.current?.offsetWidth || 48;
          const travelX = Math.round(stageWidth * 0.4);
          const redLeft = Math.round(stageWidth / 2 - squareWidth / 2);

          gsap.set(boxRef.current, {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: -50,
            left: redLeft,
            top: "50%",
            x: -travelX,
            y: 0,
            scale: 1,
            transformOrigin: "0% 50%",
          });

          gsap.set(blueRef.current, {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: -50,
            left: redLeft + squareWidth + 8, // align left edge of rectangle with right edge of square + 8px gap
            top: "50%",
            x: -travelX,
            y: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            transformOrigin: "0% 50%",
          });
        }
      }
      onComplete();
      return;
    }

    if (
      !stageRef.current ||
      !boxRef.current ||
      !blueRef.current ||
      !heroBgRef.current ||
      !counter1Ref.current ||
      !counter2Ref.current ||
      !counter3Ref.current
    ) {
      return;
    }

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const stage = stageRef.current!;
      const stageWidth = stage.offsetWidth;
      const travelX = Math.round(stageWidth * 0.4);
      const moveEase = "back.inOut(1.4)";
      const moveDuration = 1;
      const fadeInDuration = 1; // seconds for box fade-in

      // Helper to set up box animations for both breakpoints
      const setupBoxAnimation = () => {
        const squareWidth = boxRef.current?.offsetWidth || 64;
        const redLeft = Math.round(stageWidth / 2 - squareWidth / 2); // align red center to stage center

        gsap.set(boxRef.current, {
          autoAlpha: 0,
          xPercent: 0,
          yPercent: -50,
          left: redLeft,
          top: "50%",
          x: 0,
          y: 0,
          transformOrigin: "0% 50%",
        });

        gsap.set(blueRef.current, {
          autoAlpha: 0,
          xPercent: 0,
          yPercent: -50,
          left: redLeft + squareWidth + 8, // align left edge of rectangle with right edge of square + 8px gap
          top: "50%",
          x: 0,
          y: 0,
          clipPath: "inset(0% 100% 0% 0%)",
          transformOrigin: "0% 50%",
        });

        const revealStartPx = squareWidth;
        const revealStartFrac = Math.min(
          1,
          Math.max(0, revealStartPx / Math.max(1, travelX))
        );
        const revealDuration = Math.max(
          0.0001,
          moveDuration * (1 - revealStartFrac)
        );

        gsap
          .timeline({ defaults: { ease: "power2.inOut" } })
          .add("move", 0.5)
          .to(
            boxRef.current,
            {
              autoAlpha: 1,
              duration: fadeInDuration,
              ease: "power2.out",
            },
            0
          )
          .to(
            [boxRef.current, blueRef.current],
            {
              x: -travelX,
              duration: moveDuration,
              ease: moveEase,
            },
            "move"
          )
          .to(
            blueRef.current,
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: revealDuration,
              ease: "power2.out",
            },
            `move+=${revealStartFrac}`
          );
      };

      // Mobile portrait
      mm.add("(max-width: 640px) and (orientation: portrait)", () => {
        setupBoxAnimation();
      });

      // Desktop & landscape
      mm.add("(min-width: 641px), (orientation: landscape)", () => {
        setupBoxAnimation();
      });
    }, stageRef);

    // Counter and background animation
    const c1 = counter1Ref.current;
    const c2 = counter2Ref.current;
    const c3 = counter3Ref.current;
    const hero = heroBgRef.current;

    // Build digits
    const createDigits = () => {
      // Clear existing children first to avoid duplication on re-renders
      if (c1) c1.innerHTML = "";
      if (c2) c2.innerHTML = "";
      if (c3) c3.innerHTML = "";

      // first column: 0 then 1 with slight offset class
      const d0 = document.createElement("div");
      d0.className = "num";
      d0.textContent = "0";
      if (c1) c1.appendChild(d0);
      const d1 = document.createElement("div");
      d1.className = "num num1offset1";
      d1.textContent = "1";
      if (c1) c1.appendChild(d1);

      // second column: 0..9 and then 0 again
      for (let i = 0; i <= 10; i++) {
        const el = document.createElement("div");
        el.className = i === 1 ? "num num1offset2" : "num";
        el.textContent = i === 10 ? "0" : String(i);
        if (c2) c2.appendChild(el);
      }

      // third column: 0..29 then 0
      for (let i = 0; i < 30; i++) {
        const el = document.createElement("div");
        el.className = "num";
        el.textContent = String(i % 10);
        if (c3) c3.appendChild(el);
      }
      const last = document.createElement("div");
      last.className = "num";
      last.textContent = "0";
      if (c3) c3.appendChild(last);
    };

    const updateCounter = (progress: number) => {
      // 0 to 100
      const p = Math.min(100, Math.max(0, progress));

      // Column 1 (Hundreds/Tens overflow logic for 100): 
      // 0-99 -> 0, 100 -> 1
      // Actually c1 is just 0 or 1. 
      // 0 corresponds to y=0. 1 corresponds to y = -numHeight.
      if (c1) {
        const sample = c1.querySelector<HTMLElement>(".num");
        if (sample) {
          const h = sample.clientHeight;
          // Switch to '1' only at 100%
          const targetIdx = p >= 100 ? 1 : 0;
          gsap.to(c1, { y: -targetIdx * h, duration: 0.5, ease: "power2.out" });
        }
      }

      // Column 2 (Tens): 0..9, then 0 (for 100)
      // digit = Math.floor(p / 10) % 10
      // But at 100, we want it to show 0 (which is the 11th item in our list, index 10)
      // Our list is 0,1,2...9,0. Index 0..9 match digits. Index 10 is '0'.
      if (c2) {
        const sample = c2.querySelector<HTMLElement>(".num");
        if (sample) {
          const h = sample.clientHeight;
          const targetIdx = Math.floor(p / 10);
          // If p=100, targetIdx=10, which maps correctly to the last '0'
          gsap.to(c2, { y: -targetIdx * h, duration: 0.5, ease: "power2.out" });
        }
      }

      // Column 3 (Ones): 0..9 repeatedly
      // Our list is long to simulate scrolling? 
      // Actually we can just map directly to the digit 0-9.
      // The original code had 30 items (0..9 three times) to allow for "spinning".
      // We can map p%10 to the index. To make it spin more, we can use the full range of 30 based on p?
      // Let's just map 0-100 to the full height of the column roughly.
      // 30 items -> indices 0..29. plus last 0 -> index 30.
      // Let's just track the digit directly.
      if (c3) {
        const sample = c3.querySelector<HTMLElement>(".num");
        if (sample) {
          const h = sample.clientHeight;
          // We want it to cycle.
          // simple mapping: digit = p % 10.
          // but to make it look like it scrolled multiple times, we can add rotations.
          // 0 -> index 0
          // 100 -> index 30 (last 0)
          // map 0..100 to 0..30
          const targetIdx = (p / 100) * 30;
          gsap.to(c3, { y: -targetIdx * h, duration: 0.5, ease: "power2.out" });
        }
      }
    };

    const tl = gsap.timeline();

    // Initialize digits and hero bg
    createDigits();
    gsap.set(hero, { scaleY: 0, transformOrigin: "bottom" });

    // Animate background rise - start immediately, no delay
    // We still want the background to rise independent of image loading? 
    // Or should it track progress too? Let's keep it time-based or link it to progress?
    // User asked if "0 to 100 loading actually loading". 
    // So 0->100 should track progress. The background rise can also track progress.

    // Let's update background scaleY based on progress in the effect below

    return () => {
      mm.revert();
      ctx.revert();
      tl.kill();
      gsap.set([c1, c2, c3], { clearProps: "all" });
    };
  }, [
    shouldPlay,
    // Remove onComplete from dependency to avoid re-running start logic
    stageRef,
    boxRef,
    blueRef,
    heroBgRef,
    counter1Ref,
    counter2Ref,
    counter3Ref,
  ]);

  const completionTriggeredRef = useRef(false);

  // Separate effect to handle progress updates
  useLayoutEffect(() => {
    if (!shouldPlay || !heroBgRef.current || completionTriggeredRef.current) return;

    const p = Math.min(100, Math.max(0, progress));

    // Animate background rise with progress
    gsap.to(heroBgRef.current, {
      scaleY: p / 100,
      duration: 0.5,
      ease: "power2.out"
    });

    // Animate counters
    const c1 = counter1Ref.current;
    const c2 = counter2Ref.current;
    const c3 = counter3Ref.current;

    if (c1 && c2 && c3) {
      const sample = c3.querySelector<HTMLElement>(".num");
      if (sample) {
        const h = sample.clientHeight;

        // C1: 0 or 1
        const idx1 = p >= 100 ? 1 : 0;
        gsap.to(c1, { y: -idx1 * h, duration: 0.5 });

        // C2: 0-10
        const idx2 = Math.floor(p / 10);
        gsap.to(c2, { y: -idx2 * h, duration: 0.5 });

        // C3: 0-30 (spinning)
        const idx3 = (p / 100) * 30;
        gsap.to(c3, { y: -idx3 * h, duration: 0.5 });
      }
    }

    if (p >= 100) {
      completionTriggeredRef.current = true;
      // Complete sequence
      const tl = gsap.timeline();
      // Wait 0.5s after reaching 100 before starting fade out
      const waitDuration = 0.5;

      tl.to(".counter", { autoAlpha: 0, duration: 0.3, ease: "power3.out" }, `+=${waitDuration}`);
      tl.add(() => onComplete(), ">");
    }

  }, [shouldPlay, progress, onComplete]);
};

