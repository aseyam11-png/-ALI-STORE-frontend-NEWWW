import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("login and public verification mutations do not depend on a csrf bootstrap request", async () => {
  const source = await read("src/lib/api/http-client.ts");

  for (const path of [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/email/verify",
    "/api/v1/auth/email/resend",
  ]) {
    assert.match(source, new RegExp(
      `["']${path.replaceAll("/", "\\/")}["']`,
    ));
  }

  assert.match(source, /csrfExemptMutationPaths/);
  assert.match(source, /!csrfExemptMutationPaths\.has\(path\)/);
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

  assert.match(login, /login\(\{ email: normalizedEmail, password \}\)/);
  assert.match(login, /loginWithGoogle\(\)/);
  assert.match(session, /["']\/api\/v1\/auth\/login["']/);
  assert.match(session, /credentials/);
});

test("administrator authentication uses isolated endpoints and keeps generic login customer-only", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const otp = await read("src/components/auth/EmailOtpForm.tsx");
  const session = await read("src/features/auth/session.ts");

  assert.match(login, /adminGateEnabled \\?\\s*await adminLogin/);
  assert.match(login, /await login\\(\\{ email: normalizedEmail, password \\}\\)/);
  assert.match(session, /"\\/api\\/v1\\/auth\\/admin\\/login"/);
  assert.match(session, /"\\/api\\/v1\\/auth\\/admin\\/email\\/verify"/);
  assert.match(session, /"\\/api\\/v1\\/auth\\/admin\\/email\\/resend"/);
  assert.match(otp, /purpose === "ADMIN_LOGIN"/);
  assert.match(otp, /verifyEmailCode\\(\\{ challengeId, code, purpose \\}\\)/);
  assert.match(otp, /resendEmailCode\\(challengeId, purpose\\)/);
});

