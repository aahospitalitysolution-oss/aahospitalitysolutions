'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import useMeasure from 'react-use-measure';

export type InfiniteSliderProps = {
    children: React.ReactNode;
    gap?: number;
    speed?: number;
    speedOnHover?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    className?: string;
};

export function InfiniteSlider({
    children,
    gap = 16,
    speed = 100,
    speedOnHover,
    direction = 'horizontal',
    reverse = false,
    className,
}: InfiniteSliderProps) {
    const [currentSpeed, setCurrentSpeed] = useState(speed);
    const [ref, { width, height }] = useMeasure();
    const translation = useMotionValue(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [key, setKey] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fix hydration by ensuring component only animates after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // PERFORMANCE: Use Intersection Observer to pause animation when off-screen
    useEffect(() => {
        if (!isMounted || !containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { threshold: 0, rootMargin: '50px' } // Start animating slightly before visible
        );

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [isMounted]);

    useEffect(() => {
        // Don't animate if not visible or not mounted
        if (!isMounted || !isVisible) return;

        let controls: ReturnType<typeof animate> | undefined;
        const size = direction === 'horizontal' ? width : height;
        const contentSize = size + gap;
        const from = reverse ? -contentSize / 2 : 0;
        const to = reverse ? 0 : -contentSize / 2;

        const distanceToTravel = Math.abs(to - from);
        const duration = distanceToTravel / currentSpeed;

        if (isTransitioning) {
            const remainingDistance = Math.abs(translation.get() - to);
            const transitionDuration = remainingDistance / currentSpeed;

            controls = animate(translation, [translation.get(), to], {
                ease: 'linear',
                duration: transitionDuration,
                onComplete: () => {
                    setIsTransitioning(false);
                    setKey((prevKey) => prevKey + 1);
                },
            });
        } else {
            controls = animate(translation, [from, to], {
                ease: 'linear',
                duration: duration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0,
                onRepeat: () => {
                    translation.set(from);
                },
            });
        }

        return controls?.stop;
    }, [
        isMounted,
        isVisible, // Added dependency
        key,
        translation,
        currentSpeed,
        width,
        height,
        gap,
        isTransitioning,
        direction,
        reverse,
    ]);

    const hoverProps = speedOnHover
        ? {
            onHoverStart: () => {
                setIsTransitioning(true);
                setCurrentSpeed(speedOnHover);
            },
            onHoverEnd: () => {
                setIsTransitioning(true);
                setCurrentSpeed(speed);
            },
        }
        : {};

    // Render static version during SSR to prevent hydration mismatch
    if (!isMounted) {
        return (
            <div ref={containerRef} className={cn('overflow-hidden', className)}>
                <div
                    className='flex w-max'
                    style={{
                        gap: `${gap}px`,
                        flexDirection: direction === 'horizontal' ? 'row' : 'column',
                    }}
                >
                    {children}
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={cn('overflow-hidden', className)}>
            <motion.div
                className='flex w-max'
                style={{
                    ...(direction === 'horizontal'
                        ? { x: translation }
                        : { y: translation }),
                    gap: `${gap}px`,
                    flexDirection: direction === 'horizontal' ? 'row' : 'column',
                }}
                ref={ref}
                {...hoverProps}
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
}
