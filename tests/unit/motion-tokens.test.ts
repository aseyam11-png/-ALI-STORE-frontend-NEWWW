import { describe, expect, it } from "vitest";
import { DURATION, EASE_BRAND } from "@/lib/motion-tokens";

describe("ALI STORE motion tokens", () => {
  it("keeps the brand easing curve stable", () => {
    expect(EASE_BRAND).toEqual([0.22, 1, 0.36, 1]);
  });

  it("keeps duration tokens ordered for predictable motion hierarchy", () => {
    expect(DURATION.fast).toBeLessThan(DURATION.normal);
    expect(DURATION.normal).toBeLessThan(DURATION.slow);
  });
});
