"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type ImmersiveTier = "3d" | "2.5d" | "static";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");

    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

// Progressive tiering, tested rather than assumed: reduced-motion always
// wins (static, per WCAG 2.3.3 and the user's own OS-level choice); below
// that, real WebGL support plus a desktop-sized viewport gets the
// interactive 3D scene, everything else gets the lightweight CSS/Framer
// Motion 2.5D sequence. Computed once on mount — never during render, so
// server and first client render stay identical (no hydration mismatch).
export function useImmersiveTier(): ImmersiveTier | null {
  const prefersReducedMotion = useReducedMotion();
  const [tier, setTier] = useState<ImmersiveTier | null>(null);

  useEffect(() => {
    const isDesktopViewport =
      window.matchMedia("(min-width: 1024px)").matches;

    const computedTier: ImmersiveTier = prefersReducedMotion
      ? "static"
      : isDesktopViewport && supportsWebGL()
        ? "3d"
        : "2.5d";

    // Justified exception to react-hooks/set-state-in-effect: this value
    // has no prop/store to derive it from during render — it's a one-time
    // read of window.matchMedia + a real WebGL context probe, neither of
    // which exist during SSR or may safely run during the first client
    // render (would diverge from the server-rendered output and trigger a
    // hydration mismatch). Deferring the read to an effect, after mount, is
    // the correct and only SSR-safe way to compute it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTier(computedTier);
  }, [prefersReducedMotion]);

  return tier;
}
