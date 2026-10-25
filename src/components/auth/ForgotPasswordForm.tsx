"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

import {
  requestPasswordReset,
  resetPassword,
  type PasswordResetChallenge,
} from "@/features/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState<PasswordResetChallenge | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!isEmail(normalizedEmail)) {
      setError("أدخل بريدًا إلكترونيًا صالحًا.");
      return;
    }

    setBusy(true);
    try {
      const response = await requestPasswordReset(normalizedEmail);
      setChallenge(response);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice(
        "إذا كان البريد مرتبطًا بحساب، فستصلك تعليمات إعادة التعيين. أدخل الرمز المرسل إليك لإكمال العملية.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر بدء إعادة تعيين كلمة المرور. حاول مرة أخرى.",
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!challenge) return;
    if (!/^\d{6}$/.test(code.trim())) {
      setError("أدخل رمز التحقق المكوّن من ستة أرقام.");
      return;
    }
    if (!newPassword) {
      setError("أدخل كلمة المرور الجديدة.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword({
        challengeId: challenge.challengeId,
        code: code.trim(),
        newPassword,
      });
      window.location.assign("/login?passwordReset=1");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر إعادة تعيين كلمة المرور. تحقق من الرمز وحاول مجددًا.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {challenge ? (
        <div className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-brand">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-body-sm font-semibold text-foreground">
              تحقق من بريدك الإلكتروني
            </p>
            <p className="mt-1 text-caption leading-5 text-muted-foreground">
              أدخل رمز التحقق الذي وصلك. حفاظًا على خصوصية الحسابات، لا تكشف هذه الصفحة ما إذا كان البريد مسجلًا أم لا.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-brand">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-body-sm leading-6 text-muted-foreground">
            أدخل البريد المرتبط بحسابك. ستظهر لك الرسالة نفسها سواء كان الحساب موجودًا أم لا.
          </p>
        </div>
      )}

      {notice ? (
        <p role="status" className="rounded-md border border-success-100 bg-success-surface px-4 py-3 text-body-sm leading-6 text-foreground">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
          {error}
        </p>
      ) : null}

      {!challenge ? (
        <form onSubmit={requestCode} noValidate className="space-y-5">
          <Input
            id="forgot-password-email"
            name="email"
            type="email"
            autoComplete="email"
            label="البريد الإلكتروني"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
          <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
            إرسال تعليمات الاستعادة
          </Button>
        </form>
      ) : (
        <form onSubmit={confirmReset} noValidate className="space-y-5">
          <Input
            id="reset-password-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            label="رمز التحقق"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={busy}
          />
          <Input
            id="reset-password-new"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            label="كلمة المرور الجديدة"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={busy}
          />
          <Input
            id="reset-password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            label="تأكيد كلمة المرور الجديدة"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={busy}
          />
          <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
            إعادة تعيين كلمة المرور
          </Button>
          <button
            type="button"
            onClick={() => {
              setChallenge(null);
              setCode("");
              setNewPassword("");
              setConfirmPassword("");
              setError("");
              setNotice("");
            }}
            disabled={busy}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            استخدام بريد إلكتروني آخر
          </button>
        </form>
      )}

      <div className="border-t border-neutral-100 pt-4 text-center">
        <Link href="/login" className="inline-flex min-h-10 items-center gap-2 text-body-sm font-semibold text-brand hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
