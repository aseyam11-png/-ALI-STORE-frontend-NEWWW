/**
 * Single source of truth for framer-motion timing. CSS-side hover transitions use
 * Tailwind's own duration and ease-brand utilities (see globals.css); this file is
 * for the JS-side `transition={{ ... }}` values framer-motion needs, so the two
 * never drift apart.
 */

export const EASE_BRAND = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  /** Hover/tap micro-feedback — card lift, icon shift. */
  fast: 0.2,
  /** Small state changes — badge pop-in, tab underline. */
  normal: 0.3,
  /** Page-level entrances — PageTransition, Reveal. */
  slow: 0.45,
} as const;
