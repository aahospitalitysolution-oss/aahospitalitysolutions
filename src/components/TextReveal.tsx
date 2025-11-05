'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './TextReveal.module.css';

type TextRevealProps = {
  text: string;
  duration?: number; // total animation duration in seconds
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  play?: boolean; // whether to play the animation
  variant?: 'default' | 'plain'; // plain removes grey backgrounds/pills
};

export function TextReveal({ text, duration = 3, className, size = 'md', play = true, variant = 'default' }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const words = useMemo(() => {
    return text
      .split(/\s+/)
      .filter((w) => w.trim().length > 0);
  }, [text]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const wordEls = Array.from(
        containerRef.current!.querySelectorAll(`.${styles.word}`)
      ) as HTMLDivElement[];
      const spanEls = wordEls.map((el) => el.querySelector('span') as HTMLSpanElement);

      // Utilities for dynamic background-based pill color
      const clamp = (n: number, min = 0, max = 255) => Math.max(min, Math.min(max, n));
      const parseRgb = (val: string): { r: number; g: number; b: number; a: number } | null => {
        // supports rgb(r, g, b) and rgba(r, g, b, a)
        const m = val.match(/rgba?\(([^)]+)\)/i);
        if (!m) return null;
        const parts = m[1].split(',').map((p) => p.trim());
        if (parts.length < 3) return null;
        const r = parseInt(parts[0], 10);
        const g = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);
        const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
        return { r, g, b, a: Number.isFinite(a) ? a : 1 };
      };
      const toRgbString = (r: number, g: number, b: number, a = 1) => `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${clamp(a, 0, 1)})`;
      const luminance = (r: number, g: number, b: number) => {
        const srgb = [r, g, b].map((v) => v / 255);
        const lin = srgb.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      };
      const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        const r1 = r / 255, g1 = g / 255, b1 = b / 255;
        const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
        let h = 0, s = 0; const l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
            case g1: h = (b1 - r1) / d + 2; break;
            default: h = (r1 - g1) / d + 4; break;
          }
          h /= 6;
        }
        return { h: h * 360, s, l };
      };
      const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const h1 = (h % 360) / 360;
        let r: number, g: number, b: number;
        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h1 + 1/3);
          g = hue2rgb(p, q, h1);
          b = hue2rgb(p, q, h1 - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
      };
      const findBackgroundRgb = (el: HTMLElement | null): { r: number; g: number; b: number } => {
        let node: HTMLElement | null = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          if (bg && bg !== 'transparent') {
            const rgb = parseRgb(bg);
            if (rgb && rgb.a > 0) return { r: rgb.r, g: rgb.g, b: rgb.b };
          }
          node = node.parentElement as HTMLElement | null;
        }
        // fallback to body or white
        const bodyBg = getComputedStyle(document.body).backgroundColor;
        const bodyRgb = bodyBg ? parseRgb(bodyBg) : null;
        return bodyRgb ? { r: bodyRgb.r, g: bodyRgb.g, b: bodyRgb.b } : { r: 255, g: 255, b: 255 };
      };

      const base = findBackgroundRgb(containerRef.current!);
      const lum = luminance(base.r, base.g, base.b);
      const isLight = lum >= 0.5;
      const { h, s, l } = rgbToHsl(base.r, base.g, base.b);
      const lightnessDelta = 0.16; // subtle shade shift while keeping hue
      const sat = Math.min(1, s * 1.02); // preserve/increase saturation slightly to avoid greying
      const l2 = isLight ? Math.max(0, l - lightnessDelta) : Math.min(1, l + lightnessDelta);
      const shaded = hslToRgb(h, sat, l2);
      const pillColor = toRgbString(shaded.r, shaded.g, shaded.b, 1);
      const pillTransparent = toRgbString(shaded.r, shaded.g, shaded.b, 0);

      // Initial state
      gsap.set(wordEls, { opacity: 0, ...(variant === 'default' ? { backgroundColor: pillColor } : {}) });
      gsap.set(spanEls, { opacity: 0 });

      const totalWords = wordEls.length;
      if (totalWords === 0) return;

      const totalDuration = Math.max(0.0001, duration);

      // Create a smooth, overlapping window per word similar to the scroll version
      const overlapWords = Math.max(6, Math.min(15, Math.round(totalWords * 0.4)));
      const totalAnimationLength = 1 + overlapWords / totalWords;
      const timelineScale = 1 / Math.min(
        totalAnimationLength,
        1 + (totalWords - 1) / totalWords + overlapWords / totalWords
      );

      const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });

      wordEls.forEach((wordEl, index) => {
        const spanEl = spanEls[index];

        const wordStart = index / totalWords;
        const wordEnd = wordStart + overlapWords / totalWords;
        const adjustedStart = wordStart * timelineScale;
        const adjustedEnd = wordEnd * timelineScale;

        const windowStart = adjustedStart * totalDuration;
        const windowEnd = adjustedEnd * totalDuration;
        const windowDuration = Math.max(0.06, windowEnd - windowStart);

        // Word wrapper opacity: gentle rise over most of the window
        tl.fromTo(
          wordEl,
          { opacity: 0 },
          { opacity: 1, duration: windowDuration * 0.9, ease: 'sine.inOut' },
          windowStart
        );

        if (variant === 'default') {
          // Background highlight: fades out across the last half of the window
          tl.to(
            wordEl,
            { backgroundColor: pillTransparent, duration: windowDuration * 0.5, ease: 'sine.inOut' },
            windowStart + windowDuration * 0.5
          );
        }

        // Text opacity: appears near the end of the window for a smoother reveal
        tl.to(
          spanEl,
          { opacity: 1, duration: windowDuration * 0.4, ease: 'sine.out' },
          windowStart + windowDuration * 0.85
        );
      });

      timelineRef.current = tl;

      // Autoplay control
      if (play) {
        tl.play(0);
      } else {
        tl.pause(0);
      }
    }, containerRef);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      ctx.revert();
    };
  }, [text, duration, variant, play]);

  // React to play prop changes
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (play) tl.play(0);
    else tl.pause(0);
  }, [play]);

  const sizeClass =
    size === 'lg' ? styles.sizeLg : size === 'sm' ? styles.sizeSm : styles.sizeMd;

  return (
    <div ref={containerRef} className={`${styles.animeText} ${sizeClass} ${variant === 'plain' ? styles.plain : ''} ${className ?? ''}`}>
      {words.map((word, idx) => (
        <div className={styles.word} key={`${word}-${idx}`}>
          <span>{word}</span>
        </div>
      ))}
    </div>
  );
}

export default TextReveal;


