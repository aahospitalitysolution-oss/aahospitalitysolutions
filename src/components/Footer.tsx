"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import styles from "./Footer.module.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollContext } from "@/contexts/ScrollContext";

export default function Footer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { scrollTo, setPendingHash } = useScrollContext();
  const router = useRouter();

  // Handler for hash links pointing to home page sections
  const handleHashLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      scrollTo(hash);
      window.history.pushState(null, "", hash);
    } else {
      // Cross-page navigation: queue hash, then navigate
      setPendingHash(hash);
      router.push("/", { scroll: false });
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      // Cancel previous frame to avoid stacking if scroll events fire rapidly
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        const layer1 = layer1Ref.current;
        const layer2 = layer2Ref.current;
        const layer3 = layer3Ref.current;

        if (!wrapper || !layer1 || !layer2 || !layer3) return;

        const rect = wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const distanceFromBottom = windowHeight - rect.top;
        const animationRange = 400;
        const entryProgress = distanceFromBottom / animationRange;

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const distToPageBottom = docHeight - (scrollTop + windowHeight);

        let bottomFactor = 0;
        if (distToPageBottom < 50) {
          bottomFactor = 1 - distToPageBottom / 50;
        }

        let progress = Math.max(entryProgress, bottomFactor);
        progress = Math.max(0, Math.min(1, progress));
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const MAX_TRANSLATE_1 = -48;
        const MAX_TRANSLATE_2 = -96;
        const MAX_TRANSLATE_3 = -144;

        layer1.style.transform = `translateY(${easedProgress * MAX_TRANSLATE_1
          }px)`;
        layer2.style.transform = `translateY(${easedProgress * MAX_TRANSLATE_2
          }px)`;
        layer3.style.transform = `translateY(${easedProgress * MAX_TRANSLATE_3
          }px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.footerWrapper} ref={wrapperRef}>
      {/* Stack Layers */}
      <div
        ref={layer3Ref}
        className={`${styles.stackLayer} ${styles.stackLayer3}`}
      ></div>
      <div
        ref={layer2Ref}
        className={`${styles.stackLayer} ${styles.stackLayer2}`}
      ></div>
      <div
        ref={layer1Ref}
        className={`${styles.stackLayer} ${styles.stackLayer1}`}
      ></div>

      {/* Main Content Area */}
      <footer
        className={`${styles.mainFooterContent} px-6 md:px-12 shadow-2xl`}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Expanded Layout */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 lg:gap-20 mb-12">
            {/* Left: Branding */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 select-none">
                {/* Logo Mark */}
                <div
                  className={styles.footerLogoMark}
                  role="img"
                  aria-label="A&A Hospitality Logo"
                />
                {/* Wordmark */}
                <div
                  className={styles.footerWordmark}
                  role="img"
                  aria-label="A&A Hospitality"
                />
              </div>
              <span
                className={`${styles.fontSerifDisplay} text-lg md:text-2xl italic font-light opacity-80 ${styles.textKhakiBeige}`}
              >
                {t.footer.slogan}
              </span>
            </div>

            {/* Right: Links */}
            <div className="flex gap-12 md:gap-20 text-sm md:text-base opacity-90 text-white/90">
              <div className="flex flex-col gap-3">
                <Link
                  href="/#global-reach"
                  onClick={(e) => handleHashLinkClick(e, "#global-reach")}
                  className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                >
                  {t.menu.globalReach}
                </Link>
                <Link
                  href="/#partners"
                  onClick={(e) => handleHashLinkClick(e, "#partners")}
                  className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                >
                  {t.menu.partners}
                </Link>
                <Link
                  href="/#our-story"
                  onClick={(e) => handleHashLinkClick(e, "#our-story")}
                  className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                >
                  {t.menu.ourStory}
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/blog"
                  className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                >
                  Blog
                </Link>
                <Link
                  href="/#contact"
                  onClick={(e) => handleHashLinkClick(e, "#contact")}
                  className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                >
                  {t.footer.contact}
                </Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`w-full h-px ${styles.textParchment} bg-current opacity-10 mb-8`}
          ></div>

          {/* Footer Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs opacity-60 uppercase tracking-widest relative text-white/60">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <span>{t.footer.copyright}</span>

              <div className="flex gap-6 items-center md:ml-6 md:border-l md:border-white/20 md:pl-6">
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>

                {/* Socials */}
                <div className="flex gap-4 items-center">
                  <Link
                    href="#"
                    className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                  >
                    <Instagram className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#"
                    className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#"
                    className={`transition-colors ${styles.hoverTextRosyTaupe}`}
                  >
                    <Twitter className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
