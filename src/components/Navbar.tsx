"use client";

import Link from "next/link";
import { useMenuContext } from "@/contexts/MenuContext";
import { AdaptiveReachOutButton } from "@/components/AdaptiveReachOutButton";
import { AdaptiveItem } from "@/components/AdaptiveItem";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { useRef } from "react";
import { useAdaptiveColor } from "@/hooks/useAdaptiveColor";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { usePageTransition } from "@/hooks/usePageTransition";

export const Navbar = () => {
    const { isMenuOpen } = useMenuContext();
    const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } = useAnimationContext();
    const logoRef = useRef<HTMLDivElement>(null);

    // Adaptive color for logo
    const color = useAdaptiveColor(logoRef, {
        lightColor: "#ffffff",
        darkColor: "#28536b", // charcoal-blue
    });

    // Page transition (plays after loader completes or immediately if loader was skipped)
    usePageTransition({
        shouldPlay: !shouldPlayLoader || loaderComplete,
        stageRef,
        boxRef,
        blueRef,
        logoTargetRef: logoRef,
    });

    return (
        <nav className="site-nav" role="navigation" aria-label="Main navigation">
            <Link
                href="/"
                className={`logo-link-wrapper transition-opacity duration-300 ${isMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                aria-label="Home"
            >
                <div
                    ref={logoRef}
                    className="logo-slot relative w-full h-full"
                    role="img"
                    aria-label="A&A Hospitality logo animation"
                    style={{
                        "--logo-square": color === "#ffffff" ? "#ffffff" : "#28536b",
                        "--logo-text-blue": color === "#ffffff" ? "#ffffff" : "#2b556d",
                        "--logo-text-grey": color === "#ffffff" ? "#ffffff" : "#8e9aae",
                        transition: "color 0.3s ease"
                    } as React.CSSProperties}
                />
            </Link>

            <div
                className="nav-items"
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
                <div className="hidden md:block">
                    <AdaptiveReachOutButton />
                </div>
                <AdaptiveItem>
                    <MenuButton className="reveal" />
                </AdaptiveItem>
            </div>
            <div className="nav-divider" aria-hidden="true" />
        </nav>
    );
};
