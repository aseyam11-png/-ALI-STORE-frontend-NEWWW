"use client";

import type { Route } from "next";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { login } from "@/features/auth/session";
import { HttpApiError } from "@/lib/api/http-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const normalizedEmail = email.trim().toLowerCase();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    setEmailError(emailValid ? undefined : "أدخل بريدًا إلكترونيًا صحيحًا");
    setPasswordError(password ? undefined : "أدخل كلمة المرور");

    if (!emailValid || !password) return;

    setSubmitting(true);
    try {
      await login({ email: normalizedEmail, password });

      const next =
        searchParams.get("next")?.startsWith("/")
          ? searchParams.get("next")!
          : "/buyer";

      router.replace(next as Route);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof HttpApiError
          ? error.message
          : "تعذر تسجيل الدخول. تحقق من الاتصال وحاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="login-email"
        name="email"
        type="email"
        autoComplete="username"
        label="البريد الإلكتروني"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
        disabled={submitting}
      />

      <div className="relative">
        <Input
          id="login-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          label="كلمة المرور"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          disabled={submitting}
          className="pe-11"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
          aria-pressed={showPassword}
          className="absolute end-2 top-8 flex h-9 w-9 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
          {formError}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
        تسجيل الدخول
      </Button>
    </form>
  );
}
