import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    root,
    environment: "jsdom",
    setupFiles: ["./tests/vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e"],
    globals: true,
    passWithNoTests: true,
    clearMocks: true,
    restoreMocks: true,
    reporters: ["default"],
  },
});
