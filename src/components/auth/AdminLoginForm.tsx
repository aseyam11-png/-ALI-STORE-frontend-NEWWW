"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { CloudflareTurnstile } from "@/components/auth/CloudflareTurnstile";
import { adminLogin } from "@/features/auth/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function resolveSafeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    !(value.startsWith("/admin") || value.startsWith("/warehouse"))
  ) {
    return "/admin";
  }
  return value;
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = resolveSafeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminGatePassword, setAdminGatePassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaEpoch, setCaptchaEpoch] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !adminGatePassword.trim()) {
      setError("أدخل البريد الإلكتروني وكلمة المرور وكلمة مرور بوابة الإدارة.");
      return;
    }
    if (!captchaToken) {
      setError("أكمل اختبار التحقق الأمني قبل المتابعة.");
      return;
    }

    setSubmitting(true);
    const result = await adminLogin({
      email: normalizedEmail,
      password,
      adminGatePassword,
      captchaToken,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.requiresEmailVerification) {
        const query = new URLSearchParams({
          challenge: result.challengeId,
          email: result.maskedEmail,
          purpose: "ADMIN_LOGIN",
          next: nextPath,
        });
        window.location.assign("/verify-email?" + query.toString());
        return;
      }

      setCaptchaToken("");
      setCaptchaEpoch((current) => current + 1);
      setError("تعذر تسجيل الدخول. تحقق من بيانات الإدارة واختبار الحماية وحاول مرة أخرى.");
      return;
    }

    // The backend contract requires an OTP challenge for every administrator.
    // A direct authenticated result is not accepted by this page.
    setError("لم يتم استلام خطوة التحقق الأمني المطلوبة. أعد المحاولة.");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm leading-6 text-foreground">
          يتطلب الدخول إلى لوحة الإدارة كلمة مرور صحيحة، ثم رمز تحقق من 6 أرقام
          يُرسل إلى البريد الإلكتروني المسجل لحساب المدير.
        </p>
      </div>

      <Input
        id="admin-login-email"
        name="email"
        type="email"
        autoComplete="username"
        label="البريد الإلكتروني لحساب الإدارة"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={submitting}
      />

      <Input
        id="admin-gate-password"
        name="adminGatePassword"
        type="password"
        autoComplete="off"
        label="كلمة مرور بوابة الإدارة الثانية"
        value={adminGatePassword}
        onChange={(event) => setAdminGatePassword(event.target.value)}
        disabled={submitting}
      />

      <CloudflareTurnstile
        key={captchaEpoch}
        onTokenChange={setCaptchaToken}
      />

      <Input
        id="admin-login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        label="كلمة المرور"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={submitting}
      />

      {error && (
        <p
          role="alert"
          className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        disabled={submitting || !adminGatePassword.trim() || !captchaToken}
        className="w-full"
      >
        متابعة التحقق
      </Button>
    </form>
  );
}
