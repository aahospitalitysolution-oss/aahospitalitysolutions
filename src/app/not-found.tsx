"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Hotel, Flashlight } from "lucide-react";
import SmartButton from "@/components/SmartButton";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MenuButton } from "@/components/MenuButton/MenuButton";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement for the spotlight effect (Lag effect for elegance)
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Create the mask gradient based on smooth mouse position
  // We use useTransform here so it updates reactively with the spring values
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

  // Auto-pan animation state for mobile/idle users
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initial centering
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsHovering(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setIsHovering(true);
      if (e.touches[0]) {
        mouseX.set(e.touches[0].clientX);
        mouseY.set(e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mouseX, mouseY]);

  // Brand Colors
  const colors = {
    charcoal: "#28536b",
    deepCharcoal: "#1a3646", // Darker version for the 'off' state
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
        className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden cursor-none selection:bg-transparent"
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
            // Apply the transformed motion values here
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

          {/* The Main Content - Revealed in GOLD */}
          <div className="relative flex flex-col items-center text-center p-12 border border-[#c2948a]/20 backdrop-blur-sm bg-[#28536b]/40 max-w-2xl rounded-sm">
            {/* "Do Not Disturb" Iconography */}
            <div className="mb-6 text-[#c2948a]">
              <Hotel size={48} strokeWidth={1} />
            </div>

            <h1 className="font-serif text-8xl md:text-9xl text-[#f6f0ed] mb-2 tracking-tighter">
              404
            </h1>

            <h2 className="font-serif text-2xl md:text-3xl text-[#c2948a] mb-6 italic">
              This wing is currently closed.
            </h2>

            <p className="font-sans text-[#7ea8be] max-w-md text-lg font-light leading-relaxed mb-10">
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
            CUSTOM CURSOR (The "Lantern" visual)
            This floats on top of everything
           ========================================= */}
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

        {/* Mobile Hint (Visible only if user isn't moving mouse) */}
        {!isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 z-20 flex flex-col items-center text-[#c2948a]/50 animate-pulse pointer-events-none"
          >
            <Flashlight size={24} className="mb-2" />
            <span className="text-xs tracking-widest uppercase">
              Illuminate the screen
            </span>
          </motion.div>
        )}
      </main>
    </div>
  );
}
