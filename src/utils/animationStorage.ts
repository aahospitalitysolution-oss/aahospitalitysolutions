/**
 * sessionStorage helpers for tracking loader animation state
 * Resets automatically when browser tab/window is closed
 */

const LOADER_KEY = "hasSeenLoader";
const BOXES_IN_LOGO_KEY = "boxesInLogo";
const LOADER_JUST_PLAYED_KEY = "loaderJustPlayed";

/**
 * Check if user has already seen the loader animation in this session
 */
export const hasSeenLoader = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LOADER_KEY) === "true";
};

/**
 * Mark that the user has seen the loader animation
 */
export const markLoaderSeen = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOADER_KEY, "true");
};

/**
 * Check if boxes have been moved to logo already
 */
export const boxesInLogo = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BOXES_IN_LOGO_KEY) === "true";
};

/**
 * Mark that boxes have been moved to logo
 */
export const markBoxesInLogo = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BOXES_IN_LOGO_KEY, "true");
};

/**
 * Reset the flag that tracks whether boxes are already in the logo slot.
 * Useful when the page is being unloaded (e.g. reload) so animations replay.
 */
export const resetBoxesInLogo = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOXES_IN_LOGO_KEY);
};

/**
 * Mark that the loader has just completed on this page load
 */
export const markLoaderJustPlayed = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOADER_JUST_PLAYED_KEY, "true");
};

/**
 * Consume and clear the "loader just played" flag.
 * Returns true only once immediately after loader completes.
 */
export const consumeLoaderJustPlayed = (): boolean => {
  if (typeof window === "undefined") return false;
  const val = sessionStorage.getItem(LOADER_JUST_PLAYED_KEY) === "true";
  if (val) sessionStorage.removeItem(LOADER_JUST_PLAYED_KEY);
  return val;
};
