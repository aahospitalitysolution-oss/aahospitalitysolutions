#!/usr/bin/env node
import sharp from 'sharp';
import { join } from 'path';

async function verifyImage(path: string, expectedWidth: number, expectedHeight: number): Promise<boolean> {
  try {
    const metadata = await sharp(path).metadata();
    const isValid = metadata.width === expectedWidth && metadata.height === expectedHeight;
    
    if (isValid) {
      console.log(`✓ ${path}: ${metadata.width}x${metadata.height}px (correct)`);
    } else {
      console.log(`✗ ${path}: ${metadata.width}x${metadata.height}px (expected ${expectedWidth}x${expectedHeight}px)`);
    }
    
    return isValid;
  } catch (error) {
    console.log(`✗ ${path}: Error reading file - ${error}`);
    return false;
  }
}

async function main() {
  const publicDir = join(process.cwd(), 'public');
  const iconsDir = join(publicDir, 'icons');
  
  console.log('\n🔍 Verifying icon dimensions...\n');
  
  const results = await Promise.all([
    verifyImage(join(iconsDir, 'icon-192.png'), 192, 192),
    verifyImage(join(iconsDir, 'icon-512.png'), 512, 512),
    verifyImage(join(iconsDir, 'apple-touch-icon.png'), 180, 180),
    verifyImage(join(publicDir, 'og-image.png'), 1200, 630),
  ]);
  
  const allValid = results.every(r => r);
  
  if (allValid) {
    console.log('\n✅ All icons have correct dimensions!\n');
  } else {
    console.log('\n❌ Some icons have incorrect dimensions!\n');
    process.exit(1);
  }
}

main().catch(console.error);
