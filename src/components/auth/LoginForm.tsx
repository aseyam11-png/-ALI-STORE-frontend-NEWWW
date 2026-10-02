"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { login } from "@/features/auth/session";
import { HttpApiError } from "@/lib/api/http-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedIdentifier = identifier.trim();
    let hasError = false;

    if (!trimmedIdentifier) {
      setIdentifierError("أدخل بريدك الإلكتروني");
      hasError = true;
    } else {
      setIdentifierError(undefined);
    }

    if (!password) {
      setPasswordError("أدخل كلمة المرور");
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (hasError) {
      return;
    }

    setFormError(undefined);
    setSubmitting(true);

    try {
      await login({
        identifier: trimmedIdentifier,
        password,
      });

      router.replace("/buyer");
      router.refresh();
    } catch (error) {
      if (error instanceof HttpApiError) {
        if (error.status === 401) {
          setFormError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else if (error.status === 429) {
          setFormError("محاولات كثيرة. حاول مرة أخرى بعد قليل.");
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("تعذر تسجيل الدخول حاليًا. حاول مرة أخرى.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <Input
        id="login-identifier"
        name="email"
        type="email"
        autoComplete="username"
        label="البريد الإلكتروني"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={identifierError}
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
            className="absolute end-2 top-8 flex h-9 w-9 items-center justify-center rounded-sm text-neutral-500 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
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
