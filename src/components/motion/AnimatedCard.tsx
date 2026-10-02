"use client";

import {
  motion,
} from "framer-motion";

import { DURATION, EASE_BRAND } from "@/lib/motion-tokens";

export function AnimatedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: DURATION.fast,
        ease: EASE_BRAND,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
