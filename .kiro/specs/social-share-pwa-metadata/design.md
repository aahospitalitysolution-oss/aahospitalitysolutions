# Design Document

## Overview

This design implements comprehensive social media sharing metadata and Progressive Web App (PWA) visual metadata for the A&A Hospitality Solutions Next.js application. The solution leverages Next.js 16's built-in Metadata API to configure Open Graph tags, Twitter Cards, and PWA-specific metadata. Additionally, it includes a web app manifest file and optimized icon generation from existing logo assets.

The implementation will enhance the application's social media presence by ensuring rich preview cards appear when links are shared, and improve the mobile experience by providing proper PWA configuration with branded icons and theme colors.

## Architecture

The metadata system follows Next.js App Router conventions with a hierarchical structure:

1. **Application-Level Metadata** (layout.tsx): Defines default metadata for the entire application
2. **Page-Level Metadata** (page.tsx): Overrides or extends application metadata for specific routes
3. **Static Assets**: Web app manifest, icons, and social share images stored in the public directory
4. **Icon Generation Pipeline**: Scripts or manual process to generate optimized icons from SVG logos

### Component Hierarchy

```
app/
├── layout.tsx (Application metadata + manifest link)
├── page.tsx (Home page metadata)
├── services/
│   └── page.tsx (Services page metadata)
├── privacy-policy/
│   └── page.tsx (Privacy page metadata)
└── terms-of-service/
    └── page.tsx (Terms page metadata)

public/
├── manifest.json (PWA manifest)
├── og-image.png (Default Open Graph image 1200x630)
├── icons/
│   ├── icon-192.png (PWA icon 192x192)
│   ├── icon-512.png (PWA icon 512x512)
│   └── apple-touch-icon.png (iOS home screen icon 180x180)
```

## Components and Interfaces

### 1. Metadata Configuration (TypeScript)

The metadata will be defined using Next.js Metadata API types:

```typescript
import type { Metadata } from "next";

interface SocialMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

// Application-level metadata factory
function createMetadata(config: SocialMetadata): Metadata {
  return {
    title: config.title,
    description: config.description,
    keywords: ["hospitality", "solutions", "A&A", "business"],
    authors: [{ name: "A&A Hospitality Solutions" }],
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
      url: config.url,
      images: [
        {
          url: config.image,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      siteName: "A&A Hospitality Solutions",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [config.image],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: config.title,
    },
    manifest: "/manifest.json",
  };
}
```

### 2. Web App Manifest Structure

```typescript
interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
}
```

### 3. Icon Generation Interface

```typescript
interface IconGenerationConfig {
  sourceSvg: string; // Path to source SVG
  outputPath: string; // Directory for generated icons
  sizes: number[]; // Array of sizes to generate
  backgroundColor?: string; // Optional background color
  padding?: number; // Padding around logo
}
```

## Data Models

### Metadata Model

```typescript
type PageMetadata = {
  title: string;
  description: string;
  ogImage?: string; // Optional custom OG image
  keywords?: string[];
  canonical?: string; // Canonical URL
};

// Default metadata for the application
const DEFAULT_METADATA: PageMetadata = {
  title: "A&A Hospitality Solutions",
  description:
    "Experience elegant animations and modern design solutions for your hospitality business",
  ogImage: "https://anahospitality.com/og-image.png",
  keywords: ["hospitality", "solutions", "business", "A&A"],
};
```

### Manifest Model

```typescript
const MANIFEST_CONFIG: WebAppManifest = {
  name: "A&A Hospitality Solutions",
  short_name: "A&A",
  description: "Hospitality solutions for modern businesses",
  start_url: "/",
  display: "standalone",
  background_color: "#F5EFE6",
  theme_color: "#28536b",
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Metadata completeness for social platforms

*For any* page in the application, when metadata is rendered, all required Open Graph properties (og:title, og:description, og:image, og:url, og:type) and Twitter Card properties (twitter:card, twitter:title, twitter:description, twitter:image) should be present in the HTML head.

**Validates: Requirements 1.3, 1.4**

### Property 2: Absolute URL consistency

*For any* metadata image URL (OG image, Twitter image, or icon), the URL should be absolute (starting with http:// or https://) and include the full domain, not a relative path.

**Validates: Requirements 1.5**

### Property 3: Manifest icon size completeness

*For any* PWA manifest configuration, the icons array should include at least one icon with size 192x192px and at least one icon with size 512x512px.

**Validates: Requirements 2.4**

### Property 4: Theme color consistency

*For any* page in the application, the theme-color meta tag value should match the brand's primary color (#28536b) and be consistent with the viewport themeColor configuration.

**Validates: Requirements 3.1, 3.5**

### Property 5: Metadata inheritance and override

*For any* page with custom metadata, when merged with application-level metadata, the page-specific values should take precedence over application defaults, and all required fields should remain populated.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 6: Manifest JSON validity

*For any* web app manifest file, when parsed as JSON, it should be valid JSON without syntax errors and conform to the Web App Manifest specification schema.

**Validates: Requirements 6.3**

### Property 7: Icon dimension accuracy

*For any* generated icon file, the actual pixel dimensions should match the declared size in the manifest or meta tag (e.g., a file declared as 192x192 should actually be 192x192 pixels).

**Validates: Requirements 4.3**

### Property 8: OG image dimension compliance

*For any* social share image used as an OG image, the dimensions should be 1200x630 pixels to ensure optimal display across all social platforms.

**Validates: Requirements 4.1**

## Error Handling

### Missing Environment Variables

- **Issue**: Base URL not configured for absolute URLs
- **Solution**: Provide fallback to relative URLs in development, require NEXT_PUBLIC_SITE_URL in production
- **Implementation**: Use environment variable with validation in metadata generation

### Invalid Manifest JSON

- **Issue**: Syntax errors in manifest.json
- **Solution**: Validate manifest during build process, provide clear error messages
- **Implementation**: Add JSON schema validation in build script

### Missing Icon Files

- **Issue**: Referenced icons don't exist in public directory
- **Solution**: Validate icon paths during build, provide fallback icons
- **Implementation**: Check file existence in build script, log warnings for missing assets

### Image Generation Failures

- **Issue**: SVG to PNG conversion fails
- **Solution**: Provide manual fallback instructions, validate generated images
- **Implementation**: Try-catch around image generation, verify output dimensions

### Metadata Merge Conflicts

- **Issue**: Page metadata conflicts with application metadata
- **Solution**: Follow Next.js precedence rules, document merge behavior
- **Implementation**: Use Next.js built-in metadata merging, test edge cases

## Testing Strategy

### Unit Testing

Unit tests will verify:

1. **Metadata Factory Functions**: Test that createMetadata() generates correct structure
2. **URL Formatting**: Test absolute URL generation from relative paths
3. **Metadata Merging**: Test that page metadata correctly overrides app metadata
4. **Manifest Generation**: Test that manifest object matches schema

Example test cases:
- Given a relative image path, when converted to absolute URL, should include domain
- Given page metadata with custom title, when merged with app metadata, should use custom title
- Given manifest config, when serialized to JSON, should be valid JSON

### Property-Based Testing

Property-based tests will use fast-check library to verify:

1. **Metadata Completeness Property**: Generate random page configs, verify all required fields present
2. **URL Absoluteness Property**: Generate random image paths, verify all become absolute URLs
3. **Icon Size Property**: Generate random manifest configs, verify required icon sizes present
4. **Theme Color Consistency Property**: Generate random page metadata, verify theme color matches brand color

### Integration Testing

Integration tests will verify:

1. **HTML Output**: Render pages and verify meta tags in HTML head
2. **Manifest Accessibility**: Verify /manifest.json is accessible and valid
3. **Icon Accessibility**: Verify all referenced icon files exist and are accessible
4. **Social Platform Validation**: Use external validators (Facebook Debugger, Twitter Card Validator)

### Manual Testing Checklist

1. Share link on WhatsApp - verify preview card appears
2. Share link on X/Twitter - verify Twitter Card appears
3. Share link on LinkedIn - verify preview card appears
4. Add to iOS home screen - verify icon and splash screen
5. Add to Android home screen - verify icon
6. Check status bar color on iOS Safari
7. Check status bar color on Android Chrome
8. Validate with Facebook Sharing Debugger
9. Validate with Twitter Card Validator
10. Validate manifest with Chrome DevTools

### Testing Tools

- **fast-check**: Property-based testing library for TypeScript
- **@testing-library/react**: Component testing
- **vitest**: Test runner (already in project)
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Chrome DevTools**: Application tab for PWA manifest inspection

### Test Coverage Goals

- Unit tests: 100% coverage of metadata utility functions
- Property tests: All 8 correctness properties implemented
- Integration tests: All critical user paths (sharing, PWA installation)
- Manual validation: All social platforms and mobile devices tested before release
