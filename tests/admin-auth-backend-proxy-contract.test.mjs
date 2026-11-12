import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("backend proxy keeps protected API access server-side", async () => {
  const proxy = await readFile("src/proxy.ts", "utf8");

  assert.ok(proxy.includes("process.env.BACKEND_INTERNAL_URL"));
  assert.ok(proxy.includes("process.env.VERCEL_OIDC_TOKEN"));
  assert.ok(proxy.includes('"x-vercel-trusted-oidc-idp-token"'));
  assert.ok(proxy.includes("headers.delete(TRUSTED_SOURCE_HEADER)"));
  assert.ok(
    proxy.includes("headers.set(TRUSTED_SOURCE_HEADER, deploymentIdentity)"),
  );
  assert.ok(proxy.includes("NextResponse.rewrite(target"));
  assert.ok(proxy.includes('"/api/v1/:path*"'));
  assert.ok(proxy.includes('"/oauth2/:path*"'));
  assert.ok(proxy.includes('"/login/oauth2/:path*"'));
  assert.ok(proxy.includes('backend.protocol !== "https:"'));
});
