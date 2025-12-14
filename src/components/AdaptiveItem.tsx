"use client";

import { useRef } from "react";
import { useAdaptiveColor } from "@/hooks/useAdaptiveColor";

interface AdaptiveItemProps {
  children: React.ReactNode;
  className?: string;
  lightColor?: string; // Color to use on dark backgrounds (default: white)
  darkColor?: string; // Color to use on light backgrounds (default: black/#1a1a1a)
}

export const AdaptiveItem = ({
  children,
  className = "",
  lightColor = "#ffffff",
  darkColor = "#1a1a1a",
}: AdaptiveItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const color = useAdaptiveColor(ref, { lightColor, darkColor });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        color: color,
        transition: "color 0.3s ease",
        display: "contents", // Prevents layout shift/nesting issues
      }}
    >
      {children}
    </div>
  );
};
