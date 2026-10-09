import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("application TypeScript scope excludes optional test-runner config files", async () => {
  const config = JSON.parse(await readFile("tsconfig.json", "utf8"));
  const excluded = new Set(config.exclude ?? []);

  for (const file of [
    "vitest.config.ts",
    "playwright.config.ts",
    "cypress.config.ts",
  ]) {
    assert.equal(
      excluded.has(file),
      true,
      `Optional test-runner config must not enter the production application typecheck: ${file}`,
    );
  }
});

test("Cypress configuration is not a production runtime dependency", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const installedDependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  assert.equal(
    Object.hasOwn(installedDependencies, "cypress"),
    false,
    "This repository does not currently install Cypress as an application dependency",
  );
});
