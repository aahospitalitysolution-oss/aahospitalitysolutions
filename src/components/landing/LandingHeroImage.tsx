"use client";

import Image from "next/image";

import { forwardRef } from "react";
import styles from "./Landing.module.css";

export const LandingHeroImage = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div className={styles.heroImgContainer}>
      <div ref={ref} className={styles.heroImg}>
        <Image
          src="/dashboard.png"
          alt="Dashboard application interface preview showing key features and analytics"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </div>
    </div>
  );
});

LandingHeroImage.displayName = "LandingHeroImage";

