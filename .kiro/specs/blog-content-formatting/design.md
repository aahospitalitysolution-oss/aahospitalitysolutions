# Blog Content Formatting Design Document

## Overview

This design document outlines the approach to improve blog article formatting and readability on the A&A Hospitality website. The solution focuses on enhancing the prose styling system using Tailwind CSS typography utilities, custom CSS refinements, and responsive design patterns to create an optimal reading experience across all devices.

The current implementation uses Tailwind's prose classes with basic customization. We will extend this with refined typography settings, improved spacing, better text justification handling, and enhanced visual hierarchy.

## Architecture

### Component Structure

```
src/app/blog/[slug]/page.tsx (Blog Post Page)
├── Navbar Component
├── Article Container
│   ├── Breadcrumb Navigation
│   ├── Article Header (metadata, title, author)
│   ├── Content Wrapper (prose-styled div)
│   │   └── Rendered HTML from markdown
│   └── Footer Navigation
└── Structured Data (JSON-LD)
```

### Styling Layers

1. **Global Styles** (`src/app/globals.css`): Base typography tokens and CSS variables
2. **Prose Utilities** (Tailwind): Typography plugin classes for markdown content
3. **Custom Overrides**: Specific refinements for blog content formatting
4. **Responsive Adjustments**: Media query-based modifications for different screen sizes

## Components and Interfaces

### Blog Post Page Component

**File**: `src/app/blog/[slug]/page.tsx`

The main component renders blog posts with the following structure:

```typescript
interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

interface PostData {
  title: string;
  date: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string;
  contentHtml: string;
  slug: string;
}
```

### Content Wrapper Styling

The content wrapper currently uses these Tailwind classes:
- `prose prose-invert prose-lg`: Base typography styling
- `prose-p:text-justify`: Paragraph justification
- `prose-headings:text-[#c2948a]`: Heading color
- `prose-a:text-[#7ea8be]`: Link color
- `prose-strong:text-[#f6f0ed]`: Bold text color
- `prose-blockquote:*`: Blockquote styling

## Data Models

### Typography Scale

```typescript
interface TypographyScale {
  body: {
    fontSize: string;      // 16-18px (1rem - 1.125rem)
    lineHeight: string;    // 1.75 (28-31.5px)
    letterSpacing: string; // 0.01em
  };
  h1: {
    fontSize: string;      // 2.25rem (36px)
    lineHeight: string;    // 1.2
    marginTop: string;     // 2em
    marginBottom: string;  // 0.8em
  };
  h2: {
    fontSize: string;      // 1.875rem (30px)
    lineHeight: string;    // 1.3
    marginTop: string;     // 1.6em
    marginBottom: string;  // 0.6em
  };
  h3: {
    fontSize: string;      // 1.5rem (24px)
    lineHeight: string;    // 1.4
    marginTop: string;     // 1.4em
    marginBottom: string;  // 0.5em
  };
}
```

### Spacing Model

```typescript
interface ContentSpacing {
  paragraph: {
    marginBottom: string;  // 1.5em
  };
  list: {
    marginTop: string;     // 1.25em
    marginBottom: string;  // 1.25em
    itemSpacing: string;   // 0.5em
  };
  blockquote: {
    marginY: string;       // 1.5em
    paddingY: string;      // 1em
    paddingX: string;      // 1.5em
  };
  section: {
    marginTop: string;     // 3em
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing the prework analysis, several properties can be consolidated:

- Properties 1.1 and 1.2 both test paragraph styling and can be combined into a single comprehensive property about paragraph formatting
- Properties 1.3, 2.2 test heading spacing and sizing - these are related but test different aspects, so both should remain
- Properties 2.1 and 2.5 both test font size constraints at different viewports - can be combined into one responsive property
- Properties 3.1 and 3.3 both test spacing between content elements - can be combined
- Properties 4.1 and 5.5 both test semantic HTML structure - these are redundant and can be combined
- Properties 1.4, 1.5, 2.3, 2.4, 3.4, 4.2, 4.3, 4.4, 4.5, 5.1, 5.3 all test unique aspects and should remain

After consolidation, we have 15 unique testable properties.

### Correctness Properties

Property 1: Paragraph text justification and readability
*For any* rendered blog article, all paragraph elements should have text-align: justify applied AND line-height between 1.5 and 1.8
**Validates: Requirements 1.1, 1.2**

Property 2: Heading vertical spacing
*For any* rendered blog article, all heading elements (h1-h6) should have margin-top >= 1em AND margin-bottom >= 0.5em
**Validates: Requirements 1.3**

Property 3: List styling consistency
*For any* rendered blog article, all list elements (ul, ol) should have consistent padding-left values and list items should have margin-bottom >= 0.25em
**Validates: Requirements 1.4**

Property 4: Blockquote distinct styling
*For any* rendered blog article, all blockquote elements should have padding-left >= 1em AND a visible border-left AND background-color different from body background
**Validates: Requirements 1.5**

Property 5: Responsive font size constraints
*For any* rendered blog article at any viewport width, paragraph font-size should be >= 14px on mobile and between 16px-18px on desktop
**Validates: Requirements 2.1, 2.5**

Property 6: Heading size hierarchy
*For any* rendered blog article, the computed font-size should satisfy: h2 > h3 > h4 > h5 > h6
**Validates: Requirements 2.2**

Property 7: Inline element distinction
*For any* rendered blog article, code elements should have different font-family from paragraphs AND strong/em elements should have different font-weight or font-style from regular text
**Validates: Requirements 2.3**

Property 8: Link styling with brand colors
*For any* rendered blog article, anchor elements should have color matching brand palette (#7ea8be) AND should have a :hover pseudo-class with different color
**Validates: Requirements 2.4**

Property 9: Content element spacing
*For any* rendered blog article, paragraphs should have margin-bottom >= 1.5em AND list items should have appropriate spacing for scanning
**Validates: Requirements 3.1, 3.3**

Property 10: Image margin spacing
*For any* rendered blog article containing images, img elements should have margin-top >= 1em AND margin-bottom >= 1em
**Validates: Requirements 3.4**

Property 11: Semantic HTML structure preservation
*For any* markdown content converted to HTML, the output should use semantic HTML5 elements (h1-h6 for headings, ul/ol for lists, blockquote for quotes, etc.) not generic divs
**Validates: Requirements 4.1, 5.5**

Property 12: Special character rendering
*For any* markdown content containing special characters (&, <, >, ", '), the rendered HTML should correctly escape or encode these characters
**Validates: Requirements 4.2**

Property 13: Long text wrapping
*For any* rendered blog article, the content container should have word-wrap: break-word OR overflow-wrap: break-word to handle long strings
**Validates: Requirements 4.3**

Property 14: Table styling
*For any* rendered blog article containing tables, table elements should have border CSS properties AND td/th elements should have padding >= 0.5em
**Validates: Requirements 4.4**

Property 15: Horizontal rule styling
*For any* rendered blog article containing hr elements, they should have height/border-width >= 1px AND margin-top >= 2em AND margin-bottom >= 2em
**Validates: Requirements 4.5**

Property 16: Optimal line length on desktop
*For any* rendered blog article viewed at desktop width (>= 1024px), the content container max-width should result in approximately 65-75 characters per line
**Validates: Requirements 5.1**

Property 17: Mobile full-width with padding
*For any* rendered blog article viewed at mobile width (< 768px), the content container should have width close to 100% AND horizontal padding >= 1rem
**Validates: Requirements 5.3**

## Error Handling

### Missing or Malformed Content

- If markdown content is empty or null, display a user-friendly message
- If HTML conversion fails, log error and display fallback content
- If images fail to load, ensure layout doesn't break (use alt text)

### CSS Loading Failures

- Ensure base styles are inlined or loaded with high priority
- Provide fallback font stacks if custom fonts fail to load
- Use progressive enhancement for advanced typography features

### Responsive Breakpoint Edge Cases

- Test content at exact breakpoint widths (768px, 1024px)
- Ensure no layout shifts or content overflow at any width
- Handle orientation changes on mobile devices

## Testing Strategy

### Unit Testing

We will write unit tests for:

1. **CSS Class Application**: Verify correct Tailwind prose classes are applied to content wrapper
2. **Markdown to HTML Conversion**: Test that markdown parsing preserves structure
3. **Responsive Utilities**: Verify breakpoint-specific classes are applied correctly

### Property-Based Testing

We will use **Vitest** with **fast-check** for property-based testing in TypeScript/React environment.

Property-based tests will:

1. Generate random blog post content with various markdown elements
2. Render the content using the blog post component
3. Query the DOM to verify CSS properties match specifications
4. Test across different viewport widths using JSDOM or Playwright
5. Run a minimum of 100 iterations per property test

Each property-based test will be tagged with a comment referencing the design document property:
```typescript
// Feature: blog-content-formatting, Property 1: Paragraph text justification and readability
test.prop([fc.string()])('paragraphs have justify and line-height', (content) => {
  // test implementation
});
```

### Visual Regression Testing

- Capture screenshots of sample blog posts at different viewport sizes
- Compare against baseline images to detect unintended visual changes
- Test with various content types (long articles, short posts, heavy formatting)

### Accessibility Testing

- Run axe-core or similar tool to verify WCAG compliance
- Test with screen readers (VoiceOver, NVDA) to ensure semantic structure
- Verify keyboard navigation works correctly
- Check color contrast ratios meet AA standards

### Manual Testing Checklist

- [ ] Read through a full article on desktop to verify comfortable reading experience
- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Verify text selection and copying works correctly
- [ ] Check print styles if applicable
- [ ] Test with browser zoom at 200%
- [ ] Verify with different font size preferences

## Implementation Details

### CSS Approach

We will use a combination of:

1. **Tailwind Prose Plugin**: Base typography styling with customization
2. **CSS Custom Properties**: For consistent spacing and sizing values
3. **Responsive Utilities**: Tailwind breakpoint modifiers for mobile/tablet/desktop
4. **Custom CSS Classes**: For specific refinements not covered by Tailwind

### Prose Configuration

Extend the prose classes with custom configuration:

```typescript
// In content wrapper
className="prose prose-invert prose-lg max-w-none
  prose-p:text-justify prose-p:leading-relaxed prose-p:mb-6
  prose-headings:font-serif prose-headings:text-[#c2948a] prose-headings:font-normal
  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
  prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2
  prose-a:text-[#7ea8be] prose-a:no-underline hover:prose-a:text-[#c2948a] hover:prose-a:underline
  prose-strong:text-[#f6f0ed] prose-strong:font-semibold
  prose-code:text-[#7ea8be] prose-code:bg-[#1a2e3b]/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
  prose-blockquote:border-l-4 prose-blockquote:border-[#c2948a] prose-blockquote:bg-[#1a2e3b]/50 
  prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:my-6
  prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
  prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
  prose-li:my-2
  prose-img:my-8 prose-img:rounded-lg
  prose-hr:my-12 prose-hr:border-[#f6f0ed]/20
  md:prose-p:text-lg
  lg:max-w-3xl"
```

### Responsive Strategy

- **Mobile (< 768px)**: Full-width content, 16px base font, tighter spacing
- **Tablet (768px - 1023px)**: Constrained width, 17px base font, moderate spacing
- **Desktop (>= 1024px)**: Max-width 800px (65-75 chars), 18px base font, generous spacing

### Typography Refinements

```css
/* Additional custom styles if needed */
.blog-content p {
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -moz-hyphens: auto;
}

.blog-content p:first-of-type {
  margin-top: 0;
}

.blog-content p:last-of-type {
  margin-bottom: 0;
}

/* Prevent orphans and widows */
.blog-content p {
  orphans: 3;
  widows: 3;
}

/* Better text rendering */
.blog-content {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Performance Considerations

- Use CSS containment for blog content to improve rendering performance
- Lazy load images below the fold
- Minimize CSS specificity to reduce style calculation time
- Use will-change sparingly for animated elements

## Conclusion

This design provides a comprehensive approach to improving blog content formatting through enhanced typography, proper spacing, and responsive design. By leveraging Tailwind's prose plugin with custom refinements and implementing property-based testing, we ensure consistent, readable, and accessible blog articles across all devices.

The implementation focuses on:
- Clear visual hierarchy through typography scale
- Comfortable reading experience with proper justification and line height
- Responsive design that adapts to different screen sizes
- Semantic HTML structure for accessibility
- Comprehensive testing to verify correctness properties

This approach balances aesthetic appeal with functional readability, creating a professional blog reading experience that reflects the A&A Hospitality brand quality.
