"use client";

import { forwardRef } from "react";
import styles from "./Landing.module.css";

export const LandingHeader = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className={styles.header}>
      <h1>A&A Hospitality was built on a simple belief—clarity and integrity can transform the way hotels operate, grow, and build long-term value. We bring decades of global experience to help owners and operators cut through complexity and move with confidence.</h1>
    </div>
  );
});

LandingHeader.displayName = "LandingHeader";
