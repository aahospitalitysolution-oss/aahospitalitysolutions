# Implementation Plan

- [x] 1. Generate optimized icon assets from existing logos
  - Create 1200x630px OG image for social sharing with branding
  - Create 192x192px PNG icon for PWA (white logo on #28536b background)
  - Create 512x512px PNG icon for PWA (white logo on #28536b background)
  - Create 180x180px Apple touch icon (white logo on #28536b background)
  - Place all generated icons in public/icons/ directory
  - Place OG image as public/og-image.png
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Create web app manifest configuration
  - Create public/manifest.json with PWA configuration
  - Define name, short_name, description, start_url, display mode
  - Set background_color to #F5EFE6 and theme_color to #28536b
  - Configure icons array with 192x192 and 512x512 PNG icons
  - Set icon purpose to "any maskable" for both sizes
  - _Requirements: 2.1, 2.4_

- [ ]* 2.1 Write property test for manifest icon sizes
  - **Property 3: Manifest icon size completeness**
  - **Validates: Requirements 2.4**

- [ ]* 2.2 Write property test for manifest JSON validity
  - **Property 6: Manifest JSON validity**
  - **Validates: Requirements 6.3**

- [x] 3. Create metadata utility functions
  - Create src/lib/metadata.ts for metadata generation utilities
  - Implement createMetadata() factory function for consistent metadata structure
  - Implement getAbsoluteUrl() to convert relative URLs to absolute URLs
  - Add NEXT_PUBLIC_SITE_URL environment variable support with fallback
  - Export default metadata configuration object
  - _Requirements: 1.5, 5.1, 5.2_

- [ ]* 3.1 Write property test for absolute URL generation
  - **Property 2: Absolute URL consistency**
  - **Validates: Requirements 1.5**

- [ ]* 3.2 Write property test for metadata inheritance
  - **Property 5: Metadata inheritance and override**
  - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 4. Update application-level metadata in layout.tsx
  - Import metadata utility functions from src/lib/metadata.ts
  - Update existing metadata object with complete Open Graph configuration
  - Add Twitter Card metadata (card, title, description, images)
  - Add appleWebApp configuration (capable, statusBarStyle, title)
  - Add manifest link reference to /manifest.json
  - Update viewport themeColor to #28536b
  - Ensure all image URLs use absolute paths with domain
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 3.1, 3.2, 3.3_

- [ ]* 4.1 Write property test for metadata completeness
  - **Property 1: Metadata completeness for social platforms**
  - **Validates: Requirements 1.3, 1.4**

- [ ]* 4.2 Write property test for theme color consistency
  - **Property 4: Theme color consistency**
  - **Validates: Requirements 3.1, 3.5**

- [x] 5. Add page-specific metadata for home page
  - Update src/app/page.tsx to export metadata object
  - Customize title, description for home page
  - Use absolute URL for OG image
  - Ensure metadata extends application defaults
  - _Requirements: 5.1, 5.3_

- [x] 6. Add page-specific metadata for services page
  - Update src/app/services/page.tsx to export metadata object
  - Customize title, description for services page
  - Use absolute URL for OG image
  - Ensure metadata extends application defaults
  - _Requirements: 5.1, 5.3_

- [x] 7. Add page-specific metadata for privacy and terms pages
  - Update src/app/privacy-policy/page.tsx to export metadata object
  - Update src/app/terms-of-service/page.tsx to export metadata object
  - Customize titles and descriptions for each page
  - Use absolute URL for OG image
  - Ensure metadata extends application defaults
  - _Requirements: 5.1, 5.3_

- [ ]* 7.1 Write property test for no duplicate meta tags
  - **Property 12: No duplicate meta tags**
  - **Validates: Requirements 5.5**

- [ ] 8. Create environment configuration
  - Add NEXT_PUBLIC_SITE_URL to .env.local for development
  - Document NEXT_PUBLIC_SITE_URL requirement in README or deployment docs
  - Set production URL in deployment environment variables
  - _Requirements: 1.5_

- [ ]* 8.1 Write property test for OG image dimensions
  - **Property 8: OG image dimension compliance**
  - **Validates: Requirements 4.1**

- [ ]* 8.2 Write property test for icon dimension accuracy
  - **Property 7: Icon dimension accuracy**
  - **Validates: Requirements 4.3**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Create integration tests for metadata rendering
  - Write tests to verify meta tags appear in rendered HTML
  - Test that manifest.json is accessible at /manifest.json
  - Test that all icon files are accessible
  - Verify no duplicate meta tags in HTML output
  - _Requirements: 6.5_

- [ ]* 11. Create validation documentation
  - Document how to test with Facebook Sharing Debugger
  - Document how to test with Twitter Card Validator
  - Document how to test PWA installation on iOS and Android
  - Create manual testing checklist for QA
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
