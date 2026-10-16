import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("all customer authentication entry pages use the shared auth shell", async () => {
  for (const path of [
    "src/app/login/page.tsx",
    "src/app/register/page.tsx",
    "src/app/verify-email/page.tsx",
    "src/app/forgot-password/page.tsx",
  ]) {
    const source = await read(path);
    assert.match(source, /import \{ AuthShell \} from "@\/components\/auth\/AuthShell"/);
    assert.match(source, /<AuthShell/);
    assert.doesNotMatch(source, /CustomerShell/);
  }
});

test("auth shell provides a focused shopping return path and consistent trust hierarchy", async () => {
  const source = await read("src/components/auth/AuthShell.tsx");

  assert.match(source, /href="\/shop\/products"/);
  assert.match(source, /متابعة التسوق/);
  assert.match(source, /حساب واحد، تجربة أبسط/);
  assert.match(source, /متابعة واضحة للطلب/);
  assert.match(source, /تنبيهات مهمة فقط/);
  assert.match(source, /rounded-\[1\.75rem\]/);
  assert.match(source, /shadow-raised/);
  assert.match(source, /container-shell/);
});

test("login keeps real authentication logic separate from presentation", async () => {
  const page = await read("src/app/login/page.tsx");
  const form = await read("src/components/auth/LoginForm.tsx");

  assert.match(page, /<LoginForm \/>/);
  assert.match(form, /login\(\{ email: normalizedEmail, password \}\)/);
  assert.match(form, /loginWithGoogle\(\)/);
  assert.match(form, /window\.location\.assign\(nextPath\)/);
});

test("auth forms keep actionable navigation between the three steps", async () => {
  const login = await read("src/app/login/page.tsx");
  const register = await read("src/app/register/page.tsx");
  const verify = await read("src/app/verify-email/page.tsx");
  const forgot = await read("src/app/forgot-password/page.tsx");

  assert.match(login, /href="\/register"/);
  assert.match(login, /href="\/shop\/products"/);
  assert.match(register, /href="\/login"/);
  assert.match(verify, /href="\/login"/);
  assert.match(forgot, /href="\/login"/);
  assert.match(forgot, /<ForgotPasswordForm \/>/);
});
