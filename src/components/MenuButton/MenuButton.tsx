"use client";

import styles from "./MenuButton.module.css";
import { useMenuContext } from "@/contexts/MenuContext";

export const MenuButton = ({ className }: { className?: string }) => {
  const { isMenuOpen, toggleMenu } = useMenuContext();

  return (
    <div
      className={`${styles.menuTrigger} ${isMenuOpen ? styles.active : ""} ${className || ""}`}
      onClick={toggleMenu}
      aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleMenu();
          e.preventDefault();
        }
      }}
      style={{ color: 'inherit' }}
    >
      <svg className={styles.hamburgerSvg} viewBox="0 0 100 100">
        {/* Top Line */}
        <path className={`${styles.line} ${styles.lineTop}`} d="M 15 50 H 85" />

        {/* Middle Line */}
        <path
          className={`${styles.line} ${styles.lineMiddle}`}
          d="M 15 50 H 85"
        />

        {/* Bottom Line */}
        <path
          className={`${styles.line} ${styles.lineBottom}`}
          d="M 15 50 H 85"
        />
      </svg>
    </div>
  );
};
