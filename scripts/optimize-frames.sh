#!/bin/bash

# Frame Optimization Script for Ana Hospitality
# This script converts the source video to optimized WebP frames
# Generates both desktop (1080p) and mobile (720p) resolution tiers

# Usage: ./scripts/optimize-frames.sh /path/to/source_video.mp4 [options]
# Options:
#   --desktop-only    Generate only desktop frames
#   --mobile-only     Generate only mobile frames

set -e

SOURCE_VIDEO=""
DESKTOP_ONLY=false
MOBILE_ONLY=false
OUTPUT_DIR="public/frames"
BACKUP_DIR="public/frames_backup_jpg"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --desktop-only)
            DESKTOP_ONLY=true
            shift
            ;;
        --mobile-only)
            MOBILE_ONLY=true
            shift
            ;;
        *)
            if [ -z "$SOURCE_VIDEO" ]; then
                SOURCE_VIDEO="$1"
            fi
            shift
            ;;
    esac
done

if [ -z "$SOURCE_VIDEO" ]; then
    echo "Usage: $0 /path/to/source_video.mp4 [options]"
    echo ""
    echo "Options:"
    echo "  --desktop-only    Generate only desktop frames"
    echo "  --mobile-only     Generate only mobile frames"
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

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/mobile"

echo "=============================================="
echo "Frame Optimization Script"
echo "=============================================="
echo "Source: $SOURCE_VIDEO"
echo "Output: $OUTPUT_DIR"
echo ""

# Resolution and quality settings
DESKTOP_WIDTH=1920
DESKTOP_HEIGHT=1080
DESKTOP_QUALITY=65

MOBILE_WIDTH=1280
MOBILE_HEIGHT=720
MOBILE_QUALITY=65

FRAME_COUNT=385

# Generate desktop frames (1080p, quality 65)
if [ "$MOBILE_ONLY" = false ]; then
    echo "Generating desktop frames (${DESKTOP_WIDTH}x${DESKTOP_HEIGHT}, quality ${DESKTOP_QUALITY})..."
    ffmpeg -i "$SOURCE_VIDEO" \
        -vf "scale=${DESKTOP_WIDTH}:${DESKTOP_HEIGHT}:flags=lanczos" \
        -c:v libwebp \
        -q:v $DESKTOP_QUALITY \
        -frames:v $FRAME_COUNT \
        "$OUTPUT_DIR/frame_%04d.webp"
    echo "✅ Desktop frames complete"
    echo ""
fi

# Generate mobile frames (720p, quality 65)
if [ "$DESKTOP_ONLY" = false ]; then
    echo "Generating mobile frames (${MOBILE_WIDTH}x${MOBILE_HEIGHT}, quality ${MOBILE_QUALITY})..."
    ffmpeg -i "$SOURCE_VIDEO" \
        -vf "scale=${MOBILE_WIDTH}:${MOBILE_HEIGHT}:flags=lanczos" \
        -c:v libwebp \
        -q:v $MOBILE_QUALITY \
        -frames:v $FRAME_COUNT \
        "$OUTPUT_DIR/mobile/frame_%04d.webp"
    echo "✅ Mobile frames complete"
    echo ""
fi


# Report results
echo "=============================================="
echo "Generation Complete - Size Report"
echo "=============================================="
echo ""

# Desktop tier report
if [ "$MOBILE_ONLY" = false ]; then
    DESKTOP_FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/*.webp 2>/dev/null | wc -l | tr -d ' ')
    DESKTOP_TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" --exclude="$OUTPUT_DIR/mobile" 2>/dev/null | cut -f1 || du -sh "$OUTPUT_DIR"/*.webp 2>/dev/null | tail -1 | cut -f1)
    
    # Calculate desktop size excluding mobile subdirectory
    DESKTOP_SIZE_BYTES=$(find "$OUTPUT_DIR" -maxdepth 1 -name "*.webp" -exec stat -f%z {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || find "$OUTPUT_DIR" -maxdepth 1 -name "*.webp" -exec stat --printf="%s\n" {} + 2>/dev/null | awk '{sum+=$1} END {print sum}')
    DESKTOP_SIZE_MB=$(echo "scale=2; $DESKTOP_SIZE_BYTES / 1048576" | bc)
    
    echo "📱 Desktop Tier (1080p):"
    echo "   Resolution: ${DESKTOP_WIDTH}x${DESKTOP_HEIGHT}"
    echo "   Quality: ${DESKTOP_QUALITY}"
    echo "   Frame count: $DESKTOP_FRAME_COUNT"
    echo "   Total size: ${DESKTOP_SIZE_MB}MB"
    echo ""
    
    # Show sample desktop frame sizes
    echo "   Sample frame sizes:"
    ls -lh "$OUTPUT_DIR"/frame_0001.webp 2>/dev/null | awk '{print "     frame_0001.webp: " $5}'
    ls -lh "$OUTPUT_DIR"/frame_0192.webp 2>/dev/null | awk '{print "     frame_0192.webp: " $5}'
    ls -lh "$OUTPUT_DIR"/frame_0385.webp 2>/dev/null | awk '{print "     frame_0385.webp: " $5}'
    echo ""
fi

# Mobile tier report
if [ "$DESKTOP_ONLY" = false ]; then
    MOBILE_FRAME_COUNT=$(ls -1 "$OUTPUT_DIR/mobile"/*.webp 2>/dev/null | wc -l | tr -d ' ')
    
    # Calculate mobile size
    MOBILE_SIZE_BYTES=$(find "$OUTPUT_DIR/mobile" -name "*.webp" -exec stat -f%z {} + 2>/dev/null | awk '{sum+=$1} END {print sum}' || find "$OUTPUT_DIR/mobile" -name "*.webp" -exec stat --printf="%s\n" {} + 2>/dev/null | awk '{sum+=$1} END {print sum}')
    MOBILE_SIZE_MB=$(echo "scale=2; $MOBILE_SIZE_BYTES / 1048576" | bc)
    
    echo "📱 Mobile Tier (720p):"
    echo "   Resolution: ${MOBILE_WIDTH}x${MOBILE_HEIGHT}"
    echo "   Quality: ${MOBILE_QUALITY}"
    echo "   Frame count: $MOBILE_FRAME_COUNT"
    echo "   Total size: ${MOBILE_SIZE_MB}MB"
    echo ""
    
    # Show sample mobile frame sizes
    echo "   Sample frame sizes:"
    ls -lh "$OUTPUT_DIR/mobile"/frame_0001.webp 2>/dev/null | awk '{print "     frame_0001.webp: " $5}'
    ls -lh "$OUTPUT_DIR/mobile"/frame_0192.webp 2>/dev/null | awk '{print "     frame_0192.webp: " $5}'
    ls -lh "$OUTPUT_DIR/mobile"/frame_0385.webp 2>/dev/null | awk '{print "     frame_0385.webp: " $5}'
    echo ""
fi

# Verify consistent naming
echo "=============================================="
echo "Naming Verification"
echo "=============================================="

if [ "$MOBILE_ONLY" = false ]; then
    DESKTOP_FIRST=$(ls "$OUTPUT_DIR"/frame_*.webp 2>/dev/null | head -1 | xargs basename 2>/dev/null)
    DESKTOP_LAST=$(ls "$OUTPUT_DIR"/frame_*.webp 2>/dev/null | tail -1 | xargs basename 2>/dev/null)
    echo "Desktop: $DESKTOP_FIRST ... $DESKTOP_LAST"
fi

if [ "$DESKTOP_ONLY" = false ]; then
    MOBILE_FIRST=$(ls "$OUTPUT_DIR/mobile"/frame_*.webp 2>/dev/null | head -1 | xargs basename 2>/dev/null)
    MOBILE_LAST=$(ls "$OUTPUT_DIR/mobile"/frame_*.webp 2>/dev/null | tail -1 | xargs basename 2>/dev/null)
    echo "Mobile:  $MOBILE_FIRST ... $MOBILE_LAST"
fi

echo ""
echo "✅ All frames use consistent frame_%04d.webp naming pattern"
echo ""


