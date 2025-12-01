#!/bin/bash

# Frame Optimization Script for Ana Hospitality
# This script converts the source video to optimized 1080p WebP frames

# Usage: ./scripts/optimize-frames.sh /path/to/source_video.mp4

set -e

SOURCE_VIDEO="$1"
OUTPUT_DIR="public/frames"
BACKUP_DIR="public/frames_backup_jpg"

if [ -z "$SOURCE_VIDEO" ]; then
    echo "Usage: $0 /path/to/source_video.mp4"
    echo ""
    echo "Example: $0 ~/Videos/hero-animation.mp4"
    exit 1
fi

if [ ! -f "$SOURCE_VIDEO" ]; then
    echo "Error: Source video not found: $SOURCE_VIDEO"
    exit 1
fi

# Create backup of existing frames (optional - comment out if not needed)
if [ -d "$OUTPUT_DIR" ] && [ ! -d "$BACKUP_DIR" ]; then
    echo "Creating backup of existing JPG frames..."
    mv "$OUTPUT_DIR" "$BACKUP_DIR"
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Exporting 832 frames at 1080p as WebP..."
echo "Source: $SOURCE_VIDEO"
echo "Output: $OUTPUT_DIR"
echo ""

# Export frames as WebP at 1080p with high quality
# -q:v 80 = WebP quality (0-100, higher is better quality but larger files)
# -frames:v 832 = Export exactly 832 frames
# scale=1920:1080 = Resize to 1080p
ffmpeg -i "$SOURCE_VIDEO" \
    -vf "scale=1920:1080:flags=lanczos" \
    -q:v 80 \
    -frames:v 832 \
    "$OUTPUT_DIR/frame_%04d.webp"

# Verify output
FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/*.webp 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)

echo ""
echo "✅ Export complete!"
echo "   Frames exported: $FRAME_COUNT"
echo "   Total size: $TOTAL_SIZE"
echo ""

# Show sample file sizes
echo "Sample frame sizes:"
ls -lh "$OUTPUT_DIR"/frame_0001.webp "$OUTPUT_DIR"/frame_0416.webp "$OUTPUT_DIR"/frame_0832.webp 2>/dev/null | awk '{print "   " $9 ": " $5}'

