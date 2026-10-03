import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("browser API calls use the same-origin bridge while SSR uses the private backend origin", async () => {
  const source = await read("src/lib/api/http-client.ts");

  assert.match(source, /process\.env\.BACKEND_INTERNAL_URL/);
  assert.match(source, /process\.env\.NEXT_PUBLIC_API_BASE_URL \?\? ""/);
  assert.match(source, /typeof window === "undefined"/);
  assert.match(source, /credentials: "include"/);
});

test("Next.js proxies API and OAuth traffic to the configured private backend", async () => {
  const source = await read("next.config.ts");

  assert.match(source, /process\.env\.BACKEND_INTERNAL_URL/);
  assert.match(source, /source: "\/api\/v1\/:path\*"/);
  assert.match(source, /source: "\/oauth2\/:path\*"/);
  assert.match(source, /source: "\/login\/oauth2\/:path\*"/);
  assert.match(source, /destination: `\$\{backendInternalUrl\}\/api\/v1\/:path\*`/);
});

test("frontend runtime environment keeps the public API base same-origin by default", async () => {
  const source = await read(".env.example");

  assert.match(source, /NEXT_PUBLIC_API_BASE_URL=/);
  assert.match(source, /BACKEND_INTERNAL_URL=http:\/\/localhost:8080/);
  assert.match(source, /NEXT_PUBLIC_MEDIA_BASE_URL=/);
});
