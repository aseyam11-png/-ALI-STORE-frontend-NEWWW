"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_BRAND } from "@/lib/motion-tokens";

export function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: DURATION.slow, ease: EASE_BRAND }
      }
    >
      {children}
    </motion.div>
  );
}
