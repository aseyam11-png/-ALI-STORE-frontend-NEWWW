"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  resendEmailCode,
  verifyEmailCode,
  type VerificationChallenge,
} from "@/features/auth/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EmailOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeId = searchParams.get("challenge") ?? "";
  const maskedEmail = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(() => Date.now() + 60_000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsUntilResend = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000),
  );

  const expiryMinutes = useMemo(() => {
    const seconds = challenge?.expiresInSeconds ?? 600;
    return Math.max(1, Math.ceil(seconds / 60));
  }, [challenge]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    if (!challengeId || !/^\d{6}$/.test(code)) {
      setError("أدخل رمز التحقق المكوّن من 6 أرقام.");
      return;
    }

    setSubmitting(true);
    const result = await verifyEmailCode({ challengeId, code });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.requiresEmailVerification ? "أعد إرسال رمز تحقق جديد." : result.reason);
      return;
    }

    router.replace("/buyer/profile");
  };

  const handleResend = async () => {
    if (!challengeId || secondsUntilResend > 0 || resending) return;

    setError(undefined);
    setResending(true);
    const result = await resendEmailCode(challengeId);
    setResending(false);

    if (!result.ok) {
      setError(result.reason);
      return;
    }

    const nextChallenge = result.challenge;
    setChallenge(nextChallenge);
    const query = new URLSearchParams({
      challenge: nextChallenge.challengeId,
      email: nextChallenge.maskedEmail,
    });

    window.history.replaceState(null, "", "/verify-email?" + query.toString());
    setCode("");
    setResendAvailableAt(Date.now() + 60_000);
  };

  if (!challengeId) {
    return (
      <div className="rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
        جلسة التحقق غير صالحة. ابدأ تسجيل الدخول أو إنشاء الحساب من جديد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-brand shadow-sm">
          <MailCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-body-sm font-semibold text-foreground">
            تم إرسال رمز تحقق إلى بريدك
          </p>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {maskedEmail || "بريدك الإلكتروني"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Input
            id="email-otp"
            name="code"
            label="رمز التحقق"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            disabled={submitting || resending}
          />
          <p className="text-xs text-muted-foreground">
            الرمز صالح لمدة تقارب {expiryMinutes} دقائق. لا تشاركه مع أي شخص.
          </p>
        </div>

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
          disabled={resending}
          className="w-full"
        >
          تأكيد الرمز والمتابعة
        </Button>
      </form>

      <div className="rounded-md border border-neutral-200 p-4">
        <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          لم يصلك الرمز؟
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          loading={resending}
          disabled={secondsUntilResend > 0 || submitting}
          onClick={handleResend}
          className="mt-3 w-full"
        >
          <RefreshCw className="h-4 w-4" />
          {secondsUntilResend > 0
            ? `إعادة الإرسال بعد ${secondsUntilResend}ث`
            : "إرسال رمز جديد"}
        </Button>
      </div>
    </div>
  );
}
