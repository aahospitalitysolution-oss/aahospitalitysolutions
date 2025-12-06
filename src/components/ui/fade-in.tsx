"use client";

import { createContext, useContext } from "react";
import { motion, useReducedMotion } from "motion/react";

const FadeInStaggerContext = createContext(false);

const viewport = { once: true, margin: "0px 0px -50px" };

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
    triggerOnMount?: boolean;
}

const FadeIn = ({ children, delay = 0, triggerOnMount = false, ...props }: FadeInProps) => {
    const shouldReduceMotion = useReducedMotion();
    const isInStaggerGroup = useContext(FadeInStaggerContext);

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8, delay }}
            {...(isInStaggerGroup
                ? {}
                : triggerOnMount
                    ? {
                        initial: "hidden",
                        animate: "visible",
                    }
                    : {
                        initial: "hidden",
                        whileInView: "visible",
                        viewport,
                    })}
            {...props}
        >
            {children}
        </motion.div>
    );
};

interface FadeInStaggerProps {
    children: React.ReactNode;
    faster?: boolean;
    className?: string;
    style?: React.CSSProperties;
    triggerOnMount?: boolean;
}

export const FadeInStagger = ({ faster = false, triggerOnMount = false, children, ...props }: FadeInStaggerProps) => {
    return (
        <FadeInStaggerContext.Provider value={true}>
            <motion.div
                initial="hidden"
                {...(triggerOnMount
                    ? { animate: "visible" }
                    : { whileInView: "visible", viewport })}
                transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
                {...props}
            >
                {children}
            </motion.div>
        </FadeInStaggerContext.Provider>
    );
};

export default FadeIn;
