import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const form = await readFile("src/components/auth/RegisterForm.tsx", "utf8");
const client = await readFile("src/lib/api/http-client.ts", "utf8");
const session = await readFile("src/features/auth/session.ts", "utf8");
const nextConfig = await readFile("next.config.ts", "utf8");

assert.match(form, /\/api\/v1\/auth\/register|register\(\{/, "registration form must use the auth registration flow");
assert.match(form, /TextEncoder/, "registration should validate password UTF-8 byte length");
assert.match(form, /passwordBytes < 8/, "registration should reject passwords below backend minimum");
assert.match(form, /passwordBytes > 72/, "registration should reject passwords above backend BCrypt-safe maximum");
assert.match(form, /أكمل جميع الحقول المطلوبة/, "registration should provide a clear required-field error");
assert.match(form, /أدخل بريدًا إلكترونيًا صالحًا/, "registration should validate the email format");
assert.match(client, /fieldErrors\?: Record<string, string>/, "HTTP errors should preserve backend field errors");
assert.match(client, /Object\.values\(fieldErrors\)/, "HTTP client should surface field-level validation details");
assert.match(session, /["']\/api\/v1\/auth\/register["']/, "auth session should call the canonical register endpoint");
assert.match(
  nextConfig,
  /process\.env\.NODE_ENV === "development"\s*\?\s*"http:\/\/localhost:8080"\s*:\s*undefined/,
  "local development should default API rewrites to localhost:8080 when BACKEND_INTERNAL_URL is absent",
);
assert.doesNotMatch(
  nextConfig,
  /process\.env\.NODE_ENV === "production" \? "http:\/\/localhost:8080"/,
  "production must never fall back to localhost",
);

console.log("register flow contract checks passed");
