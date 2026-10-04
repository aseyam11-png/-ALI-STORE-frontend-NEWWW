"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { login, loginWithGoogle } from "@/features/auth/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function resolveSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/buyer/profile";
  }
  return value;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = resolveSafeNextPath(searchParams.get("next"));
  const googleError =
    searchParams.get("error") === "google"
      ? "تعذر تسجيل الدخول عبر Google. حاول مرة أخرى."
      : undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
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

    const result = await login({ email: normalizedEmail, password });

    setSubmitting(false);

    if (!result.ok) {
      if (result.requiresEmailVerification) {
        const query = new URLSearchParams({
          challenge: result.challengeId,
          email: result.maskedEmail,
          purpose: result.purpose,
          next: nextPath,
        });
        window.location.assign("/verify-email?" + query.toString());
        return;
      }

      setFormError(result.reason);
      return;
    }

    window.location.assign(nextPath);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          label="البريد الإلكتروني"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
          disabled={submitting || googleSubmitting}
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
            disabled={submitting || googleSubmitting}
            className="pe-11"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
            aria-pressed={showPassword}
            className="absolute end-2 top-8 flex h-9 w-9 items-center justify-center rounded-sm text-neutral-500 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {(formError ?? googleError) && (
          <p
            role="alert"
            className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600"
          >
            {formError ?? googleError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={googleSubmitting}
          className="w-full"
        >
          تسجيل الدخول
        </Button>
      </form>

      <div className="relative flex items-center py-1">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="px-3 text-xs text-muted-foreground">أو</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        loading={googleSubmitting}
        disabled={submitting}
        onClick={() => {
          setFormError(undefined);
          setGoogleSubmitting(true);
          loginWithGoogle();
        }}
        className="w-full"
      >
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center rounded-full border border-neutral-300 bg-white text-sm font-bold"
        >
          G
        </span>
        المتابعة باستخدام Google
      </Button>
    </div>
  );
}
