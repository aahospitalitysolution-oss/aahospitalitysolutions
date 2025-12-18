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
  const { t } = useLanguage();
  const { scrollTo, setPendingHash } = useScrollContext();

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
      window.history.pushState(null, "", "#contact");
    } else {
      // Cross-page navigation: queue hash, then navigate
      setPendingHash("#contact");
      router.push("/", { scroll: false });
    }
  };

  // Generic handler for hash links pointing to home page sections
  const handleHashLinkClick = (e: React.MouseEvent, hash: string) => {
    e.preventDefault();
    closeMenu();
    if (window.location.pathname === "/") {
      scrollTo(hash);
      window.history.pushState(null, "", hash);
    } else {
      // Cross-page navigation: queue hash, then navigate
      setPendingHash(hash);
      router.push("/", { scroll: false });
    }
  };

  return (
    <div
      className={`${styles.menuOverlay} ${isMenuOpen ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isMenuOpen}
    >
      {/* Close Button (replicates Navbar position) */}
      <div className={styles.closeButton}>
        <MenuButton />
      </div>

      {/* Main Menu Content */}
      <main
        className={`flex-grow flex flex-col justify-center items-center w-full z-0 relative ${styles.menuContent}`}
      >
        <nav className="text-center flex flex-col items-center gap-4 md:gap-6">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center items-baseline gap-8 md:gap-16">
            <Link
              href="/#our-story"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashLinkClick(e, "#our-story")}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.ourStory}
            </Link>
            <Link
              href="/#ethos"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashLinkClick(e, "#ethos")}
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
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashLinkClick(e, "#global-reach")}
              className={`${styles.menuItem} ${styles.fancyUnderline} text-3xl md:text-5xl lg:text-6xl`}
            >
              {t.menu.globalReach}
            </Link>
            <Link
              href="/#partners"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleHashLinkClick(e, "#partners")}
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
            <SmartButton
              text={t.menu.talkToUs}
              onClick={handleContactClick}
              theme="dark"
            />
          </div>
        </nav>
      </main>
    </div>
  );
};
