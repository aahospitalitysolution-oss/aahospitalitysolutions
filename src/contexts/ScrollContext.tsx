"use client";

import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
    getLenisConfig,
    getScrollTriggerConfig,
} from "@/utils/scrollConfig";
import { isMobileDevice, isIOSDevice } from "@/utils/deviceUtils";
import { usePathname, useSearchParams } from "next/navigation";

// Define the context shape
interface ScrollContextType {
    lenis: Lenis | null;
    scrollTo: (target: string | HTMLElement | number, options?: any) => void;
    isSmoothResponse: boolean; // True if Lenis is active
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScrollContext = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error("useScrollContext must be used within ScrollProvider");
    }
    return context;
};

interface ScrollProviderProps {
    children: ReactNode;
}

export const ScrollProvider = ({ children }: ScrollProviderProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lenisRef = useRef<Lenis | null>(null);
    const isHandlingHash = useRef(false);

    // Initialize Lenis and ScrollTrigger
    useLayoutEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return;

        gsap.registerPlugin(ScrollTrigger);

        const isMobile = isMobileDevice();
        const isIOS = isIOSDevice();
        const lenisConfig = getLenisConfig(isMobile);
        const scrollTriggerConfig = getScrollTriggerConfig(isMobile);

        // Apply global ScrollTrigger config
        if (scrollTriggerConfig.ignoreMobileResize) {
            ScrollTrigger.config({ ignoreMobileResize: true });
        }

        // Initialize Lenis only if NOT on iOS (as per original logic)
        // or if you want to force it everywhere, remove the !isIOS check.
        // The original logic was: "Skip Lenis on iOS - native iOS scroll is already smooth"
        if (!isIOS) {
            const lenisInstance = new Lenis({
                ...(lenisConfig as any),
                // Ensure we don't prevent touch on non-smooth touch devices
                smoothTouch: lenisConfig.smoothTouch,
            });

            lenisRef.current = lenisInstance;
            setLenis(lenisInstance);

            // Sync Lenis with GSAP ScrollTrigger
            lenisInstance.on("scroll", ScrollTrigger.update);

            // Add to GSAP ticker
            const updateTicker = (time: number) => {
                lenisInstance.raf(time * 1000);
            };
            gsap.ticker.add(updateTicker);

            // Cleanup
            return () => {
                gsap.ticker.remove(updateTicker);
                lenisInstance.destroy();
                lenisRef.current = null;
                setLenis(null);
            };
        } else {
            // If we are on iOS/Native, we still want ScrollTrigger to work
            // No special setup needed for Native scroll other than default ScrollTrigger behavior
        }
    }, []);

    /**
     * Unified ScrollTo Function
     * Handles both Lenis and Native scrolling
     */
    const scrollTo = (target: string | HTMLElement | number, options: any = {}) => {
        const defaultOptions = {
            offset: 0,
            immediate: false,
            duration: 1.5,
            ...options,
        };

        // If Lenis is active, use it
        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, defaultOptions);
        } else {
            // Native Fallback
            let targetEl: HTMLElement | null = null;
            let targetPos = 0;

            if (typeof target === "number") {
                targetPos = target;
            } else if (typeof target === "string") {
                targetEl = document.querySelector(target);
            } else if (target instanceof HTMLElement) {
                targetEl = target;
            }

            if (targetEl) {
                // We need to account for GSAP Pinning Spacers manually if we aren't using Lenis
                // But often window.scrollTo is enough if we trust the browser.
                // For pinned sections, standard scrollIntoView can be tricky.
                // Let's try a smooth window scroll first.
                const rect = targetEl.getBoundingClientRect();
                const absoluteTop = window.pageYOffset + rect.top + defaultOptions.offset;

                window.scrollTo({
                    top: absoluteTop,
                    behavior: defaultOptions.immediate ? "auto" : "smooth",
                });
            } else if (typeof target === "number") {
                window.scrollTo({
                    top: target,
                    behavior: defaultOptions.immediate ? "auto" : "smooth",
                });
            }
        }
    };

    /**
     * Global Anchor Click Interceptor
     * Delegates all clicks on links starting with "#" to our unified scrollTo
     */
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (!link) return;

            const href = link.getAttribute("href");
            if (!href) return;

            // Check if it's a local hash link (e.g. "#contact" or "/#contact")
            // We want to handle:
            // 1. href="#contact"
            // 2. href="/#contact" (if we are already on "/")
            // 3. href="current-page#contact"

            const isLocalHash = href.startsWith("#");
            const isRootHash = href.startsWith("/#") && pathname === "/";

            if (isLocalHash || isRootHash) {
                const hash = isLocalHash ? href : href.substring(1); // remove leading /
                const targetId = hash; // e.g. "#contact"

                e.preventDefault();

                // Push state manually to update URL without jumping
                window.history.pushState(null, "", hash);

                scrollTo(targetId);
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, [pathname, lenis]);

    /**
     * Deep Linking / Hash Handling on Mount & Update
     * Checks for hash in URL and scrolls to it
     */
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && !isHandlingHash.current) {
            isHandlingHash.current = true;

            // Delay slightly to allow layout to settle (GSAP pinning etc)
            setTimeout(() => {
                const target = document.querySelector(hash);
                if (target) {
                    scrollTo(hash, { immediate: true });
                }
                isHandlingHash.current = false;
            }, 500); // 500ms allows for heavy initial animations/pinning to settle
        }
    }, [pathname, searchParams]); // Re-run if route changes

    return (
        <ScrollContext.Provider
            value={{
                lenis,
                scrollTo,
                isSmoothResponse: !!lenis,
            }}
        >
            {children}
        </ScrollContext.Provider>
    );
};
