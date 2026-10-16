"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { changePassword } from "@/features/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!currentPassword || !newPassword) {
      setError("أدخل كلمة المرور الحالية والجديدة.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("تأكيد كلمة المرور الجديدة غير مطابق.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("اختر كلمة مرور مختلفة عن الحالية.");
      return;
    }

    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setNotice("تم تغيير كلمة المرور. سجّل الدخول مجددًا باستخدام كلمة المرور الجديدة.");
      router.replace("/login?passwordChanged=1");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تغيير كلمة المرور. تحقق من البيانات وحاول مرة أخرى.",
      );
      setBusy(false);
    }
  };

  return (
    <section className="rounded-md border border-neutral-200 bg-surface p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-50 text-brand">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-body font-bold text-foreground">تغيير كلمة المرور</h2>
          <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
            أدخل كلمة المرور الحالية، ثم اختر كلمة مرور جديدة. سيتم إنهاء الجلسة الحالية بعد نجاح العملية.
          </p>
        </div>
      </div>

      {notice ? (
        <p role="status" className="mt-5 rounded-md border border-success-100 bg-success-surface px-4 py-3 text-body-sm leading-6 text-foreground">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-5 rounded-md border border-danger-100 bg-danger-surface px-4 py-3 text-body-sm font-medium text-danger-600">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <Input
          id="change-password-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          label="كلمة المرور الحالية"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={busy}
        />
        <Input
          id="change-password-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          label="كلمة المرور الجديدة"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={busy}
        />
        <Input
          id="change-password-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label="تأكيد كلمة المرور الجديدة"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={busy}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={busy}>
            حفظ كلمة المرور الجديدة
          </Button>
        </div>
      </form>
    </section>
  );
}
