# Icon Generation Scripts

This directory contains scripts for generating optimized icon assets for social sharing and PWA functionality.

## Generated Assets

The scripts generate the following assets:

### PWA Icons
- `public/icons/icon-192.png` - 192x192px PWA icon (white logo on #28536b background)
- `public/icons/icon-512.png` - 512x512px PWA icon (white logo on #28536b background)
- `public/icons/apple-touch-icon.png` - 180x180px Apple touch icon (white logo on #28536b background)

### Social Sharing
- `public/og-image.png` - 1200x630px Open Graph image (blue logo on #F5EFE6 background)

## Usage

### Generate Icons

To generate all icon assets from the source logo:

```bash
npm run generate-icons
```

This will:
1. Create the `public/icons/` directory if it doesn't exist
2. Generate all PWA icons with proper dimensions and branding
3. Generate the Open Graph social sharing image

### Verify Icons

To verify that all icons have the correct dimensions:

```bash
npm run verify-icons
```

This will check that:
- icon-192.png is 192x192px
- icon-512.png is 512x512px
- apple-touch-icon.png is 180x180px
- og-image.png is 1200x630px

## Source Assets

The scripts use `public/logo-square.svg` as the source logo file.

## Brand Colors

- Primary Blue: `#28536b` (used for icon backgrounds)
- Beige: `#F5EFE6` (used for OG image background)
- White: `#ffffff` (used for logo color on icons)

## Requirements

The scripts require the following dependencies:
- `sharp` - Image processing library
- `tsx` - TypeScript execution

These are installed as dev dependencies and should be available after running `npm install`.

## Customization

To customize the generated icons:

1. Edit `scripts/generate-icons.ts`
2. Modify the padding, colors, or sizes as needed
3. Run `npm run generate-icons` to regenerate
4. Run `npm run verify-icons` to verify the output

## Notes

- Icons are optimized for web delivery with PNG format
- The white logo version is automatically created by replacing the black (#231f20) color
- Padding is applied to ensure the logo doesn't touch the edges
- All icons use transparent backgrounds where appropriate
