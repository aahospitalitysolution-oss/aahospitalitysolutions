import { useLayoutEffect, RefObject } from "react";
import { gsap } from "gsap";
import {
  boxesInLogo,
  markBoxesInLogo,
  consumeLoaderJustPlayed,
} from "@/utils/animationStorage";

interface UsePageTransitionProps {
  shouldPlay: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  boxRef: RefObject<HTMLDivElement | null>;
  blueRef: RefObject<HTMLDivElement | null>;
  logoTargetRef: RefObject<HTMLDivElement | null>;
}

/**
 * Page transition animation hook
 * Plays on every page navigation
 * Includes: dividers, content reveals, boxes moving to logo
 */
export const usePageTransition = ({
  shouldPlay,
  stageRef,
  boxRef,
  blueRef,
  logoTargetRef,
}: UsePageTransitionProps) => {
  useLayoutEffect(() => {
    if (!shouldPlay) {
      return;
    }

    if (
      !stageRef.current ||
      !boxRef.current ||
      !blueRef.current ||
      !logoTargetRef.current
    ) {
      return;
    }

    const tl = gsap.timeline();
    const loaderJustPlayed = consumeLoaderJustPlayed();

    // Always animate reveals smoothly, even after loader
    // (removed immediate set calls)

    const slot = logoTargetRef.current;
    const redEl = boxRef.current;
    const blueEl = blueRef.current;
    const stage = stageRef.current;

    // Safety: should not happen due to guards above
    if (!slot || !redEl || !blueEl || !stage) return;

    // Clean up any old box elements that might be in the slot from previous render
    // (On reload, React creates fresh boxes, so old ones need to be removed)
    const oldBoxes = slot.querySelectorAll(".bg-red-500, .bg-blue-500");
    oldBoxes.forEach((oldBox) => {
      if (oldBox !== redEl && oldBox !== blueEl) {
        oldBox.remove();
      }
    });

    // Helper to reveal nav divider and content AFTER boxes have reached the navbar
    const playNavAndContentReveal = () => {
      tl.to(
        [".nav-divider", ".site-info-divider"],
        { scaleX: "100%", duration: 1, ease: "power2.inOut", stagger: 0.2 },
        ">"
      );
      tl.to(
        [".reveal"],
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.08,
        },
        ">0.1"
      );
    };

    // Determine current placement of boxes
    const inLoaderStage = redEl.parentElement === stage;
    const inAnyLogoSlot = redEl.parentElement?.classList.contains("logo-slot");
    const inCurrentSlot = redEl.parentElement === slot;
    const hasBeenMovedToLogo = boxesInLogo();

    const targetScale = 1;

    if (inCurrentSlot) {
      // Already in this page's slot: ensure correct positioning and reveal with slide/fade
      gsap.set(redEl, {
        position: "absolute",
        left: 0,
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      gsap.set(blueEl, {
        position: "absolute",
        left: 56, // Offset by square width (48px) + 8px gap
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      if (!loaderJustPlayed) {
        gsap.set([redEl, blueEl], { y: 20, autoAlpha: 0 });
        tl.to(
          [redEl, blueEl],
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out" },
          0.1
        );
      } else {
        // Loader just played: keep boxes visible without animation
        gsap.set([redEl, blueEl], { y: 0, autoAlpha: 1 });
      }
      playNavAndContentReveal();
    } else if (inAnyLogoSlot && !inCurrentSlot) {
      // In a different page's slot: move instantly to this slot, then reveal
      slot.appendChild(blueEl);
      slot.appendChild(redEl);
      gsap.set(redEl, {
        position: "absolute",
        left: 0,
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      gsap.set(blueEl, {
        position: "absolute",
        left: 56, // Offset by square width (48px) + 8px gap
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      if (!loaderJustPlayed) {
        gsap.set([redEl, blueEl], { y: 20, autoAlpha: 0 });
        tl.to(
          [redEl, blueEl],
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out" },
          0.1
        );
      } else {
        // Loader just played: keep boxes visible without animation
        gsap.set([redEl, blueEl], { y: 0, autoAlpha: 1 });
      }
      playNavAndContentReveal();
    } else if (hasBeenMovedToLogo && inLoaderStage) {
      // Loader was skipped or boxes already moved previously: append instantly then reveal
      slot.appendChild(blueEl);
      slot.appendChild(redEl);
      gsap.set(redEl, {
        position: "absolute",
        left: 0,
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      gsap.set(blueEl, {
        position: "absolute",
        left: 56, // Offset by square width (48px) + 8px gap
        top: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: targetScale,
        transformOrigin: "0% 50%",
        zIndex: 1,
      });
      if (!loaderJustPlayed) {
        gsap.set([redEl, blueEl], { y: 20, autoAlpha: 0 });
        tl.to(
          [redEl, blueEl],
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out" },
          0.1
        );
      } else {
        // Loader just played: keep boxes visible without animation
        gsap.set([redEl, blueEl], { y: 0, autoAlpha: 1 });
      }
      playNavAndContentReveal();
    } else {
      // First-time: animate from loader stage to slot, then slide/fade reveal in navbar
      const slotRect = slot.getBoundingClientRect();
      const redRect = redEl.getBoundingClientRect();

      gsap.set([redEl, blueEl], { transformOrigin: "0% 50%" });
      const targetLeft = slotRect.left;
      const targetCenterY = slotRect.top + slotRect.height / 2;
      const dx = targetLeft - redRect.left;
      const dy = targetCenterY - (redRect.top + redRect.height / 2);

      tl.to(
        [redEl, blueEl],
        {
          x: `+=${dx}`,
          y: `+=${dy}`,
          scale: targetScale,
          transformOrigin: "0% 50%",
          duration: 1,
          ease: "power3.inOut",
        },
        0
      );

      tl.add(() => {
        slot.appendChild(blueEl);
        slot.appendChild(redEl);

        gsap.set(redEl, {
          position: "absolute",
          left: 0,
          top: 0,
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 0,
          scale: targetScale,
          transformOrigin: "0% 50%",
          zIndex: 1,
        });
        gsap.set(blueEl, {
          position: "absolute",
          left: 56, // Offset by square width (48px) + 8px gap
          top: 0,
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 0,
          scale: targetScale,
          transformOrigin: "0% 50%",
          zIndex: 1,
        });

        // Prepare for slide/fade reveal inside the navbar
        if (!loaderJustPlayed) {
          gsap.set([redEl, blueEl], { y: 20, autoAlpha: 0 });
        } else {
          // Loader just played: keep boxes visible without animation
          gsap.set([redEl, blueEl], { y: 0, autoAlpha: 1 });
        }
        // Mark moved
        markBoxesInLogo();
      }, ">");
      if (!loaderJustPlayed) {
        tl.to(
          [redEl, blueEl],
          { y: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out" },
          ">0.05"
        );
      }
      playNavAndContentReveal();
    }

    return () => {
      tl.kill();
    };
  }, [shouldPlay, stageRef, boxRef, blueRef, logoTargetRef]);
};
