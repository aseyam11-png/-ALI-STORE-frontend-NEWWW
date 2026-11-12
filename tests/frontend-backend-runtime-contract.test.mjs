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
  assert.match(source, /Production API is not configured/);
  assert.ok(
    source.indexOf("Production API is not configured.") >
      source.indexOf("async request<T>"),
    "production API configuration must be checked when a request is made, not at module import",
  );
  assert.doesNotMatch(
    source,
    /Missing BACKEND_INTERNAL_URL or NEXT_PUBLIC_API_BASE_URL for production server rendering/,
    "module import must not throw only because deployment secrets are absent during build",
  );
  assert.match(source, /credentials: "include"/);
});

test("Node.js route handlers proxy API and OAuth traffic to the validated private backend", async () => {
  const helper = await read("src/lib/server/backend-proxy.ts");
  const apiRoute = await read("src/app/api/v1/[[...path]]/route.ts");
  const oauthRoute = await read("src/app/oauth2/[[...path]]/route.ts");
  const callbackRoute = await read("src/app/login/oauth2/[[...path]]/route.ts");
  const config = await read("next.config.ts");

  assert.match(helper, /process\.env\.BACKEND_INTERNAL_URL/);
  assert.match(helper, /Backend API is not configured/);
  assert.match(helper, /new URL\(configuredBackend\)/);
  assert.match(helper, /backend\.protocol !== "https:"/);
  assert.match(helper, /backend\.username/);
  assert.match(helper, /backend\.password/);
  assert.match(helper, /redirect: "manual"/);
  assert.match(helper, /cache: "no-store"/);

  for (const route of [apiRoute, oauthRoute, callbackRoute]) {
    assert.match(route, /runtime = "nodejs"/);
    assert.match(route, /proxyBackendRequest/);
    assert.match(route, /export const GET/);
    assert.match(route, /export const POST/);
  }

  assert.doesNotMatch(config, /async rewrites\(/);
  assert.doesNotMatch(config, /destination:.*BACKEND_INTERNAL_URL/);
});

test("frontend runtime environment keeps the public API base same-origin by default", async () => {
  const source = await read(".env.example");

  assert.match(source, /NEXT_PUBLIC_API_BASE_URL=/);
  assert.match(source, /BACKEND_INTERNAL_URL=http:\/\/localhost:8080/);
  assert.match(source, /NEXT_PUBLIC_MEDIA_BASE_URL=/);
});

test("brand suggestions keep the backend numeric brand identity", async () => {
  const autocomplete = await read(
    "src/features/search/services/autocomplete.service.ts",
  );
  const search = await read("src/features/search/services/search.service.ts");

  assert.match(autocomplete, /product\.brand\?\.id/);
  assert.match(autocomplete, /encodeURIComponent\(brand\.id\)/);
  assert.doesNotMatch(autocomplete, /encodeURIComponent\(brand\)/);

  assert.match(search, /product\.brand\?\.id/);
  assert.match(search, /encodeURIComponent\(id\)/);
  assert.doesNotMatch(search, /encodeURIComponent\(brand\)/);
});
