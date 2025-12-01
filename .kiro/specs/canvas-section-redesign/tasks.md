# Implementation Plan

- [x] 1. Add text content to canvas section
- [x] 1.1 Add heading and body text JSX to Landing.tsx
  - Add heading: "At A&A Hospitality, we create residences that endure through time"
  - Add body: "Our residences combine timeless design, exceptional construction quality, and minimal maintenance needs, offering a space to live and create with comfort and confidence"
  - Position text above or beside the HeroImageContainer
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 1.2 Create CSS styles for text content in Landing.module.css
  - Add `.canvasTextContent` container styles
  - Add `.canvasHeading` styles (48px, font-weight 300, white color)
  - Add `.canvasBody` styles (20px, font-weight 200, white with opacity)
  - Use CSS custom properties for fonts and colors
  - _Requirements: 1.4, 1.5, 8.1, 8.2, 8.3_

- [x] 1.3 Make text responsive with clamp() for font sizes
  - Heading: `clamp(2rem, 4vw, 3rem)`
  - Body: `clamp(1rem, 2vw, 1.25rem)`
  - _Requirements: 2.5_

- [x] 2. Update animation logic to hide text during resize phase
- [x] 2.1 Add text visibility control in Landing.tsx scroll handler
  - Hide text when `currentPhase === 'resize'`
  - Show text when `currentPhase === 'timeline'`
  - Use GSAP to animate opacity
  - _Requirements: 5.1, 5.2, 5.5_

- [ ]* 2.2 Write property test for text visibility during phases
  - **Property 4: Text overlays hidden during resize phase**
  - **Validates: Requirements 5.1**
  - Verify text has opacity 0 when phase is 'resize'
  - Verify text has opacity 1 when phase is 'timeline'

- [x] 3. Verify container dimensions and border-radius
- [x] 3.1 Confirm HeroImageContainer initial dimensions match reference
  - Desktop: 80vw × 80vh, border-radius 24px
  - Mobile: 90vw × 70vh, border-radius 16px
  - _Requirements: 3.1, 3.2, 4.1_

- [x] 3.2 Confirm fullscreen dimensions match reference
  - 100vw × 100vh, border-radius 0px
  - _Requirements: 3.4, 4.3_

- [ ]* 3.3 Write property test for dimension interpolation
  - **Property 1: Container dimensions interpolate smoothly**
  - **Validates: Requirements 3.3**
  - Generate random progress values (0-1)
  - Verify linear interpolation of width, height, border-radius

- [ ]* 3.4 Write property test for border-radius round-trip
  - **Property 3: Border-radius round-trip consistency**
  - **Validates: Requirements 4.4**
  - Scroll forward to fullscreen (progress=1)
  - Scroll backward to initial (progress=0)
  - Verify border-radius returns to initial value

- [ ] 4. Test bidirectional scroll behavior
- [ ] 4.1 Manually test forward scroll
  - Verify text appears when timeline phase begins
  - Verify canvas frames progress 0→832
  - Verify text overlays animate in at thresholds
  - _Requirements: 6.1, 6.3_

- [ ] 4.2 Manually test backward scroll
  - Verify text hides when returning to resize phase
  - Verify canvas frames regress 832→0
  - Verify text overlays animate out at thresholds
  - _Requirements: 6.2, 6.4_

- [ ]* 4.3 Write property test for canvas frame progression
  - **Property 5: Canvas frames progress monotonically forward**
  - **Validates: Requirements 6.3**
  - Generate sequence of increasing progress values
  - Verify frame numbers increase monotonically

- [ ]* 4.4 Write property test for canvas frame regression
  - **Property 6: Canvas frames regress monotonically backward**
  - **Validates: Requirements 6.4**
  - Generate sequence of decreasing progress values
  - Verify frame numbers decrease monotonically

- [ ] 5. Test responsive behavior
- [ ] 5.1 Test on mobile viewport (375px width)
  - Verify text scales down appropriately
  - Verify container uses mobile dimensions (90vw × 70vh)
  - Verify border-radius uses mobile value (16px)
  - _Requirements: 1.3, 3.5, 4.5, 7.5_

- [ ] 5.2 Test on desktop viewport (1920px width)
  - Verify text uses full size
  - Verify container uses desktop dimensions (80vw × 80vh)
  - Verify border-radius uses desktop value (24px)
  - _Requirements: 1.3, 3.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 6. Verify layout matches reference
- [ ] 6.1 Compare text positioning to reference implementation
  - Verify heading is positioned correctly
  - Verify body text is positioned correctly
  - Verify spacing between heading and body
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 6.2 Compare container structure to reference
  - Verify wrapper structure matches
  - Verify z-index layering is correct
  - _Requirements: 7.4_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
