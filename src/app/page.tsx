"use client";

import { useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import TextReveal from "@/components/TextReveal";

export default function Home() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const blueRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [revealPlay, setRevealPlay] = useState(false);
  const phrases = useMemo(
    () => [
      "we're on our way",
      "something incredible is happening soon",
      "stay tuned",
      "crafted with care",
    ],
    []
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const rotationRef = useRef<gsap.core.Tween | null>(null);
  const REVEAL_DURATION = 1.6;
  const HOLD_AFTER_REVEAL = 0.9; // keep text visible after reveal
  const PHRASE_GAP = 0.6; // small gap before next phrase starts

  const startRotation = useCallback(() => {
    if (rotationRef.current) return;
    const schedule = () => {
      rotationRef.current = gsap.delayedCall(
        REVEAL_DURATION + HOLD_AFTER_REVEAL + PHRASE_GAP,
        () => {
          setPhraseIndex((i) => (i + 1) % phrases.length);
          schedule();
        }
      );
    };
    schedule();
  }, [phrases.length, REVEAL_DURATION, HOLD_AFTER_REVEAL, PHRASE_GAP]);

  useLayoutEffect(() => {
    if (
      !stageRef.current ||
      !boxRef.current ||
      !textRef.current ||
      !blueRef.current
    ) {
      return;
    }

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const stage = stageRef.current!;
      const stageWidth = stage.offsetWidth;
      const stageHeight = stage.offsetHeight;
      const RED_SIZE = 64; // px
      const BLUE_WIDTH = 320; // px
      const travelX = stageWidth * 0.4;
      const travelY = stageHeight * 0.4;
      const moveEase = "back.inOut(1.4)";
      const moveDuration = 1;
      const delayAtCenter = 1; // seconds

      // Mobile portrait: vertical translation
      mm.add("(max-width: 640px) and (orientation: portrait)", () => {
        const redTop = stageHeight / 2 - RED_SIZE / 2;
        const blueLeftEdge = stageWidth / 2 - BLUE_WIDTH / 2; // center blue horizontally
        const redCenterLeft = stageWidth / 2 - RED_SIZE / 2; // start red exactly centered
        const redHorizontalDelta = redCenterLeft - blueLeftEdge; // move left by this to align left edges

        gsap.set(boxRef.current, {
          autoAlpha: 0,
          left: redCenterLeft,
          xPercent: 0,
          top: redTop,
          yPercent: 0,
          x: 0,
          y: 0,
        });

        gsap.set(blueRef.current, {
          autoAlpha: 0,
          left: blueLeftEdge,
          xPercent: 0,
          top: redTop,
          yPercent: 0,
          x: 0,
          y: -travelY,
          // no clipping; we'll only fade in
          clipPath: "inset(0% 0% 0% 0%)",
        });

        gsap.set(textRef.current, {
          autoAlpha: 0,
          left: "50%",
          xPercent: -50,
          top: stageHeight / 2, // anchor by top edge at center
          yPercent: -100,
          x: 0,
          y: 0,
        });

        gsap
          .timeline({ defaults: { ease: "power2.inOut" } })
          .to(boxRef.current, {
            autoAlpha: 1,
            duration: 1,
            ease: "power2.out",
          })
          .to({}, { duration: delayAtCenter })
          .add("move")
          // move upward; red also moves left so its left edge aligns with blue's left edge after
          .to(
            boxRef.current,
            {
              y: -travelY,
              x: -redHorizontalDelta,
              duration: moveDuration,
              ease: moveEase,
            },
            "move"
          )
          // after red finishes moving, bring blue in and reveal
          .add("after", `move+=${moveDuration}`)
          .to(
            blueRef.current,
            { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
            "after"
          )
          // text mirrors downward while fading in
          .to(
            textRef.current,
            {
              autoAlpha: 1,
              y: travelY + RED_SIZE / 2,
              duration: moveDuration,
              ease: moveEase,
            },
            "move"
          )
          // start text reveal and phrase rotation only after the text finishes moving
          .add(() => {
            setRevealPlay(true);
            startRotation();
          }, `move+=${moveDuration}`);
      });

      // Default / desktop & landscape: horizontal translation
      mm.add("(min-width: 641px), (orientation: landscape)", () => {
        const redLeft = stageWidth / 2 - RED_SIZE / 2; // align red center to stage center

        gsap.set(boxRef.current, {
          autoAlpha: 0,
          xPercent: 0,
          yPercent: -50,
          left: redLeft,
          top: "50%",
          x: 0,
          y: 0,
        });

        gsap.set(blueRef.current, {
          autoAlpha: 0,
          xPercent: 0,
          yPercent: -50,
          left: redLeft, // left edge aligned with red
          top: "50%",
          x: 0,
          y: 0,
          // fully hidden via clip from the right side
          clipPath: "inset(0% 100% 0% 0%)",
        });

        gsap.set(textRef.current, {
          autoAlpha: 0,
          xPercent: -100,
          yPercent: -50,
          left: stageWidth / 2, // anchor by right edge at center
          top: "50%",
          x: 0,
          y: 0,
        });

        const revealStartPx = RED_SIZE; // start revealing once we've moved more than red's width
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
          .to(boxRef.current, {
            autoAlpha: 1,
            duration: 1,
            ease: "power2.out",
          })
          .to({}, { duration: delayAtCenter })
          .add("move")
          // move red and blue together, left edges remain aligned
          .to(
            [boxRef.current, blueRef.current],
            {
              x: -travelX,
              duration: moveDuration,
              ease: moveEase,
            },
            "move"
          )
          // reveal the blue (from right to left)
          .to(
            blueRef.current,
            {
              autoAlpha: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: revealDuration,
              ease: "power2.out",
            },
            `move+=${revealStartFrac}`
          )
          // text mirrors to the right while fading in
          .to(
            textRef.current,
            {
              autoAlpha: 1,
              x: travelX + RED_SIZE / 2, // move so the right edge mirrors the left edge
              duration: moveDuration,
              ease: moveEase,
            },
            "move"
          )
          // start text reveal and phrase rotation only after the text finishes moving
          .add(() => {
            setRevealPlay(true);
            startRotation();
          }, `move+=${moveDuration}`);
      });
    }, stageRef);

    return () => {
      mm.revert();
      ctx.revert();
      rotationRef.current?.kill();
      rotationRef.current = null;
    };
  }, [startRotation]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5EFE6] text-neutral-900">
      <div
        ref={stageRef}
        className="relative flex h-[320px] w-full max-w-5xl items-center justify-center px-6"
      >
        <div
          ref={blueRef}
          className="absolute z-0 h-16 w-80 rounded bg-blue-500 shadow-xl opacity-0"
        />
        <div
          ref={boxRef}
          className="absolute z-10 h-16 w-16 rounded bg-red-500 shadow-2xl opacity-0"
        />
        <div
          ref={textRef}
          className="absolute z-20 max-w-sm text-balance text-base text-neutral-800 opacity-0 text-center md:text-left"
        >
          <TextReveal
            text={phrases[phraseIndex]}
            duration={REVEAL_DURATION}
            size="sm"
            play={revealPlay}
            className="mx-auto"
          />
        </div>
      </div>
    </main>
  );
}
