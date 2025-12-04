# Implementation Plan

- [x] 1. Update optimization script to generate both resolution tiers
- [x] 1.1 Modify optimize-frames.sh to generate desktop frames at quality 70
  - Change `-q:v 80` to `-q:v 70`
  - Keep resolution at 1920×1080
  - _Requirements: 2.1, 2.3_

- [x] 1.2 Add mobile frame generation to optimize-frames.sh
  - Create `$OUTPUT_DIR/mobile/` directory
  - Generate frames at 1280×720 resolution
  - Use quality setting of 65
  - _Requirements: 2.2, 5.1, 5.2_

- [x] 1.3 Add size reporting for both tiers
  - Report frame count and total size for desktop tier
  - Report frame count and total size for mobile tier
  - _Requirements: 2.5, 5.3_

- [x] 1.4 Ensure consistent naming across tiers
  - Both tiers use `frame_%04d.webp` naming pattern
  - Verify frame numbering is sequential
  - _Requirements: 5.4, 5.5_

- [x] 2. Add device detection to useImagePreloader
- [x] 2.1 Create resolution configuration constants
  - Define MOBILE_BREAKPOINT = 768
  - Define path constants for mobile and desktop
  - _Requirements: 3.1_

- [x] 2.2 Implement detectIsMobile function
  - Check window.innerWidth against breakpoint
  - Handle SSR case (default to desktop)
  - Lock value at initialization (use useRef)
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 2.3 Write property test for frame path selection
  - **Property 1: Frame path selection based on viewport width**
  - **Validates: Requirements 1.1, 1.2, 3.2, 3.4, 3.5**
  - Generate random viewport widths
  - Verify path contains '/mobile/' iff width < 768

- [ ]* 2.4 Write property test for resolution locking
  - **Property 2: Resolution tier is locked at initialization**
  - **Validates: Requirements 3.3**
  - Initialize with random width, simulate resize
  - Verify path remains consistent with initial determination

- [x] 3. Update frame path construction
- [x] 3.1 Create getFramePath utility function
  - Accept frame index and isMobile boolean
  - Return correct path based on resolution tier
  - _Requirements: 1.1, 1.2, 3.4, 3.5_

- [x] 3.2 Update currentFrame function to use getFramePath
  - Pass isMobile state to getFramePath
  - Maintain backward compatibility
  - _Requirements: 1.1, 1.2_

- [x] 3.3 Add fallback handling for missing mobile frames
  - On image load error, retry with desktop path
  - Log warning when fallback occurs
  - _Requirements: 1.3, 1.4_

- [x] 4. Verify key frame loading logic
- [x] 4.1 Confirm KEY_FRAME_INTERVAL is set to 4
  - Verify key frames are indices where index % 4 === 0
  - Verify last frame is always included
  - _Requirements: 4.1_

- [ ]* 4.2 Write property test for key frame intervals
  - **Property 3: Key frames are loaded at correct intervals**
  - **Validates: Requirements 4.1**
  - Generate random frame counts
  - Verify key frame set matches expected pattern

- [x] 4.3 Verify getNearestLoadedFrame function
  - Confirm it returns valid loaded frame index
  - Confirm it minimizes distance to target
  - _Requirements: 4.2_

- [ ]* 4.4 Write property test for nearest frame lookup
  - **Property 4: Nearest loaded frame lookup returns valid frame**
  - **Validates: Requirements 4.2**
  - Generate random loaded frame sets and targets
  - Verify result is in loaded set and minimizes distance

- [x] 5. Verify loading completion behavior
- [x] 5.1 Confirm phase 2 loads all remaining frames
  - Verify loadedFrames set contains all indices after completion
  - Verify allFramesLoaded state becomes true
  - _Requirements: 4.3, 4.5_

- [ ]* 5.2 Write property test for phase completion
  - **Property 5: All frames loaded after phase 2 completion**
  - **Validates: Requirements 4.3**
  - Generate random frame counts
  - Simulate loading completion
  - Verify all frames in loaded set

- [x] 5.3 Verify progress reporting
  - Confirm progress increases from 0 to 100 during phase 1
  - Confirm progress callback is called
  - _Requirements: 4.4_

- [ ]* 5.4 Write property test for progress monotonicity
  - **Property 6: Progress increases monotonically during loading**
  - **Validates: Requirements 4.4**
  - Generate random load event sequences
  - Verify progress never decreases

- [ ] 6. Generate optimized frames
- [ ] 6.1 Run optimization script to generate both tiers
  - Execute updated optimize-frames.sh
  - Verify desktop frames at 1080p
  - Verify mobile frames at 720p
  - _Requirements: 1.3, 1.4, 2.2, 2.3_

- [ ] 6.2 Verify file sizes meet targets
  - Desktop: ~40-60KB per frame
  - Mobile: ~20-35KB per frame
  - _Requirements: 2.1, 2.2_

- [ ] 7. Integration testing
- [ ] 7.1 Test on mobile viewport
  - Verify mobile frames load (check network tab)
  - Verify animation plays smoothly
  - _Requirements: 1.1, 1.3_

- [ ] 7.2 Test on desktop viewport
  - Verify desktop frames load (check network tab)
  - Verify animation plays smoothly
  - _Requirements: 1.2, 1.4_

- [ ] 7.3 Test fallback behavior
  - Temporarily remove mobile frames
  - Verify desktop frames load as fallback
  - _Requirements: 1.3, 1.4_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
