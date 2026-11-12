import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
  assert.ok(helper.includes("headers.set(TRUSTED_SOURCE_HEADER, deploymentIdentity)"));
  assert.ok(helper.includes('backend.protocol !== "https:"'));
  assert.ok(helper.includes('redirect: "manual"'));
  assert.ok(helper.includes('cache: "no-store"'));
  assert.doesNotMatch(helper, /process\.env\.VERCEL_OIDC_TOKEN/);

  for (const route of [apiRoute, oauthRoute, callbackRoute]) {
    assert.ok(route.includes('runtime = "nodejs"'));
    assert.ok(route.includes("proxyBackendRequest"));
    assert.ok(route.includes("export const GET"));
    assert.ok(route.includes("export const POST"));
  }

  assert.doesNotMatch(nextConfig, /async rewrites\(/);
  assert.doesNotMatch(nextConfig, /destination:.*BACKEND_INTERNAL_URL/);
});
