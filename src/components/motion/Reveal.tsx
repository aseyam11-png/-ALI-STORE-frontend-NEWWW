"use client";

import {
  motion,
  type MotionProps,
} from "framer-motion";

import { DURATION, EASE_BRAND } from "@/lib/motion-tokens";

interface RevealProps
  extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: DURATION.slow,
        delay,
        ease: EASE_BRAND,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
