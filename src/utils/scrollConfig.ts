/**
 * Centralized Scroll Configuration
 * 
 * This file contains unified configuration for Lenis smooth scroll and GSAP ScrollTrigger
 * to ensure consistent scroll behavior across all sections of the website.
 * 
 * Requirements: 4.1, 4.2
 */

/**
 * Lenis Configuration Interface
 * Defines the structure for Lenis smooth scroll initialization
 */
export interface LenisConfig {
  /** Animation duration in seconds (1.2-2.0 recommended) */
  duration: number;
  /** Easing function for scroll animation */
  easing: (t: number) => number;
  /** Linear interpolation value for smoothness (0.05-0.15 recommended) */
  lerp: number;
  /** Scroll orientation */
  orientation: 'vertical' | 'horizontal';
  /** Gesture orientation */
  gestureOrientation: 'vertical' | 'horizontal';
  /** Enable smooth wheel scrolling */
  smoothWheel: boolean;
  /** Mouse wheel sensitivity multiplier (0.8-1.2 recommended) */
  wheelMultiplier: number;
  /** Enable smooth touch scrolling */
  smoothTouch: boolean;
  /** Touch sensitivity multiplier (1.5-2.5 recommended) */
  touchMultiplier: number;
  /** Enable infinite scroll */
  infinite: boolean;
}

/**
 * ScrollTrigger Configuration Interface
 * Defines unified settings for GSAP ScrollTrigger instances
 */
export interface ScrollTriggerConfig {
  /** Consistent scrub value across all triggers (0.5-1.5 recommended) */
  scrubValue: number;
  /** Pin anticipation value */
  anticipatePin: number;
  /** Enable pin spacing */
  pinSpacing: boolean;
  /** Refresh order priority */
  refreshPriority: number;
  /** Ignore mobile resize events (prevents jumps from iOS dynamic bars) */
  ignoreMobileResize?: boolean;
}

/**
 * Scroll Phase Types
 * Represents different phases of the scroll experience
 */
export type ScrollPhase = 'resize' | 'timeline' | 'story' | 'badges' | 'complete';

/**
 * Scroll State Interface
 * Tracks the current state of scroll animations
 */
export interface ScrollState {
  /** Current scroll phase */
  currentPhase: ScrollPhase;
  /** Progress within current phase (0-1) */
  progress: number;
  /** Total progress across entire scroll experience (0-1) */
  totalProgress: number;
  /** Current scroll velocity */
  velocity: number;
}

/**
 * Animation Timing Interface
 * Defines timing parameters for scroll-based animations
 */
export interface AnimationTiming {
  /** Animation phase identifier */
  phase: ScrollPhase;
  /** When animation starts (0-1) */
  startProgress: number;
  /** When animation ends (0-1) */
  endProgress: number;
  /** Scroll distance in viewport heights */
  duration: number;
  /** Scrub value for this animation */
  scrub: number;
}

/**
 * Unified Lenis Configuration
 * 
 * Based on design document recommendations:
 * - Duration: 1.5 (balanced between smoothness and responsiveness)
 * - Lerp: 0.12 (slightly faster interpolation for better performance)
 * - Wheel Multiplier: 0.8 (reduced for more control)
 */
export const LENIS_CONFIG: LenisConfig = {
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  lerp: 0.12,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.8,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
};

/**
 * Mobile-optimized Lenis Configuration
 * 
 * Reduced values for better mobile performance:
 * - Duration: 1.2 (reduced from 1.8 to lower interpolation overhead)
 * - Lerp: 0.15 (increased for faster response)
 * - smoothTouch: false (critical for mobile - let native touch handle scrolling)
 */
export const LENIS_CONFIG_MOBILE: LenisConfig = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  lerp: 0.15,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.0,
  smoothTouch: false, // Critical: never enable smooth touch on mobile
  touchMultiplier: 2,
  infinite: false,
};

/**
 * Unified ScrollTrigger Configuration
 * 
 * Based on design document recommendations:
 * - Scrub Value: 1.0 (unified across all sections, reduced from 1.5)
 */
export const SCROLL_TRIGGER_CONFIG: ScrollTriggerConfig = {
  scrubValue: 1.0,
  anticipatePin: 1,
  pinSpacing: true,
  refreshPriority: 0,
  ignoreMobileResize: false,
};

/**
 * Mobile-optimized ScrollTrigger Configuration
 * 
 * Reduced scrub for snappier mobile response:
 * - Scrub Value: 0.5 (reduced from 1.0 to minimize interpolation)
 * - ignoreMobileResize: true (prevents jumps when iOS dynamic bars appear/disappear)
 */
export const SCROLL_TRIGGER_CONFIG_MOBILE: ScrollTriggerConfig = {
  scrubValue: 0.5,
  anticipatePin: 1,
  pinSpacing: true,
  refreshPriority: 0,
  ignoreMobileResize: true, // Critical: prevents viewport jump recalculations on iOS
};

/**
 * Get the appropriate Lenis config based on device
 */
export const getLenisConfig = (isMobile: boolean): LenisConfig => {
  return isMobile ? LENIS_CONFIG_MOBILE : LENIS_CONFIG;
};

/**
 * Get the appropriate ScrollTrigger config based on device
 */
export const getScrollTriggerConfig = (isMobile: boolean): ScrollTriggerConfig => {
  return isMobile ? SCROLL_TRIGGER_CONFIG_MOBILE : SCROLL_TRIGGER_CONFIG;
};

/**
 * Scroll Distance Allocations
 * Defines the scroll distance (in viewport heights) for each section
 */
export const SCROLL_DISTANCES = {
  /** Hero resize phase scroll distance */
  HERO_RESIZE_PHASE: 100, // vh
  /** Hero timeline phase scroll distance */
  HERO_TIMELINE_PHASE: 1500, // vh
  /** Badge cloud section scroll distance */
  BADGE_CLOUD: 5000, // vh
} as const;

/**
 * Performance Configuration
 * Settings for optimizing scroll performance
 */
export const PERFORMANCE_CONFIG = {
  /** Debounce delay for resize handlers (ms) */
  RESIZE_DEBOUNCE: 100,
  /** Minimum FPS threshold for performance monitoring */
  MIN_FPS_THRESHOLD: 30,
  /** Enable GPU acceleration */
  FORCE_3D: true,
} as const;

/**
 * Device-Specific Multipliers
 * Adjustments for different input devices
 */
export const DEVICE_MULTIPLIERS = {
  /** Mouse wheel multiplier */
  MOUSE: 0.8,
  /** Touchpad multiplier */
  TOUCHPAD: 0.8,
  /** Touch device multiplier */
  TOUCH: 2,
} as const;

/**
 * Helper function to check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Helper function to detect device type
 */
export const getDeviceType = (): 'mouse' | 'touchpad' | 'touch' => {
  if (typeof window === 'undefined') return 'mouse';

  // Check for touch capability
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return 'touch';
  }

  // Default to mouse (touchpad detection is complex and not reliable)
  return 'mouse';
};

/**
 * Get appropriate multiplier based on device type
 */
export const getDeviceMultiplier = (): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'touch':
      return DEVICE_MULTIPLIERS.TOUCH;
    case 'touchpad':
      return DEVICE_MULTIPLIERS.TOUCHPAD;
    case 'mouse':
    default:
      return DEVICE_MULTIPLIERS.MOUSE;
  }
};
