# Design Document: Canvas Section Redesign

## Overview

This design document provides exact specifications for copying the canvas section from the Ktisis Residences reference implementation (reference2/page.html) to the A&A Hospitality website. The focus is on replicating the exact layout, sizing, positioning, and animation behavior while adapting the content to A&A Hospitality branding.

## Reference Section Location

**File**: `reference2/page.html`  
**Section**: Lines 218-234 (HTML structure)  
**CSS Classes**: `.section.black`, `.grid-4`, `.div-block-4`, `.div-block-3`, `.heading-3`, `.white-para`

The reference section is the black background section with the canvas element and text overlay that appears after the "Our Roots" section.

## Reference HTML Structure

```html
<section data-w-id="13ce0a6f-e1c2-7e97-a1a4-5e0699eee50f" class="section black">
  <div class="w-layout-blockcontainer container w-container">
    <div class="w-layout-grid grid-4">
      <!-- Canvas Container (Left Column) -->
      <div id="w-node-_13ce0a6f-e1c2-7e97-a1a4-5e0699eee512-13562bc2" class="div-block-4">
        <img src="..." loading="lazy" alt="" />
        <div class="code-embed w-embed">
          <div class="draw"><canvas id="canvas"></canvas></div>
        </div>
      </div>
      
      <!-- Text Content (Right Column) -->
      <div class="div-block-3">
        <h1 text-flip-in="" text-split="" class="heading-3">
          Στην Ktisis, δημιουργούμε κατοικίες που αντέχουν στον χρόνο.
        </h1>
        <p data-w-id="13ce0a6f-e1c2-7e97-a1a4-5e0699eee518" style="opacity:0" class="white-para opacity">
          Οι κατοικίες μας συνδυάζουν διαχρονικό σχεδιασμό, άριστη ποιότητα κατασκευής, και ελάχιστες ανάγκες συντήρησης, προσφέροντας έναν χώρο για να ζείτε και να δημιουργείτε με άνεση και σιγουριά.
        </p>
      </div>
    </div>
  </div>
</section>
```

## Reference CSS Specifications

### Section Container (`.section.black`)

```css
.section.black {
  background-image: url(...);
  background-position: 50%;
  background-size: cover;
  background-attachment: fixed;
  margin-top: -2px;
  padding-top: 0;
}
```

### Main Container (`.container`)

```css
.container {
  border-bottom: 1px #000;
  flex-flow: column;
  width: 100%;
  max-width: 1440px;
  height: 100%;
  padding: 100px 80px;
  display: flex;
}
```

### Grid Layout (`.grid-4`)

```css
.grid-4 {
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr;  /* Two equal columns */
  margin-top: 30px;
  margin-bottom: 30px;
}
```

### Canvas Container (`.div-block-4`)

```css
.div-block-4 {
  flex-flow: column;
  justify-content: flex-end;  /* Aligns content to bottom */
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}
```

### Text Content Container (`.div-block-3`)

```css
.div-block-3 {
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  flex-flow: column;
  max-width: 611px;
  display: flex;
}
```

### Heading (`.heading-3`)

```css
.heading-3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 0;
  font-size: 48px;
  font-weight: 300;
  line-height: 50px;
}
```

### Body Text (`.white-para.opacity`)

```css
.white-para {
  color: #fff;
  margin-bottom: 0;
  font-size: 22px;
  font-weight: 200;
  line-height: 33px;
}

.white-para.opacity {
  color: #fffc;  /* White with transparency */
  font-size: 20px;
}
```

## Architecture

### Key Differences from Current Implementation

1. **Layout Structure**: Reference uses a 2-column grid (1fr 1fr) instead of absolute positioning
2. **Text Positioning**: Text is in the right column of the grid, not overlaid on the canvas
3. **Canvas Container**: Uses flexbox with `justify-content: flex-end` to align canvas to bottom
4. **Container Sizing**: No resize animation - container is static at full width/height
5. **Background**: Section has a fixed background image, not the canvas itself

### Implementation Strategy

The current A&A implementation has a complex scroll-driven resize animation. The reference implementation is simpler - it's a static 2-column layout. We need to:

1. **Keep existing scroll animations** for the canvas frames and text overlays
2. **Add the reference layout** as the container structure
3. **Position text above/beside** the canvas instead of overlaid
4. **Maintain rounded-to-square transition** for the container during resize phase

## Exact Implementation Specifications

### Container Dimensions and Positioning

**BEFORE Scroll (Initial State)**:
- Container: Centered, rounded corners
- Width: 80vw (desktop), 90vw (mobile)
- Height: 80vh (desktop), 70vh (mobile)
- Border-radius: 24px (desktop), 16px (mobile)
- Position: `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`

**AFTER Scroll (Fullscreen State)**:
- Container: Fullscreen, squared corners
- Width: 100vw
- Height: 100vh
- Border-radius: 0px
- Position: Fills entire viewport

**Transition**: Linear interpolation based on scroll progress (0-1)

### Text Content Specifications

**Heading Text**:
- Content: "At A&A Hospitality, we create residences that endure through time"
- Font: var(--font-serif) or brand serif font
- Size: 48px (desktop), clamp(2rem, 4vw, 3rem) (responsive)
- Weight: 300
- Color: var(--parchment) or #fff
- Line-height: 50px (desktop), 1.2 (responsive)
- Margin: 0

**Body Text**:
- Content: "Our residences combine timeless design, exceptional construction quality, and minimal maintenance needs, offering a space to live and create with comfort and confidence"
- Font: var(--font-sans) or brand sans font
- Size: 20px (desktop), clamp(1rem, 2vw, 1.25rem) (responsive)
- Weight: 200
- Color: rgba(255, 255, 255, 0.8) or var(--parchment) with 0.8 opacity
- Line-height: 33px (desktop), 1.6 (responsive)
- Margin: 0

### Layout Structure

**Option 1: Grid Layout (Reference Style)**
```tsx
<section className={styles.canvasSection}>
  <div className={styles.container}>
    <div className={styles.grid}>
      {/* Left Column: Canvas */}
      <div className={styles.canvasContainer}>
        <HeroImageContainer resizeProgress={resizeProgress}>
          <LandingCanvas ref={canvasRef} />
        </HeroImageContainer>
      </div>
      
      {/* Right Column: Text */}
      <div className={styles.textContent}>
        <h1 className={styles.heading}>
          At A&A Hospitality, we create residences that endure through time
        </h1>
        <p className={styles.body}>
          Our residences combine timeless design, exceptional construction quality, 
          and minimal maintenance needs, offering a space to live and create with 
          comfort and confidence
        </p>
      </div>
    </div>
  </div>
</section>
```

**Option 2: Absolute Positioning (Current Style with Text Above)**
```tsx
<section className={styles.canvasSection}>
  {/* Text positioned above container */}
  <div className={styles.textContent}>
    <h1 className={styles.heading}>
      At A&A Hospitality, we create residences that endure through time
    </h1>
    <p className={styles.body}>
      Our residences combine timeless design, exceptional construction quality, 
      and minimal maintenance needs, offering a space to live and create with 
      comfort and confidence
    </p>
  </div>
  
  {/* Container with canvas */}
  <HeroImageContainer resizeProgress={resizeProgress}>
    <LandingCanvas ref={canvasRef} />
    {/* Existing text overlays */}
  </HeroImageContainer>
</section>
```

### Animation Timing

**Resize Phase (0-100vh scroll)**:
- Container expands from initial to fullscreen
- Border-radius transitions from rounded to 0
- Text content remains visible and static
- Canvas stays at frame 0

**Timeline Phase (100vh-1600vh scroll)**:
- Container remains fullscreen
- Canvas frames progress 0→832
- Text overlays animate in/out at thresholds
- Static text content remains visible throughout

### Responsive Breakpoints

**Desktop (>= 768px)**:
- Container: 80vw × 80vh initial
- Border-radius: 24px initial
- Text: Full size (48px heading, 20px body)
- Grid: 2 columns (1fr 1fr)

**Mobile (< 768px)**:
- Container: 90vw × 70vh initial
- Border-radius: 16px initial
- Text: Scaled down (clamp values)
- Grid: 1 column (stack vertically)

## Data Models

### Text Content

```typescript
const CANVAS_SECTION_TEXT = {
  heading: "At A&A Hospitality, we create residences that endure through time",
  body: "Our residences combine timeless design, exceptional construction quality, and minimal maintenance needs, offering a space to live and create with comfort and confidence"
};
```

### Container Dimensions (Existing - No Changes Needed)

The existing `HeroImageContainer` component already handles dimension interpolation correctly. Current values match the reference:

```typescript
const INITIAL_DIMENSIONS = {
  desktop: { width: 80, height: 80, borderRadius: 24 },
  mobile: { width: 90, height: 70, borderRadius: 16 }
};

const FULLSCREEN_DIMENSIONS = {
  width: 100,
  height: 100,
  borderRadius: 0
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Container dimensions interpolate smoothly

*For any* resize progress value between 0 and 1, container dimensions should interpolate linearly from initial to fullscreen values.

**Validates: Requirements 3.3**

### Property 2: Border-radius interpolates smoothly

*For any* resize progress value between 0 and 1, border-radius should interpolate linearly from initial rounded value to zero.

**Validates: Requirements 4.2**

### Property 3: Border-radius round-trip consistency

*For any* sequence of scroll progress values that returns to the initial state, the border-radius should return to its initial value.

**Validates: Requirements 4.4**

### Property 4: Text overlays hidden during resize phase

*For any* text overlay element, when the current phase is 'resize', the element should have opacity 0 and scale 3.

**Validates: Requirements 5.1**

### Property 5: Canvas frames progress monotonically forward

*For any* sequence of increasing timeline progress values, canvas frame numbers should increase monotonically from 0 toward 832.

**Validates: Requirements 6.3**

### Property 6: Canvas frames regress monotonically backward

*For any* sequence of decreasing timeline progress values, canvas frame numbers should decrease monotonically from 832 toward 0.

**Validates: Requirements 6.4**

## Error Handling

### Viewport Resize

- Debounce resize handlers (100ms) to prevent excessive recalculations
- Use existing `ScrollTrigger.refresh()` mechanism
- Viewport width state already tracked in `HeroImageContainer`

### Animation State

- GSAP's `gsap.set()` already handles state updates cleanly
- No additional error handling needed - existing implementation is robust

### CSS Fallbacks

```css
.heading {
  font-family: var(--font-serif, 'Georgia', serif);
  color: var(--parchment, '#F5F1E8');
}

.body {
  font-family: var(--font-sans, 'Arial', sans-serif);
  color: var(--parchment, '#F5F1E8');
}
```

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Key Tests**:
- Text content renders with correct heading and body
- Container dimensions interpolate correctly
- Border-radius transitions from rounded to squared
- CSS custom properties are applied

### Property-Based Testing

**Framework**: fast-check

**Configuration**: Minimum 100 iterations per property test

**Key Properties** (see Correctness Properties section):
1. Container dimensions interpolate smoothly
2. Border-radius interpolates smoothly
3. Border-radius round-trip consistency
4. Text overlays hidden during resize phase
5. Canvas frames progress monotonically forward
6. Canvas frames regress monotonically backward

Each property test must be tagged with: `**Feature: canvas-section-redesign, Property {number}: {property_text}**`

### Manual Testing

1. Verify text content matches A&A Hospitality branding
2. Verify layout matches reference implementation
3. Test scroll behavior in both directions
4. Test responsive behavior at mobile/tablet/desktop breakpoints
5. Verify animations are smooth (>30 FPS)

## Implementation Notes

### Key Changes Required

1. **Add text content above/beside canvas** - New heading and body text with A&A Hospitality messaging
2. **Update text to appear only during timeline phase** - Hide during resize phase
3. **Apply brand fonts and colors** - Use CSS custom properties from design system
4. **Maintain existing animations** - Keep scroll-driven resize and canvas frame progression
5. **Ensure bidirectional scroll works** - Text should hide when scrolling back to resize phase

### Files to Modify

1. `src/components/landing/Landing.tsx` - Add text content, update animation logic
2. `src/components/landing/Landing.module.css` - Add styles for text content
3. `src/components/landing/HeroImageContainer.tsx` - No changes needed (dimensions already correct)

### CSS Custom Properties to Use

```css
--font-serif: /* Brand serif font */
--font-sans: /* Brand sans font */
--parchment: /* Brand light color */
--charcoal-blue: /* Brand dark color */
```

### Accessibility

- Use semantic HTML (h1 for heading, p for body)
- Ensure color contrast meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Respect `prefers-reduced-motion` (already implemented)

### Browser Compatibility

- Target: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- All required features (GSAP, CSS custom properties) are supported
