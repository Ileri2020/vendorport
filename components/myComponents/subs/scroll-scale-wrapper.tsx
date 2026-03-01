"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollScaleWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export const ScrollScaleWrapper = ({ children, className = "" }: ScrollScaleWrapperProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1.2 1"], // Starts entering viewport -> Fully visible
    });

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

    return (
        <motion.div
            ref={ref}
            style={{ scale }}//{{ scale, opacity }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};
