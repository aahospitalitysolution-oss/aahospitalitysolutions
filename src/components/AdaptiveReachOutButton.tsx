"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdaptiveColor } from "@/hooks/useAdaptiveColor";
import SmartButton from "@/components/SmartButton";
import { useMenuContext } from "@/contexts/MenuContext";

export const AdaptiveReachOutButton = () => {
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);
    const { isMenuOpen } = useMenuContext();
    const [isContactVisible, setIsContactVisible] = useState(false);

    // lightColor: returned when background is DARK
    // darkColor: returned when background is LIGHT
    const colorState = useAdaptiveColor(ref, {
        lightColor: "light",
        darkColor: "dark",
    });

    // If colorState is "light", background is dark -> Use Light Theme (Parchment button)
    // If colorState is "dark", background is light -> Use Dark Theme (Charcoal button)
    const isDarkBg = colorState === "light";

    // Monitor contact section visibility
    useEffect(() => {
        const checkContactVisibility = () => {
            const contactSection = document.getElementById('contact');
            if (!contactSection) return;

            const rect = contactSection.getBoundingClientRect();
            // Check if contact section is significantly in view (e.g. top part enters viewport)
            // Or simpler: if any part is visible. But usually "Reach Out" should hide when we are AT contact section.
            // Let's say if it takes up more than 10% of viewport or top is hitting viewport actions.
            // A simple overlap check:
            const isVisible = (
                rect.top <= (window.innerHeight - 100) && // Top is within viewport (minus some buffer)
                rect.bottom >= 0
            );
            setIsContactVisible(isVisible);
        };

        window.addEventListener('scroll', checkContactVisibility);
        window.addEventListener('resize', checkContactVisibility);
        checkContactVisibility(); // Initial check

        return () => {
            window.removeEventListener('scroll', checkContactVisibility);
            window.removeEventListener('resize', checkContactVisibility);
        };
    }, []);

    const isHidden = isMenuOpen || isContactVisible;

    return (
        <div ref={ref} style={{
            display: "contents",
        }}>
            <div className="reveal">
                <div style={{
                    transition: "opacity 0.4s ease-in-out, visibility 0.4s",
                    opacity: isHidden ? 0 : 1,
                    visibility: isHidden ? 'hidden' : 'visible',
                }}>
                    <SmartButton
                        text="Reach Out"
                        alignment="center"
                        onClick={() => router.push("/#contact")}
                        size="small"
                        theme={isDarkBg ? "light" : "dark"}
                        backgroundColor={isDarkBg ? "var(--parchment)" : "var(--charcoal-blue)"}
                        textColor={isDarkBg ? "var(--charcoal-blue)" : "var(--parchment)"}
                        hoverColor={isDarkBg ? "var(--rosy-taupe)" : "var(--parchment)"}
                        hoverTextColor="var(--charcoal-blue)"
                    />
                </div>
            </div>
        </div>
    );
};
