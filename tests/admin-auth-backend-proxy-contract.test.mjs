import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildBackendTarget } from "../src/lib/server/backend-proxy-target.mjs";

test("protected backend access is handled by Node.js route handlers", async () => {
  const helper = await readFile("src/lib/server/backend-proxy.ts", "utf8");
  const apiRoute = await readFile(
    "src/app/api/v1/[[...path]]/route.ts",
    "utf8",
  );
  const oauthRoute = await readFile(
    "src/app/oauth2/[[...path]]/route.ts",
    "utf8",
  );
  const callbackRoute = await readFile(
    "src/app/login/oauth2/[[...path]]/route.ts",
    "utf8",
  );
  const nextConfig = await readFile("next.config.ts", "utf8");

  assert.ok(helper.includes("request.headers.get(VERCEL_OIDC_HEADER)"));
  assert.ok(helper.includes('"x-vercel-oidc-token"'));
  assert.ok(helper.includes('"x-vercel-trusted-oidc-idp-token"'));
  assert.ok(helper.includes("headers.delete(VERCEL_OIDC_HEADER)"));
  assert.ok(helper.includes("headers.delete(TRUSTED_SOURCE_HEADER)"));
  assert.ok(
    helper.includes("headers.set(TRUSTED_SOURCE_HEADER, deploymentIdentity)"),
  );
  assert.ok(helper.includes('backend.protocol !== "https:"'));
  assert.ok(helper.includes('redirect: "manual"'));
  assert.ok(helper.includes('cache: "no-store"'));
  assert.ok(helper.includes("buildBackendTarget(backend, incoming)"));
  assert.doesNotMatch(helper, /process\.env\.VERCEL_OIDC_TOKEN/);

  const destinationGuard = helper.indexOf("if (!target)");
  const outboundFetch = helper.indexOf("await fetch(target, init)");
  assert.ok(destinationGuard >= 0 && destinationGuard < outboundFetch);

  for (const route of [apiRoute, oauthRoute, callbackRoute]) {
    assert.ok(route.includes('runtime = "nodejs"'));
    assert.ok(route.includes("proxyBackendRequest"));
    assert.ok(route.includes("export const GET"));
    assert.ok(route.includes("export const POST"));
  }

  assert.doesNotMatch(nextConfig, /async rewrites\(/);
  assert.doesNotMatch(nextConfig, /destination:.*BACKEND_INTERNAL_URL/);
});

test("request-controlled paths cannot redirect the backend target to another origin", () => {
  const backend = new URL("https://backend.internal/");
  const hostileRequests = [
    "https://frontend.example//attacker.example/steal",
    "https://frontend.example///attacker.example/steal",
    "https://frontend.example/..//attacker.example/steal",
  ];

  for (const requestUrl of hostileRequests) {
    const target = buildBackendTarget(backend, new URL(requestUrl));
    assert.equal(target, null, `Expected cross-origin path to be rejected: ${requestUrl}`);
  }
});

test("encoded slash paths and absolute URLs in query values stay on the backend origin", () => {
  const backend = new URL("https://backend.internal/");
  const safeRequests = [
    "https://frontend.example/api/v1/auth/login",
    "https://frontend.example/%2f%2fattacker.example/steal",
    "https://frontend.example/api/v1/auth/login?next=https://attacker.example",
  ];

  for (const requestUrl of safeRequests) {
    const target = buildBackendTarget(backend, new URL(requestUrl));
    assert.ok(target instanceof URL);
    assert.equal(target.origin, backend.origin);
  }
});
