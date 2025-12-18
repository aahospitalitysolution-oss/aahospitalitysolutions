/**
 * Device Detection and Performance Utilities
 * 
 * Centralized utilities for detecting device capabilities and optimizing
 * animations based on device performance characteristics.
 */

// Cache detection results to avoid repeated calculations
let _isMobile: boolean | null = null;
let _isIOS: boolean | null = null;
let _isLowPowerDevice: boolean | null = null;
let _prefersReducedMotion: boolean | null = null;

/**
 * Detects if the current device is running iOS (iPhone, iPad, iPod).
 * iOS has native smooth scrolling, so Lenis adds unnecessary overhead.
 * Results are cached for performance.
 */
export const isIOSDevice = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (_isIOS === null) {
        const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera;
        // Check for iOS devices
        _isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream: boolean }).MSStream;

        // Also check for iPad on iOS 13+ (reports as Mac)
        if (!_isIOS && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
            _isIOS = true;
        }
    }

    return _isIOS;
};

/**
 * Detects if the current device is mobile based on screen size and touch capability.
 * Results are cached for performance.
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (_isMobile === null) {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        _isMobile = isTouchDevice && isSmallScreen;
    }

    return _isMobile;
};

/**
 * Detects if the device is likely a low-power device (older phones, tablets)
 * based on hardware concurrency, device memory, and connection type.
 */
export const isLowPowerDevice = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (_isLowPowerDevice === null) {
        // Extended Navigator interface for non-standard properties
        interface ExtendedNavigator extends Navigator {
            deviceMemory?: number;
            connection?: {
                effectiveType: string;
                saveData: boolean;
            };
            mozConnection?: {
                effectiveType: string;
                saveData: boolean;
            };
            webkitConnection?: {
                effectiveType: string;
                saveData: boolean;
            };
        }

        const nav = navigator as ExtendedNavigator;

        // Check hardware concurrency (number of logical processors)
        const lowCores = nav.hardwareConcurrency ? nav.hardwareConcurrency <= 4 : false;

        // Check device memory (in GB) - only available in some browsers
        const lowMemory = nav.deviceMemory ? nav.deviceMemory <= 4 : false;

        // Check for slow connection
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        const slowConnection = connection ?
            (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || connection.saveData) :
            false;

        // Consider it low power if any two conditions are true, or if it's mobile
        const factors = [lowCores, lowMemory, slowConnection, isMobileDevice()].filter(Boolean).length;
        _isLowPowerDevice = factors >= 2;
    }

    return _isLowPowerDevice;
};

/**
 * Checks if user prefers reduced motion.
 * Results are cached but can be refreshed.
 */
export const prefersReducedMotion = (refresh = false): boolean => {
    if (typeof window === 'undefined') return false;

    if (_prefersReducedMotion === null || refresh) {
        _prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    return _prefersReducedMotion;
};

/**
 * Reset cached values (useful for testing or when window resizes significantly)
 */
export const resetDeviceCache = (): void => {
    _isMobile = null;
    _isIOS = null;
    _isLowPowerDevice = null;
    _prefersReducedMotion = null;
};

/**
 * Performance configuration based on device capabilities
 */
export interface PerformanceConfig {
    /** Number of frames to use for canvas animation */
    frameCount: number;
    /** Key frame interval for progressive loading */
    keyFrameInterval: number;
    /** ScrollTrigger scrub value */
    scrubValue: number;
    /** Lenis duration */
    lenisDuration: number;
    /** Whether to use complex animations */
    useComplexAnimations: boolean;
    /** Whether to enable smooth scroll on touch */
    enableSmoothTouch: boolean;
    /** RAF throttle interval in ms (0 = no throttle) */
    rafThrottleMs: number;
}

/**
 * Get optimized performance configuration based on device capabilities
 */
export const getPerformanceConfig = (): PerformanceConfig => {
    const mobile = isMobileDevice();
    const lowPower = isLowPowerDevice();
    const reducedMotion = prefersReducedMotion();

    if (reducedMotion) {
        return {
            frameCount: 1, // Static image
            keyFrameInterval: 1,
            scrubValue: 0,
            lenisDuration: 0,
            useComplexAnimations: false,
            enableSmoothTouch: false,
            rafThrottleMs: 0,
        };
    }

    if (lowPower) {
        return {
            frameCount: 100, // Significantly reduced
            keyFrameInterval: 8,
            scrubValue: 0.3,
            lenisDuration: 1.0,
            useComplexAnimations: false,
            enableSmoothTouch: false,
            rafThrottleMs: 32, // ~30fps
        };
    }

    if (mobile) {
        return {
            frameCount: 200, // Reduced for mobile
            keyFrameInterval: 6,
            scrubValue: 0.5,
            lenisDuration: 1.2,
            useComplexAnimations: true,
            enableSmoothTouch: false,
            rafThrottleMs: 16, // ~60fps
        };
    }

    // Desktop - full experience
    return {
        frameCount: 385,
        keyFrameInterval: 4,
        scrubValue: 1.0,
        lenisDuration: 1.8,
        useComplexAnimations: true,
        enableSmoothTouch: false,
        rafThrottleMs: 0,
    };
};

/**
 * Throttled requestAnimationFrame wrapper
 * Limits callback execution to specified interval
 */
export const createThrottledRAF = (callback: (time: number) => void, throttleMs: number) => {
    let lastTime = 0;
    let rafId: number | null = null;
    let isRunning = false;

    const tick = (time: number) => {
        if (!isRunning) return;

        if (throttleMs === 0 || time - lastTime >= throttleMs) {
            callback(time);
            lastTime = time;
        }

        rafId = requestAnimationFrame(tick);
    };

    return {
        start: () => {
            if (isRunning) return;
            isRunning = true;
            rafId = requestAnimationFrame(tick);
        },
        stop: () => {
            isRunning = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },
        isRunning: () => isRunning,
    };
};
