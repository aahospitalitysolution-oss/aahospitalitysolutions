# Design Document: Frame Animation Optimization

## Overview

This design document specifies the implementation for optimizing the scroll-driven frame animation to reduce bandwidth consumption. The optimization introduces resolution switching (720p for mobile, 1080p for desktop), improved compression settings, and automatic device detection in the image preloader.

The current implementation loads 385 WebP frames at 1080p with quality 80, potentially consuming 20-40MB of data. This optimization targets a 50-70% reduction in data transfer for mobile users.

## Architecture

### Resolution Tiers

| Tier | Resolution | Quality | Target Size/Frame | Total (385 frames) |
|------|------------|---------|-------------------|-------------------|
| Desktop | 1920×1080 | 70 | ~40-60KB | ~15-23MB |
| Mobile | 1280×720 | 65 | ~20-35KB | ~8-13MB |

### Directory Structure

```
public/
├── frames/                    # Desktop frames (1080p)
│   ├── frame_0001.webp
│   ├── frame_0002.webp
│   └── ...
└── frames/mobile/             # Mobile frames (720p)
    ├── frame_0001.webp
    ├── frame_0002.webp
    └── ...
```

### Device Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    useImagePreloader                         │
├─────────────────────────────────────────────────────────────┤
│  1. On initialization:                                       │
│     - Read window.innerWidth                                 │
│     - Determine isMobile = width < 768                       │
│     - Lock resolution tier (no change on resize)             │
│                                                              │
│  2. Construct frame path:                                    │
│     - Mobile:  /frames/mobile/frame_XXXX.webp               │
│     - Desktop: /frames/frame_XXXX.webp                      │
│                                                              │
│  3. Load key frames (every 4th) → Phase 1                   │
│  4. Load remaining frames → Phase 2 (background)            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### useImagePreloader Hook (Modified)

```typescript
interface PreloaderConfig {
  frameCount: number;
  mobileBreakpoint?: number;  // Default: 768
}

interface PreloaderResult {
  imagesLoaded: boolean;
  progress: number;
  preloadImages: () => void;
  images: HTMLImageElement[];
  allFramesLoaded: boolean;
  getNearestLoadedFrame: (index: number) => number;
  isFrameLoaded: (index: number) => boolean;
  isMobile: boolean;  // NEW: Indicates which tier is being used
}

export const useImagePreloader = (config: PreloaderConfig): PreloaderResult
```

### Frame Path Function

```typescript
const getFramePath = (index: number, isMobile: boolean): string => {
  const frameNumber = (index + 1).toString().padStart(4, '0');
  const basePath = isMobile ? '/frames/mobile' : '/frames';
  return `${basePath}/frame_${frameNumber}.webp`;
};
```

### Optimization Script Interface

```bash
./scripts/optimize-frames.sh /path/to/source_video.mp4 [options]

Options:
  --desktop-only    Generate only desktop frames
  --mobile-only     Generate only mobile frames
  --quality N       Override default quality (default: 70 desktop, 65 mobile)
```

## Data Models

### Resolution Configuration

```typescript
const RESOLUTION_CONFIG = {
  desktop: {
    width: 1920,
    height: 1080,
    quality: 70,
    path: '/frames'
  },
  mobile: {
    width: 1280,
    height: 720,
    quality: 65,
    path: '/frames/mobile'
  }
} as const;

const MOBILE_BREAKPOINT = 768;
const KEY_FRAME_INTERVAL = 4;
```

### Preloader State

```typescript
interface PreloaderState {
  isMobile: boolean;           // Locked at initialization
  phase1Complete: boolean;     // Key frames loaded
  phase2Complete: boolean;     // All frames loaded
  loadedFrames: Set<number>;   // Indices of loaded frames
  progress: number;            // 0-100 for phase 1
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Frame path selection based on viewport width

*For any* viewport width, the frame path should contain '/frames/mobile/' if and only if the viewport width is less than 768px.

**Validates: Requirements 1.1, 1.2, 3.2, 3.4, 3.5**

### Property 2: Resolution tier is locked at initialization

*For any* initial viewport width and subsequent resize, the frame path should remain consistent with the initial viewport width determination.

**Validates: Requirements 3.3**

### Property 3: Key frames are loaded at correct intervals

*For any* frame count, the key frame indices should be exactly the set of indices where `index % KEY_FRAME_INTERVAL === 0`, plus the last frame index.

**Validates: Requirements 4.1**

### Property 4: Nearest loaded frame lookup returns valid frame

*For any* target frame index and set of loaded frames, `getNearestLoadedFrame` should return an index that is in the loaded frames set and minimizes the absolute distance to the target.

**Validates: Requirements 4.2**

### Property 5: All frames loaded after phase 2 completion

*For any* frame count, after phase 2 completes, the loaded frames set should contain all indices from 0 to frameCount-1.

**Validates: Requirements 4.3**

### Property 6: Progress increases monotonically during loading

*For any* sequence of load events during phase 1, the progress value should increase monotonically from 0 toward 100.

**Validates: Requirements 4.4**

## Error Handling

### Missing Mobile Frames

If mobile frames directory doesn't exist, fall back to desktop frames:

```typescript
const getFramePathWithFallback = (index: number, isMobile: boolean): string => {
  // Primary path
  const path = getFramePath(index, isMobile);
  
  // Fallback handled by onerror in Image loading
  return path;
};

// In image loading:
img.onerror = () => {
  if (isMobile && !img.src.includes('/frames/frame_')) {
    // Fallback to desktop
    img.src = getFramePath(index, false);
  }
};
```

### Viewport Detection Failure

If `window.innerWidth` is unavailable (SSR), default to desktop:

```typescript
const detectIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
};
```

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Key Tests**:
- `getFramePath` returns correct path for mobile/desktop
- `detectIsMobile` returns correct boolean for various viewport widths
- `getNearestLoadedFrame` returns correct index for various scenarios
- Progress updates correctly during loading simulation

### Property-Based Testing

**Framework**: fast-check

**Configuration**: Minimum 100 iterations per property test

**Properties to Test**:

1. **Frame path selection** - Generate random viewport widths, verify path contains '/mobile/' iff width < 768
2. **Resolution locking** - Generate initial width, then random resize widths, verify path unchanged
3. **Key frame intervals** - Generate random frame counts, verify key frame set is correct
4. **Nearest frame lookup** - Generate random loaded frame sets and targets, verify result is valid and minimal
5. **Phase completion** - Generate random frame counts, simulate loading, verify all frames loaded
6. **Progress monotonicity** - Generate random load sequences, verify progress never decreases

Each property test must be tagged with: `**Feature: frame-animation-optimization, Property {number}: {property_text}**`

### Integration Testing

- Verify mobile frames load on mobile viewport
- Verify desktop frames load on desktop viewport
- Verify fallback to desktop when mobile frames missing
- Verify animation plays smoothly with both resolution tiers

## Implementation Notes

### Script Changes (optimize-frames.sh)

```bash
# Generate desktop frames (1080p, quality 70)
ffmpeg -i "$SOURCE_VIDEO" \
    -vf "scale=1920:1080:flags=lanczos" \
    -q:v 70 \
    -frames:v 385 \
    "$OUTPUT_DIR/frame_%04d.webp"

# Generate mobile frames (720p, quality 65)
ffmpeg -i "$SOURCE_VIDEO" \
    -vf "scale=1280:720:flags=lanczos" \
    -q:v 65 \
    -frames:v 385 \
    "$OUTPUT_DIR/mobile/frame_%04d.webp"
```

### Hook Changes (useImagePreloader.ts)

1. Add `isMobile` state, locked at initialization
2. Update `currentFrame` function to use `getFramePath`
3. Export `isMobile` in return value for debugging

### Files to Modify

1. `scripts/optimize-frames.sh` - Add mobile frame generation
2. `src/hooks/useImagePreloader.ts` - Add device detection and path switching

### Performance Considerations

- Mobile frames at 720p should be ~50% smaller than 1080p
- Quality reduction from 80 to 70/65 saves additional ~20-30%
- Combined savings: 50-70% for mobile users
- Key frame loading strategy unchanged (every 4th frame first)

### Browser Compatibility

- `window.innerWidth` supported in all target browsers
- WebP supported in Chrome 23+, Firefox 65+, Safari 14+, Edge 18+
- No polyfills required
