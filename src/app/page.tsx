"use client";

import { useRef } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { Landing } from "@/components/landing/Landing";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { AdaptiveItem } from "@/components/AdaptiveItem";

export default function Home() {
  const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } =
    useAnimationContext();
  const { isMenuOpen } = useMenuContext();
  const logoTargetRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

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
        <div
          className={`logo-slot transition-opacity duration-300 ${
            isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          ref={logoTargetRef}
          role="img"
          aria-label="A&A Hospitality logo animation"
        />
        <div className="nav-items">
          <AdaptiveItem>
            <MenuButton className="reveal" />
          </AdaptiveItem>
        </div>
        <div className="nav-divider" aria-hidden="true" />
      </nav>

      {/* Main Content */}
      <main id="main-content" className="content-wrapper">
        <Landing navRef={navRef} />
      </main>
    </div>
  );
}
