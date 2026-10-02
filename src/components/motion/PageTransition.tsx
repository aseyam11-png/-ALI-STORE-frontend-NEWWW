"use client";

import { motion } from "framer-motion";
import { DURATION, EASE_BRAND } from "@/lib/motion-tokens";

export function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: DURATION.slow,
        ease: EASE_BRAND,
      }}
    >
      {children}
    </motion.div>
  );
}
