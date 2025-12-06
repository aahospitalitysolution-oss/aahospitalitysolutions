"use client";

import { useEffect } from "react";
import { useMenuContext } from "@/contexts/MenuContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartButton from "@/components/SmartButton";
import styles from "./FullScreenMenu.module.css";

export const FullScreenMenu = () => {
  const { isMenuOpen, closeMenu } = useMenuContext();

  const router = useRouter();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    closeMenu();
  };

  const handleContactClick = () => {
    closeMenu();
    router.push("/#contact");
  };

  return (
    <div
      className={`${styles.menuOverlay} ${isMenuOpen ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isMenuOpen}
    >
      {/* Language Switcher */}
      <div className="absolute top-8 left-8 z-20 flex gap-4 text-xs font-medium tracking-widest">
        <a href="#" className="text-white font-semibold border-b border-white">
          ENGLISH
        </a>
        <a
          href="#"
          className="text-white/60 hover:text-white transition-colors"
        >
          THAI
        </a>
      </div>

      {/* Main Menu Content */}
      <main className={`flex-grow flex flex-col justify-center items-center w-full z-0 relative ${styles.menuContent}`}>
        <nav className="text-center flex flex-col items-center gap-4 md:gap-6">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center items-baseline gap-8 md:gap-16">
            <Link
              href="/#our-story"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              Our Story
            </Link>
            <Link
              href="/#ethos"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              Ethos
            </Link>
            <Link
              href="/services"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              Services
            </Link>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap justify-center items-baseline gap-8 md:gap-16 mt-4 md:mt-6">
            <Link
              href="/#global-reach"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              Global Reach
            </Link>
            <Link
              href="/#partners"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              Partners
            </Link>
          </div>

          {/* CTA Section */}
          <div className="flex items-center gap-8 mt-12 md:mt-20">
            <SmartButton text="Talk to us" onClick={handleContactClick} theme="dark" />
          </div>
        </nav>
      </main>
    </div>
  );
};

