import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const form = await readFile("src/components/auth/RegisterForm.tsx", "utf8");
const client = await readFile("src/lib/api/http-client.ts", "utf8");
const session = await readFile("src/features/auth/session.ts", "utf8");
const dev = await readFile("backend/src/main/resources/application-dev.yml", "utf8");

assert.match(form, /\/api\/v1\/auth\/register|register\(\{/, "registration form must use the auth registration flow");
assert.match(form, /TextEncoder/, "registration should validate password UTF-8 byte length");
assert.match(form, /passwordBytes < 8/, "registration should reject passwords below backend minimum");
assert.match(form, /passwordBytes > 72/, "registration should reject passwords above backend BCrypt-safe maximum");
assert.match(form, /أكمل جميع الحقول المطلوبة/, "registration should provide a clear required-field error");
assert.match(form, /أدخل بريدًا إلكترونيًا صالحًا/, "registration should validate the email format");

assert.match(client, /fieldErrors\?: Record<string, string>/, "HTTP errors should preserve backend field errors");
assert.match(client, /Object\.values\(fieldErrors\)/, "HTTP client should surface field-level validation details");

assert.match(session, /["']\/api\/v1\/auth\/register["']/, "auth session should call the canonical register endpoint");
assert.match(dev, /email-verification-enabled:\s*\$\{AUTH_EMAIL_VERIFICATION_ENABLED:false\}/, "dev verification should be opt-in");
assert.match(dev, /login-email-otp-enabled:\s*\$\{AUTH_LOGIN_EMAIL_OTP_ENABLED:false\}/, "dev login OTP should be opt-in");

console.log("register flow contract checks passed");
