"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Particle = ({ index, width, height }: { index: number; width: number; height: number }) => {
    const [randomValues, setRandomValues] = useState<{ x: number; y: number; yEnd: number; duration: number } | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRandomValues({
            x: Math.random() * width,
            y: Math.random() * height,
            yEnd: Math.random() * -100,
            duration: 5 + Math.random() * 5,
        });
    }, [width, height]);

    if (!randomValues) return null;

    return (
        <motion.div
            className="absolute w-1 h-1 bg-[#c2948a] rounded-full opacity-40"
            initial={{
                x: randomValues.x,
                y: randomValues.y,
            }}
            animate={{
                y: [null, randomValues.yEnd],
                opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
                duration: randomValues.duration,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
};
