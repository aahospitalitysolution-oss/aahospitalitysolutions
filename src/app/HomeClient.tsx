"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { Landing } from "@/components/landing/Landing";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { AdaptiveItem } from "@/components/AdaptiveItem";
import ContactSection from "@/components/ContactSection";
import Link from "next/link";
import { AdaptiveReachOutButton } from "@/components/AdaptiveReachOutButton";
import { useAdaptiveColor } from "@/hooks/useAdaptiveColor";

export default function HomeClient() {
  const router = useRouter();
  const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } =
    useAnimationContext();
  const { isMenuOpen } = useMenuContext();
  const logoTargetRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const logoMode = useAdaptiveColor(logoTargetRef, {
    lightColor: "inverted",
    darkColor: "original",
  });

  // Page transition (plays after loader completes or immediately if loader was skipped)
  usePageTransition({
    shouldPlay: !shouldPlayLoader || loaderComplete,
    stageRef,
    boxRef,
    blueRef,
    logoTargetRef,
  });

  return (
    <div className="min-h-screen bg-[var(--parchment)] text-[var(--foreground)]">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Sticky Navbar */}
      <nav
        ref={navRef}
        className="site-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="logo-link-wrapper"
          style={{
            pointerEvents: isMenuOpen ? "none" : "auto",
            visibility: isMenuOpen ? "hidden" : "visible",
            opacity: isMenuOpen ? 0 : 1,
            transition: `opacity 0.3s ease, visibility 0s linear ${isMenuOpen ? "0.3s" : "0s"
              }`,
          }}
          aria-label="Home"
        >
          <div
            className="logo-slot"
            ref={logoTargetRef}
            role="img"
            aria-label="A&A Hospitality logo animation"
            style={
              {
                "--logo-square":
                  logoMode === "inverted" ? "#ffffff" : "#28536b",
                "--logo-text-blue":
                  logoMode === "inverted" ? "#ffffff" : "#2b556d",
                "--logo-text-grey":
                  logoMode === "inverted" ? "#ffffff" : "#8e9aae",
                transition: "color 0.3s ease", // CSS vars don't animate automatically unless supported, but good to have
              } as React.CSSProperties
            }
          />
        </Link>
        <div
          className="nav-items"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div className="hidden md:block">
            <AdaptiveReachOutButton skipRevealAnimation={true} />
          </div>
          <AdaptiveItem>
            <MenuButton className="reveal" />
          </AdaptiveItem>
        </div>
        <div className="nav-divider" aria-hidden="true" />
      </nav>

      {/* Main Content */}
      <main id="main-content" className="content-wrapper">
        <Landing navRef={navRef} />
        <ContactSection />
      </main>
    </div>
  );
}
