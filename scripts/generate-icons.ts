#!/usr/bin/env node
import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BRAND_BLUE = '#28536b';
const BRAND_BEIGE = '#F5EFE6';

interface IconConfig {
  size: number;
  outputPath: string;
  backgroundColor: string;
  padding: number;
}

async function generateIcon(svgPath: string, config: IconConfig): Promise<void> {
  const { size, outputPath, backgroundColor, padding } = config;
  
  // Read the SVG file
  const svgBuffer = readFileSync(svgPath);
  let svgString = svgBuffer.toString();
  
  // Replace the black color with white for the logo
  svgString = svgString.replace(/fill:\s*#231f20/g, 'fill: #ffffff');
  svgString = svgString.replace(/class="st0"/g, 'fill="#ffffff"');
  
  // Calculate the logo size with padding
  const logoSize = size - (padding * 2);
  
  // Create a canvas with background color
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: backgroundColor
    }
  });
  
  // Resize the logo and composite it onto the canvas
  const logo = await sharp(Buffer.from(svgString))
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  
  await canvas
    .composite([{
      input: logo,
      top: padding,
      left: padding
    }])
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Generated: ${outputPath} (${size}x${size}px)`);
}

async function generateOGImage(svgPath: string, outputPath: string): Promise<void> {
  const width = 1200;
  const height = 630;
  
  // Read the SVG file
  const svgBuffer = readFileSync(svgPath);
  let svgString = svgBuffer.toString();
  
  // Replace the black color with brand blue for the logo
  svgString = svgString.replace(/fill:\s*#231f20/g, `fill: ${BRAND_BLUE}`);
  svgString = svgString.replace(/class="st0"/g, `fill="${BRAND_BLUE}"`);
  
  // Calculate logo size (make it prominent but not too large)
  const logoSize = 300;
  const logoX = (width - logoSize) / 2;
  const logoY = (height - logoSize) / 2;
  
  // Create a canvas with beige background
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BRAND_BEIGE
    }
  });
  
  // Resize the logo
  const logo = await sharp(Buffer.from(svgString))
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  
  await canvas
    .composite([{
      input: logo,
      top: Math.round(logoY),
      left: Math.round(logoX)
    }])
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Generated: ${outputPath} (${width}x${height}px)`);
}

async function main() {
  const publicDir = join(process.cwd(), 'public');
  const iconsDir = join(publicDir, 'icons');
  const logoPath = join(publicDir, 'logo-square.svg');
  
  // Create icons directory if it doesn't exist
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
    console.log('✓ Created icons directory');
  }
  
  console.log('\n🎨 Generating icon assets...\n');
  
  // Generate PWA icons with white logo on blue background
  await generateIcon(logoPath, {
    size: 192,
    outputPath: join(iconsDir, 'icon-192.png'),
    backgroundColor: BRAND_BLUE,
    padding: 20
  });
  
  await generateIcon(logoPath, {
    size: 512,
    outputPath: join(iconsDir, 'icon-512.png'),
    backgroundColor: BRAND_BLUE,
    padding: 50
  });
  
  // Generate Apple touch icon
  await generateIcon(logoPath, {
    size: 180,
    outputPath: join(iconsDir, 'apple-touch-icon.png'),
    backgroundColor: BRAND_BLUE,
    padding: 20
  });
  
  // Generate OG image
  await generateOGImage(logoPath, join(publicDir, 'og-image.png'));
  
  console.log('\n✅ All icons generated successfully!\n');
}

main().catch(console.error);
