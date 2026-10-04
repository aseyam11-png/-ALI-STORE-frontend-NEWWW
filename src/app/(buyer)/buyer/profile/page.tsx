"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import {
  updateProfile,
  useSession,
} from "@/features/auth/session";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export default function BuyerProfilePage() {
  const session = useSession();
  const displayName = useMemo(() => {
    const name = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");
    return name || "عميل ALI STORE";
  }, [form.firstName, form.lastName]);

  const initials = useMemo(
    () =>
      displayName
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [displayName],
  );

  const isDirty =
    session.status === "authenticated" &&
    session.user != null &&
    (form.firstName.trim() !== session.user.firstName ||
      form.lastName.trim() !== session.user.lastName ||
      form.phoneNumber.trim() !== (session.user.phoneNumber ?? "").trim());

  const validate = () => {
    if (!form.firstName.trim()) return "الاسم الأول مطلوب.";
    if (!form.lastName.trim()) return "اسم العائلة مطلوب.";
    if (form.firstName.trim().length > 100)
      return "الاسم الأول طويل جدًا.";
    if (form.lastName.trim().length > 100)
      return "اسم العائلة طويل جدًا.";
    if (form.phoneNumber.trim().length > 32)
      return "رقم الهاتف طويل جدًا.";
    return "";
  };

  const save = async () => {
    if (saving || !isDirty) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phoneNumber: updated.phoneNumber ?? "",
      });
      setSuccess("تم حفظ بيانات الملف الشخصي بنجاح.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر حفظ بيانات الملف الشخصي.",
      );
    } finally {
      setSaving(false);
    }
  };

  const setField =
    (field: keyof ProfileForm) =>
    (value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
      setError("");
      setSuccess("");
    };

  if (session.status === "loading") {
    return (
      <AccountWorkspace
        activeTab="profile"
        title="الملف الشخصي"
        description="إدارة معلومات التواصل المرتبطة بحسابك."
      >
        <div
          className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm"
          aria-busy="true"
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-neutral-100" />
              <div className="space-y-2">
                <div className="h-5 w-44 rounded bg-neutral-100" />
                <div className="h-3 w-28 rounded bg-neutral-100" />
              </div>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="h-12 rounded-xl bg-neutral-100" />
              <div className="h-12 rounded-xl bg-neutral-100" />
              <div className="h-12 rounded-xl bg-neutral-100 sm:col-span-2" />
            </div>
          </div>
          <p className="mt-5 text-body-sm text-muted-foreground">
            جارٍ التحقق من الجلسة...
          </p>
        </div>
      </AccountWorkspace>
    );
  }

  if (session.status !== "authenticated") {
    return (
      <AccountWorkspace
        activeTab="profile"
        title="الملف الشخصي"
        description="إدارة معلومات التواصل المرتبطة بحسابك."
      >
        <div className="rounded-2xl border border-neutral-200 bg-surface p-10 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-brand">
            <UserRound className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-h3 font-bold text-foreground">
            سجّل الدخول للوصول إلى ملفك الشخصي
          </h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm leading-6 text-muted-foreground">
            بيانات الملف الشخصي محفوظة في حسابك ولا يمكن عرضها قبل التحقق من الجلسة.
          </p>
          <Link
            href="/login?next=/buyer/profile"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-body font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <LogIn className="me-2 h-4 w-4" />
            تسجيل الدخول
          </Link>
        </div>
      </AccountWorkspace>
    );
  }

  const user = session.user;

  if (!user) {
    return (
      <AccountWorkspace
        activeTab="profile"
        title="الملف الشخصي"
        description="تعذر قراءة بيانات الحساب الحالية."
      >
        <div
          role="alert"
          className="rounded-2xl border border-danger-100 bg-danger-surface p-8 text-center text-body-sm text-danger-700"
        >
          تعذر قراءة بيانات الحساب الحالية. أعد تحميل الصفحة وحاول مرة أخرى.
        </div>
      </AccountWorkspace>
    );
  }

  return <AuthenticatedProfile user={user} />;
}

function AuthenticatedProfile({ user }: { user: NonNullable<ReturnType<typeof useSession>["user"]> }) {
  const [form, setForm] = useState<ProfileForm>({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <AccountWorkspace
      activeTab="profile"
      title="الملف الشخصي"
      description="حدّث بيانات التواصل الأساسية لحسابك مع إبقاء البريد والصلاحية محميين."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg font-black text-brand ring-8 ring-primary-50/50"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-caption font-medium text-muted-foreground">
                  الملف الشخصي
                </p>
                <h2 className="mt-1 truncate text-2xl font-black tracking-tight text-foreground">
                  {displayName}
                </h2>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  الحساب النشط
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-success-surface px-3 py-1.5 text-caption font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              جلسة موثقة
            </div>
          </div>

          {(error || success) && (
            <div
              className={
                "mt-6 rounded-xl border px-4 py-3 text-body-sm font-medium " +
                (error
                  ? "border-danger-100 bg-danger-surface text-danger-700"
                  : "border-success-100 bg-success-surface text-success")
              }
              role={error ? "alert" : "status"}
              aria-live="polite"
            >
              {error || success}
            </div>
          )}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Field
              id="profile-first-name"
              label="الاسم الأول"
              value={form.firstName}
              onChange={setField("firstName")}
              disabled={saving}
              autoComplete="given-name"
            />
            <Field
              id="profile-last-name"
              label="اسم العائلة"
              value={form.lastName}
              onChange={setField("lastName")}
              disabled={saving}
              autoComplete="family-name"
            />

            <ReadOnlyField
              id="profile-email"
              label="البريد الإلكتروني"
              value={user.email}
              icon={Mail}
              hint="لا يمكن تغيير البريد من هذه الصفحة."
            />

            <Field
              id="profile-phone"
              label="رقم الهاتف"
              value={form.phoneNumber}
              onChange={setField("phoneNumber")}
              disabled={saving}
              autoComplete="tel"
              inputMode="tel"
              placeholder="اختياري"
              icon={Phone}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-muted-foreground">
              يمكنك حفظ الاسم ورقم الهاتف فقط. تغيير كلمة المرور موجود في صفحة الأمان.
            </p>

            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !isDirty}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-sm font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-surface text-brand">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-body font-bold text-foreground">
                  بيانات الحساب
                </h3>
                <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                  البريد الإلكتروني والصلاحية يقرؤهما النظام من الجلسة ولا يتم تعديلهما من نموذج الملف الشخصي.
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                <dt className="text-caption text-muted-foreground">البريد</dt>
                <dd className="max-w-[190px] truncate text-caption font-bold text-foreground">
                  {user.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                <dt className="text-caption text-muted-foreground">نوع الحساب</dt>
                <dd className="text-caption font-bold text-foreground">
                  {formatRole(user.role)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm">
            <h3 className="text-body font-bold text-foreground">اختصارات الحساب</h3>
            <div className="mt-4 grid gap-2">
              <Link
                href="/buyer/addresses"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-body-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                إدارة العناوين
              </Link>
              <Link
                href="/buyer/security"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-body-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-brand"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                أمان الحساب
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AccountWorkspace>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
  inputMode,
  placeholder,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "tel";
  placeholder?: string;
  icon?: LucideIcon;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-body-sm font-medium text-foreground">{label}</span>
      <div className="relative mt-2">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          maxLength={id === "profile-phone" ? 32 : 100}
          onChange={(event) => onChange(event.target.value)}
          className={
            "h-11 w-full rounded-xl border border-neutral-200 bg-surface text-body text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60 " +
            (Icon ? "ps-10 pe-3" : "px-3")
          }
        />
      </div>
    </label>
  );
}

function ReadOnlyField({
  id,
  label,
  value,
  hint,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-body-sm font-medium text-foreground">{label}</span>
      <div className="relative mt-2">
        <Icon
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id={id}
          type="email"
          value={value}
          readOnly
          aria-readonly="true"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 ps-10 pe-3 text-body text-foreground outline-none"
        />
      </div>
      <span className="mt-1.5 block text-[11px] text-muted-foreground">
        {hint}
      </span>
    </label>
  );
}

function formatRole(role: string) {
  return role
    .replace(/^ROLE_/i, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
