import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("all browser unsafe requests, including login and OTP, prepare CSRF", async () => {
  const source = await read("src/lib/api/http-client.ts");

  assert.match(source, /const shouldPrepareCsrf =\s*unsafeMethod\s*&&\s*typeof window !== "undefined"/);
  assert.match(source, /requestHeaders\.set\("X-XSRF-TOKEN", csrfToken\)/);
  assert.match(source, /await fetch\(this\.baseUrl \+ "\/api\/v1\/auth\/csrf"/);
  assert.doesNotMatch(source, /csrfExemptMutationPaths/);
});
test("login preserves an internal next destination through the authentication challenge", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const otp = await read("src/components/auth/EmailOtpForm.tsx");

  assert.match(login, /resolveSafeNextPath/);
  assert.match(login, /searchParams\.get\("next"\)/);
  assert.match(login, /next: nextPath/);
  assert.match(login, /window\.location\.assign\(nextPath\)/);

  assert.match(otp, /resolveSafeNextPath/);
  assert.match(otp, /searchParams\.get\("next"\)/);
  assert.match(otp, /router\.replace\(nextPath\)/);
  assert.match(otp, /next: nextPath/);

  assert.match(login, /value\.startsWith\("\/"\)/);
  assert.match(login, /value\.startsWith\("\/\/"\)/);
});

test("login page remains a real backend-backed auth entry point", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const session = await read("src/features/auth/session.ts");

  assert.match(login, /login\(\{\s*email:\s*normalizedEmail,\s*password,/);
  assert.match(login, /loginWithGoogle\(\)/);
  assert.match(session, /["']\/api\/v1\/auth\/login["']/);
  assert.match(session, /credentials/);
});

