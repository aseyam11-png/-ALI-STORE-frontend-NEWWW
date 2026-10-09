import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Next.js applies baseline security headers to every route", async () => {
  const source = await readFile("next.config.ts", "utf8");

  assert.match(source, /async headers\(\)/);
  assert.match(source, /source:\s*["']\/:path\*["']/);
  assert.match(source, /X-Content-Type-Options["'],\s*value:\s*["']nosniff["']/);
  assert.match(source, /X-Frame-Options["'],\s*value:\s*["']DENY["']/);
  assert.match(source, /Referrer-Policy["'],\s*value:\s*["']strict-origin-when-cross-origin["']/);
  assert.match(source, /X-Permitted-Cross-Domain-Policies["'],\s*value:\s*["']none["']/);
});

test("HSTS is restricted to production configuration", async () => {
  const source = await readFile("next.config.ts", "utf8");

  assert.match(source, /if\s*\(process\.env\.NODE_ENV\s*===\s*["']production["']\)[\s\S]*?Strict-Transport-Security/);
  assert.match(source, /max-age=31536000/);
});
