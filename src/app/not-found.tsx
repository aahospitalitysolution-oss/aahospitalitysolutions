"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Hotel } from "lucide-react";
import SmartButton from "@/components/SmartButton";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MenuButton } from "@/components/MenuButton/MenuButton";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const animationRef = useRef<number | null>(null);

  // Animation context for logo transition
  const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } =
    useAnimationContext();
  const { isMenuOpen } = useMenuContext();
  const logoTargetRef = useRef<HTMLDivElement | null>(null);

  // Page transition (plays after loader completes or immediately if loader was skipped)
  usePageTransition({
    shouldPlay: !shouldPlayLoader || loaderComplete,
    stageRef,
    boxRef,
    blueRef,
    logoTargetRef,
  });

  // Spotlight position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement for the spotlight effect
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Create the mask gradient based on smooth position
  const maskImage = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(circle 350px at ${x}px ${y}px, black 0%, transparent 80%)`
  );

  const webkitMaskImage = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(circle 350px at ${x}px ${y}px, black 0%, transparent 80%)`
  );

  useEffect(() => {
    setMounted(true);

    // Detect mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || "ontouchstart" in window;
      setIsMobile(mobile);
      return mobile;
    };

    const mobile = checkMobile();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Initial centering
    mouseX.set(centerX);
    mouseY.set(centerY);

    if (mobile) {
      // Mobile: Auto-animate the spotlight in a gentle figure-8 pattern
      let startTime = Date.now();
      const radiusX = Math.min(window.innerWidth * 0.15, 100);
      const radiusY = Math.min(window.innerHeight * 0.1, 60);

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        // Slow, gentle figure-8 motion
        const x = centerX + Math.sin(elapsed * 0.3) * radiusX;
        const y = centerY + Math.sin(elapsed * 0.6) * radiusY * 0.5;
        mouseX.set(x);
        mouseY.set(y);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Desktop: Follow mouse
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mouseX, mouseY]);

  // Brand Colors
  const colors = {
    charcoal: "#28536b",
    deepCharcoal: "#1a3646",
    parchment: "#f6f0ed",
    rosyTaupe: "#c2948a",
    steel: "#7ea8be",
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* Sticky Navbar */}
      <nav className="site-nav" role="navigation" aria-label="Main navigation">
        <Link
          href="/"
          className="logo-link-wrapper"
          style={{
            pointerEvents: isMenuOpen ? "none" : "auto",
            visibility: isMenuOpen ? "hidden" : "visible",
            opacity: isMenuOpen ? 0 : 1,
            transition: `opacity 0.3s ease, visibility 0s linear ${
              isMenuOpen ? "0.3s" : "0s"
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
                "--logo-square": "#ffffff",
                "--logo-text-blue": "#ffffff",
                "--logo-text-grey": "#ffffff",
                transition: "color 0.3s ease",
              } as React.CSSProperties
            }
          />
        </Link>
        <div
          className="nav-items"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            color: "var(--parchment)",
          }}
        >
          <LanguageToggle className="reveal" />
          <MenuButton className="reveal" />
        </div>
        <div className="nav-divider" aria-hidden="true" />
      </nav>

      <main
        ref={containerRef}
        className={`relative flex h-svh w-full flex-col items-center justify-center overflow-hidden selection:bg-transparent ${
          !isMobile ? "cursor-none" : ""
        }`}
        style={{ backgroundColor: colors.deepCharcoal }}
      >
        {/* =========================================
            LAYER 1: THE "DARK" ROOM (Base State) 
            Visible where the spotlight IS NOT
           ========================================= */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none z-0">
          <h1 className="font-serif text-[25vw] leading-none text-[#28536b] blur-sm">
            404
          </h1>
        </div>

        {/* =========================================
            LAYER 2: THE "ILLUMINATED" ROOM (Reveal State) 
            Visible only inside the Mask
           ========================================= */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#28536b]"
          style={{
            maskImage: maskImage,
            WebkitMaskImage: webkitMaskImage,
          }}
        >
          {/* Background Texture (Subtle Noise/Grain for film feel) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          {/* Decorative Grid Lines (Architectural Blueprint feel) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-1/4 w-px h-full bg-[#c2948a] opacity-10"></div>
            <div className="absolute top-0 right-1/4 w-px h-full bg-[#c2948a] opacity-10"></div>
            <div className="absolute top-1/3 left-0 w-full h-px bg-[#c2948a] opacity-10"></div>
            <div className="absolute bottom-1/3 left-0 w-full h-px bg-[#c2948a] opacity-10"></div>
          </div>

          {/* The Main Content */}
          <div className="relative flex flex-col items-center text-center p-8 md:p-12 border border-[#c2948a]/20 backdrop-blur-sm bg-[#28536b]/40 max-w-2xl mx-4 rounded-sm">
            {/* Hotel Icon */}
            <div className="mb-6 text-[#c2948a]">
              <Hotel size={48} strokeWidth={1} />
            </div>

            <h1 className="font-serif text-7xl md:text-9xl text-[#f6f0ed] mb-2 tracking-tighter">
              404
            </h1>

            <h2 className="font-serif text-xl md:text-3xl text-[#c2948a] mb-6 italic">
              This wing is currently closed.
            </h2>

            <p className="font-sans text-[#7ea8be] max-w-md text-base md:text-lg font-light leading-relaxed mb-10">
              You have ventured into an architectural void. <br />
              Let us escort you back to the main lobby.
            </p>

            {/* SmartButton for navigation */}
            <div className="pointer-events-auto">
              <SmartButton
                text="Return to Reception"
                onClick={() => router.push("/")}
                theme="dark"
                backgroundColor="#c2948a"
                textColor="#28536b"
                hoverColor="#f6f0ed"
                hoverTextColor="#28536b"
              />
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#c2948a]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#c2948a]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#c2948a]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#c2948a]"></div>
          </div>

          {/* Floating "Dust" Particles (Atmosphere) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#c2948a] rounded-full opacity-40"
                initial={{
                  x:
                    Math.random() *
                    (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y:
                    Math.random() *
                    (typeof window !== "undefined" ? window.innerHeight : 800),
                }}
                animate={{
                  y: [null, Math.random() * -100],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* =========================================
            CUSTOM CURSOR (Desktop only)
           ========================================= */}
        {!isMobile && (
          <motion.div
            className="fixed top-0 left-0 z-50 pointer-events-none mix-blend-screen"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            {/* The glow center */}
            <div className="w-8 h-8 bg-[#c2948a] rounded-full blur-md opacity-50" />
            {/* The outer halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#c2948a] rounded-full blur-3xl opacity-10" />
          </motion.div>
        )}
      </main>
    </div>
  );
}
