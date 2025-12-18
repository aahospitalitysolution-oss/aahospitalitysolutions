"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface SmartButtonProps {
  text?: string;
  subtext?: string;
  onClick?: () => void;
  alignment?: "left" | "center" | "right";
  theme?: "light" | "dark";
  hoverColor?: string;
  hoverTextColor?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: "default" | "small";
}

export default function SmartButton({
  text = "Learn More",
  subtext,
  onClick,
  alignment = "center",
  theme = "light",
  hoverColor,
  hoverTextColor,
  backgroundColor,
  textColor,
  size = "default",
}: SmartButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const circle = circleRef.current;
    const arrow = arrowRef.current;
    const textElements = textRef.current?.querySelectorAll(".split-text");

    if (!button || !circle || !arrow || !textElements) return;

    // Define colors based on theme
    // Light theme (default): Parchment bg, Charcoal Blue text/active bg, Parchment active text
    // Dark theme: Transparent/Outline? Or Rosy Taupe?
    // User asked to change color on hover to another palette color.
    // Let's use Rosy Taupe for the active background in dark theme or generally if desired.

    const themeColors = {
      light: {
        inactive: {
          bg:
            backgroundColor ||
            getComputedStyle(button).getPropertyValue("--parchment").trim() ||
            "#f6f0ed",
          text:
            textColor ||
            getComputedStyle(button)
              .getPropertyValue("--charcoal-blue")
              .trim() || "#28536b",
          border: "none",
        },
        active: {
          bg:
            hoverColor ||
            getComputedStyle(button).getPropertyValue("--rosy-taupe").trim() ||
            "#c2948a", // Changed to rosy-taupe per request
          text:
            hoverTextColor ||
            getComputedStyle(button).getPropertyValue("--parchment").trim() ||
            "#f6f0ed",
        },
      },
      dark: {
        inactive: {
          bg: backgroundColor || "transparent",
          text:
            textColor ||
            getComputedStyle(button).getPropertyValue("--parchment").trim() ||
            "#f6f0ed",
          border:
            getComputedStyle(button).getPropertyValue("--parchment").trim() ||
            "#f6f0ed",
        },
        active: {
          bg:
            hoverColor ||
            getComputedStyle(button).getPropertyValue("--rosy-taupe").trim() ||
            "#c2948a",
          text:
            hoverTextColor ||
            getComputedStyle(button).getPropertyValue("--parchment").trim() ||
            "#f6f0ed",
        },
      },
    };

    const colors = theme === "dark" ? themeColors.dark : themeColors.light;

    const ctx = gsap.context(() => {
      // Initial state
      const initialWidth = button.offsetWidth;

      gsap.set(button, {
        backgroundColor: colors.inactive.bg,
        width: initialWidth,
        transformOrigin:
          alignment === "center"
            ? "center"
            : alignment === "left"
              ? "left"
              : "right",
        border:
          theme === "dark" ? `1px solid ${colors.inactive.border}` : "none",
      });
      gsap.set(textElements, { color: colors.inactive.text });
      gsap.set(arrow, {
        transformOrigin: "center center",
        color: colors.inactive.text,
      });
      gsap.set(circle, {
        backgroundColor:
          theme === "dark" ? "rgba(255,255,255,0.1)" : colors.inactive.bg,
        border:
          theme === "dark"
            ? "none"
            : `1px solid ${getComputedStyle(button)
              .getPropertyValue("--charcoal-blue")
              .trim() || "#28536b"
            }1a`, // 10% opacity hex
      });

      // Helper to resolve CSS variables
      const resolveColor = (color: string) => {
        if (!color) return color;
        if (color.startsWith("var(")) {
          const varName = color.match(/var\(([^)]+)\)/)?.[1];
          if (varName) {
            const resolved = getComputedStyle(button).getPropertyValue(varName).trim();
            if (resolved) return resolved;
          }
        }
        return color;
      };

      // Resolve colors for animation
      // For start color, we can trust the computed style since we set it inline
      const startBgColor = getComputedStyle(button).backgroundColor;
      const endBgColor = resolveColor(colors.active.bg);

      const startTextColor = resolveColor(colors.inactive.text);
      const endTextColor = resolveColor(colors.active.text);

      // Timeline
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.7, ease: "power3.inOut" },
      });

      tl.fromTo(
        button,
        {
          width: initialWidth,
          backgroundColor: startBgColor,
          borderColor:
            theme === "dark" ? colors.inactive.border : "transparent",
        },
        {
          width: initialWidth + 60,
          backgroundColor: endBgColor,
          borderColor: endBgColor,
        },
        0
      )
        .fromTo(
          textElements,
          { color: startTextColor },
          { color: endTextColor },
          0
        )
        .fromTo(
          arrow,
          {
            rotation: 0,
            color: startTextColor,
          },
          {
            rotation: 45,
            duration: 0.7,
            ease: "power3.inOut",
            color: endTextColor,
          },
          0
        )
        .fromTo(
          circle,
          {
            scale: 1,
            backgroundColor:
              theme === "dark" ? "rgba(255,255,255,0.1)" : colors.inactive.bg,
          },
          {
            scale: 1.1,
            duration: 0.7,
            backgroundColor:
              getComputedStyle(button)
                .getPropertyValue("--steel-blue")
                .trim() || "#7ea8be",
          },
          0
        );

      tlRef.current = tl;
    }, button);

    return () => ctx.revert();
  }, [text, subtext, theme, hoverColor, backgroundColor, size, textColor, hoverTextColor]); // Added textColor and hoverTextColor dependency

  const handleMouseEnter = () => {
    tlRef.current?.play();
  };

  const handleMouseLeave = () => {
    tlRef.current?.reverse();
  };

  const handleMouseDown = () => {
    gsap.to(buttonRef.current, {
      scale: 0.98,
      duration: 0.1,
      ease: "power1.out",
    });
  };

  const handleMouseUp = () => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.1, ease: "power1.out" });
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case "left":
        return "mr-auto"; // Pushes to the left, grows to the right
      case "right":
        return "ml-auto"; // Pushes to the right, grows to the left
      case "center":
      default:
        return "mx-auto"; // Centers, grows both sides
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        backgroundColor: backgroundColor || (theme === "dark" ? "transparent" : undefined),
      }}
      className={`relative z-10 group flex items-center justify-between rounded-full cursor-pointer shadow-lg overflow-hidden ${size === "small" ? "gap-2 px-4 py-2" : "gap-4 px-6 py-3"
        } ${theme === "dark"
          ? "bg-transparent text-[var(--parchment)]"
          : "bg-[var(--parchment)]"
        } ${getAlignmentClass()}`}
    >
      {/* Text Section */}
      <div
        ref={textRef}
        className={`leading-none text-left font-normal tracking-wide font-[family-name:var(--font-sans)] flex flex-col justify-center ${size === "small" ? "text-sm" : "text-lg"
          }`}
      >
        <span
          className={`split-text block whitespace-nowrap ${theme === "dark"
            ? "text-[var(--parchment)]"
            : "text-[var(--charcoal-blue)]"
            }`}
        >
          {text}
        </span>
        {subtext && (
          <span
            className={`split-text block font-medium mt-1 whitespace-nowrap text-sm ${theme === "dark"
              ? "text-[var(--parchment)]"
              : "text-[var(--charcoal-blue)]"
              }`}
          >
            {subtext}
          </span>
        )}
      </div>

      {/* Circle Icon Container */}
      <div
        ref={circleRef}
        className={`relative flex-shrink-0 rounded-full flex items-center justify-center shadow-sm transform transition-transform ${size === "small" ? "w-7 h-7" : "w-10 h-10"
          } ${theme === "dark"
            ? "bg-white/10"
            : "bg-[var(--parchment)] border border-[var(--charcoal-blue)]/10"
          }`}
      >
        {/* Arrow SVG */}
        <svg
          ref={arrowRef}
          width={size === "small" ? "14" : "20"}
          height={size === "small" ? "14" : "20"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${theme === "dark"
            ? "text-[var(--parchment)]"
            : "text-[var(--charcoal-blue)]"
            }`}
        >
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </div>
    </button>
  );
}
