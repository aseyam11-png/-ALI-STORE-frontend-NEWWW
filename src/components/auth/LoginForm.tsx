"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { login } from "@/features/auth/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    let hasError = false;

    if (!normalizedEmail) {
      setEmailError("أدخل بريدك الإلكتروني");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("أدخل بريدًا إلكترونيًا صحيحًا");
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    if (!password) {
      setPasswordError("أدخل كلمة المرور");
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (hasError) return;

    setFormError(undefined);
    setSubmitting(true);

    const result = await login({
      identifier: normalizedEmail,
      password,
    });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(
        result.reason === "invalid_credentials"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
          : "تعذر الاتصال بخدمة الحساب. تحقق من تشغيل الخادم وحاول مرة أخرى.",
      );
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    router.replace("/buyer");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="login-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        label="البريد الإلكتروني"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
        disabled={submitting}
      />

      <div>
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
            disabled={submitting}
            className="absolute end-2 top-8 flex h-9 w-9 items-center justify-center rounded-sm text-neutral-500 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600"
        >
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        تسجيل الدخول
      </Button>
    </form>
  );
}
