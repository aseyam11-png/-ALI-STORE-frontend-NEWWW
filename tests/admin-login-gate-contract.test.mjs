import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
  return readFile(path, "utf8");
}

test("admin login submits the secondary password and an admin_login Turnstile token", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");
  const widget = await read("src/components/auth/CloudflareTurnstile.tsx");
  const service = await read("src/features/auth/session.ts");

  assert.match(login, /adminGatePassword/);
  assert.match(login, /captchaToken/);
  assert.match(login, /CloudflareTurnstile/);
  assert.match(login, /adminGateEnabled/);
  assert.match(widget, /action: "admin_login"/);
  assert.match(widget, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.match(service, /adminGatePassword\?: string/);
  assert.match(service, /captchaToken\?: string/);
});

test("admin gate is opt-in in the UI and Google OAuth is disabled while selected", async () => {
  const login = await read("src/components/auth/LoginForm.tsx");

  assert.match(login, /checked=\{adminGateEnabled\}/);
  assert.match(login, /adminGateEnabled \? \{ adminGatePassword, captchaToken \} : \{\}/);
  assert.match(login, /result\.role === "ROLE_ADMIN"/);
  assert.match(login, /disabled=\{submitting \|\| adminGateEnabled\}/);
});
