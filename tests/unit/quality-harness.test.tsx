import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

function QualityHarnessExample() {
  return (
    <main>
      <h1>ALI STORE</h1>
      <button type="button">Add to cart</button>
    </main>
  );
}

describe("advanced frontend quality harness", () => {
  it("renders through React Testing Library", () => {
    render(<QualityHarnessExample />);
    expect(screen.getByRole("heading", { name: "ALI STORE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
  });

  it("runs axe-core against the rendered DOM", async () => {
    const { container } = render(<QualityHarnessExample />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it("serves an MSW-backed deterministic health response", async () => {
    const response = await fetch("http://localhost/__quality__/health");
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
