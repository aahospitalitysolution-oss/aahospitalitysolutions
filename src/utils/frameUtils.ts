/**
 * Utility functions for frame calculations in scroll-driven animations.
 * These are pure functions that can be easily tested.
 */

/**
 * Gets the nearest loaded frame index to a target frame.
 * 
 * For any target frame index `t` and set of loaded frame indices `L`,
 * when `t ∉ L`, the displayed frame SHALL be the element of `L` 
 * with minimum absolute distance to `t`.
 * 
 * @param targetFrame - The desired frame index
 * @param loadedFrames - Set of frame indices that are currently loaded
 * @param frameCount - Total number of frames (upper bound, exclusive)
 * @returns The nearest loaded frame index, or 0 if no frames are loaded
 * 
 * Requirements: 5.2
 */
export function getNearestLoadedFrame(
  targetFrame: number,
  loadedFrames: Set<number>,
  frameCount: number
): number {
  // If target frame is already loaded, return it directly
  if (loadedFrames.has(targetFrame)) {
    return targetFrame;
  }

  // If no frames are loaded, return 0 as fallback
  if (loadedFrames.size === 0) {
    return 0;
  }

  // Search outward from target for nearest loaded frame
  let lower = targetFrame;
  let upper = targetFrame;

  while (lower >= 0 || upper < frameCount) {
    if (lower >= 0 && loadedFrames.has(lower)) {
      return lower;
    }
    if (upper < frameCount && loadedFrames.has(upper)) {
      return upper;
    }
    lower--;
    upper++;
  }

  // Fallback to first loaded frame if search didn't find anything
  // (shouldn't happen if loadedFrames.size > 0, but defensive)
  const firstLoaded = loadedFrames.values().next().value;
  return firstLoaded !== undefined ? firstLoaded : 0;
}
