# Requirements Document

## Introduction

This specification defines the requirements for optimizing the scroll-driven frame animation sequence to reduce bandwidth consumption and improve performance, particularly for mobile users. The current implementation loads 385-832 WebP frames at 1080p resolution, potentially consuming 20-40MB of data. This optimization focuses on resolution switching, compression improvements, and intelligent loading strategies.

## Glossary

- **Frame Sequence**: The collection of WebP images (frame_0001.webp through frame_0385.webp) used for scroll-driven animation
- **Resolution Switching**: Serving different image resolutions based on device capabilities and viewport size
- **Key Frame**: A frame loaded during the initial preload phase (currently every 4th frame)
- **Progressive Loading**: Loading key frames first, then filling in remaining frames in the background
- **WebP Quality**: The compression quality setting (0-100) used when encoding WebP images
- **Viewport Width**: The width of the browser viewport in pixels
- **Mobile Device**: A device with viewport width less than 768px
- **Desktop Device**: A device with viewport width of 768px or greater

## Requirements

### Requirement 1

**User Story:** As a mobile user, I want the animation to load smaller resolution frames, so that my data plan is not consumed excessively.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px THEN the system SHALL load frames from a mobile-optimized directory
2. WHEN the viewport width is 768px or greater THEN the system SHALL load frames from the desktop directory
3. WHEN mobile frames are loaded THEN the system SHALL serve frames at 720p resolution or lower
4. WHEN desktop frames are loaded THEN the system SHALL serve frames at 1080p resolution
5. WHEN the device pixel ratio is considered THEN the system SHALL select the appropriate resolution tier

### Requirement 2

**User Story:** As a website owner, I want the frame images to be compressed more aggressively, so that total download size is minimized without noticeable quality loss.

#### Acceptance Criteria

1. WHEN frames are generated THEN the optimization script SHALL use WebP quality setting of 70 or lower
2. WHEN frames are generated THEN the optimization script SHALL produce mobile frames at 720p resolution
3. WHEN frames are generated THEN the optimization script SHALL produce desktop frames at 1080p resolution
4. WHEN compression is applied THEN the system SHALL maintain visual quality acceptable for scroll animation
5. WHEN frames are generated THEN the optimization script SHALL report total file size for each resolution tier

### Requirement 3

**User Story:** As a developer, I want the image preloader to detect device type, so that the correct frame resolution is loaded automatically.

#### Acceptance Criteria

1. WHEN the preloader initializes THEN the system SHALL detect the current viewport width
2. WHEN the preloader initializes THEN the system SHALL select the frame path based on viewport width
3. WHEN the viewport is resized across the breakpoint THEN the system SHALL continue using the initially selected resolution
4. WHEN the frame path is constructed THEN the system SHALL use `/frames/mobile/` for mobile devices
5. WHEN the frame path is constructed THEN the system SHALL use `/frames/` for desktop devices

### Requirement 4

**User Story:** As a user on a slow connection, I want the animation to work with fewer frames initially, so that I can start interacting with the page faster.

#### Acceptance Criteria

1. WHEN key frames are loaded THEN the system SHALL load every 4th frame as the initial set
2. WHEN a non-loaded frame is requested THEN the system SHALL display the nearest loaded frame
3. WHEN background loading completes THEN the system SHALL have all frames available for smooth animation
4. WHEN the initial load completes THEN the system SHALL report progress to the UI
5. WHEN all frames are loaded THEN the system SHALL notify the application that full quality is available

### Requirement 5

**User Story:** As a developer, I want to easily regenerate optimized frames, so that I can update the animation source without manual optimization steps.

#### Acceptance Criteria

1. WHEN the optimization script runs THEN the system SHALL generate both mobile and desktop frame sets
2. WHEN the optimization script runs THEN the system SHALL create the mobile output directory if it does not exist
3. WHEN the optimization script completes THEN the system SHALL report frame count and total size for each tier
4. WHEN the optimization script runs THEN the system SHALL use consistent naming conventions across tiers
5. WHEN the optimization script runs THEN the system SHALL preserve the original frame numbering sequence

