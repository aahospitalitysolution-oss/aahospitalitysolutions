"use client";

import { forwardRef } from "react";
import styles from "./Landing.module.css";

interface LandingSideTextProps {
  side: "left" | "right";
  texts: string[];
}

export const LandingSideText = forwardRef<HTMLDivElement, LandingSideTextProps>(
  ({ side, texts }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`${styles.sideText} ${styles[`sideText${side.charAt(0).toUpperCase() + side.slice(1)}`]}`}
      >
        {texts.map((text, index) => (
          <p key={index} className={styles.sideTextItem} data-index={index}>
            {text}
          </p>
        ))}
      </div>
    );
  }
);

LandingSideText.displayName = "LandingSideText";
