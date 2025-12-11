"use client";

import { useEffect } from "react";
import { useMenuContext } from "@/contexts/MenuContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollContext } from "@/contexts/ScrollContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartButton from "@/components/SmartButton";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import styles from "./FullScreenMenu.module.css";

export const FullScreenMenu = () => {
  const { isMenuOpen, closeMenu } = useMenuContext();
  const { t, language, setLanguage } = useLanguage();
  const { scrollTo } = useScrollContext();

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
    if (window.location.pathname === "/") {
      scrollTo("#contact");
      // Update URL without jump
      window.history.pushState(null, "", "#contact");
    } else {
      router.push("/#contact");
    }
  };

  return (
    <div
      className={`${styles.menuOverlay} ${isMenuOpen ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isMenuOpen}
    >
      {/* Language Switcher */}
      <div
        className="absolute left-8 z-[300] flex gap-4 text-xs font-medium tracking-widest pointer-events-auto"
        style={{
          top: "calc(1.5rem + env(safe-area-inset-top, 0px))",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLanguage("en");
          }}
          className={`p-2 -m-2 ${language === "en" ? "text-white border-b border-white" : "text-white/60 hover:text-white"} transition-colors font-semibold`}
        >
          {t.menu.english}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLanguage("th");
          }}
          className={`p-2 -m-2 ${language === "th" ? "text-white border-b border-white" : "text-white/60 hover:text-white"} transition-colors`}
        >
          {t.menu.thai}
        </button>
      </div>

      {/* Close Button (replicates Navbar position) */}
      <div className={styles.closeButton}>
        <MenuButton />
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
              {t.menu.ourStory}
            </Link>
            <Link
              href="/#ethos"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.ethos}
            </Link>
            <Link
              href="/services"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.services}
            </Link>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap justify-center items-baseline gap-8 md:gap-16 mt-4 md:mt-6">
            <Link
              href="/#global-reach"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.globalReach}
            </Link>
            <Link
              href="/#partners"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.partners}
            </Link>
            <Link
              href="/blog"
              onClick={handleLinkClick}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.blog}
            </Link>
          </div>

          {/* CTA Section */}
          <div className="flex items-center gap-8 mt-12 md:mt-20">
            <SmartButton text={t.menu.talkToUs} onClick={handleContactClick} theme="dark" />
          </div>
        </nav>
      </main>
    </div>
  );
};

