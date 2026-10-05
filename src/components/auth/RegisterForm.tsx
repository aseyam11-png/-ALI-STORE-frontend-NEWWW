"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

import { register } from "@/features/auth/session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const passwordBytes =
      typeof TextEncoder !== "undefined"
        ? new TextEncoder().encode(form.password).length
        : new Blob([form.password]).size;

    if (!firstName || !lastName || !email || !form.password || !form.confirmPassword) {
      setFormError("أكمل جميع الحقول المطلوبة.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("أدخل بريدًا إلكترونيًا صالحًا.");
      return;
    }

    if (passwordBytes < 8) {
      setFormError("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.");
      return;
    }

    if (passwordBytes > 72) {
      setFormError("كلمة المرور طويلة جدًا. الحد الأقصى 72 بايت.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setSubmitting(true);
    const result = await register({
      firstName,
      lastName,
      email,
      password: form.password,
      phoneNumber: form.phoneNumber.trim() || undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.requiresEmailVerification) {
        const query = new URLSearchParams({
          challenge: result.challengeId,
          email: result.maskedEmail,
          purpose: result.purpose,
        });
        router.replace(("/verify-email?" + query.toString()) as Route);
        return;
      }

      setFormError(result.reason);
      return;
    }

    router.replace("/buyer/profile");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="register-first-name"
          name="firstName"
          label="الاسم الأول"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(event) => update("firstName", event.target.value)}
          disabled={submitting}
        />
        <Input
          id="register-last-name"
          name="lastName"
          label="اسم العائلة"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(event) => update("lastName", event.target.value)}
          disabled={submitting}
        />
      </div>

      <Input
        id="register-email"
        name="email"
        type="email"
        label="البريد الإلكتروني"
        autoComplete="email"
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        disabled={submitting}
      />

      <Input
        id="register-phone"
        name="phoneNumber"
        type="tel"
        label="رقم الهاتف (اختياري)"
        autoComplete="tel"
        value={form.phoneNumber}
        onChange={(event) => update("phoneNumber", event.target.value)}
        disabled={submitting}
      />

      <Input
        id="register-password"
        name="password"
        type="password"
        label="كلمة المرور"
        autoComplete="new-password"
        value={form.password}
        onChange={(event) => update("password", event.target.value)}
        disabled={submitting}
      />

      <Input
        id="register-confirm-password"
        name="confirmPassword"
        type="password"
        label="تأكيد كلمة المرور"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        disabled={submitting}
      />

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
        إنشاء الحساب
      </Button>
    </form>
  );
}
