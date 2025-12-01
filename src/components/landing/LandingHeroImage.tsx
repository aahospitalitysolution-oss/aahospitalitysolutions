"use client";

import { forwardRef } from "react";
import styles from "./Landing.module.css";

export const LandingHeroImage = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.heroImgContainer}>
      <div ref={ref} className={styles.heroImg}>
        <img 
          src="/dashboard.png" 
          alt="Dashboard application interface preview showing key features and analytics"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
});

LandingHeroImage.displayName = "LandingHeroImage";

