import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

interface AuthShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  formFooter: ReactNode;
  focused?: boolean;
}

const reassurance = [
  {
    icon: ShieldCheck,
    title: "حساب واحد، تجربة أبسط",
    text: "احتفظ بطلباتك وعناوينك وإشعاراتك في مكان واحد.",
  },
  {
    icon: PackageCheck,
    title: "متابعة واضحة للطلب",
    text: "راجع حالة طلباتك ومراحل التنفيذ من حسابك.",
  },
  {
    icon: BellRing,
    title: "تنبيهات مهمة فقط",
    text: "تصلك التحديثات المرتبطة بالحساب والطلبات عند الحاجة.",
  },
] as const;

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  formFooter,
  focused = false,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-neutral-200 bg-surface">
        <div className="container-shell flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="العودة إلى الصفحة الرئيسية"
            className="inline-flex items-center gap-1 text-xl font-bold tracking-tight text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 sm:text-2xl"
          >
            Ali<span className="text-brand">Store</span>
          </Link>

          <Link
            href="/shop/products"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-3.5 text-body-sm font-medium text-neutral-700 transition-all duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">متابعة التسوق</span>
            <span className="sm:hidden">التسوق</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main
        className={
          "container-shell py-8 sm:py-12 lg:py-16 " +
          (focused ? "lg:py-20" : "")
        }
      >
        <div className={focused ? "mx-auto max-w-3xl" : "mx-auto max-w-6xl"}>
          {focused ? (
            <section
              aria-labelledby="auth-page-title"
              className="relative overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-surface p-5 shadow-floating sm:p-8 lg:p-10"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-10 top-0 h-px bg-primary-200"
              />
              <div
                aria-hidden="true"
                className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-primary-50/70 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -start-24 -bottom-28 h-64 w-64 rounded-full bg-neutral-100/80 blur-3xl"
              />

              <div className="relative">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="inline-flex items-center gap-2 rounded-md bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {eyebrow}
                  </div>

                  <p className="mt-6 text-caption font-medium tracking-[0.18em] text-muted-foreground">
                    ALI STORE
                  </p>

                  <h1
                    id="auth-page-title"
                    className="mt-2 text-h1 text-foreground sm:text-display"
                  >
                    {title}
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-body leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>

                <div className="mx-auto mt-8 max-w-2xl border-t border-neutral-100 pt-8 sm:mt-10 sm:pt-10">
                  <div className="min-w-0">{children}</div>

                  <div className="mt-7 border-t border-neutral-100 pt-6">
                    {formFooter}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)] lg:gap-8">
              <section
                aria-labelledby="auth-page-title"
                className="relative overflow-hidden rounded-[1.75rem] bg-brand-ink p-6 text-white shadow-raised sm:p-8 lg:p-10"
              >
                <div
                  aria-hidden="true"
                  className="absolute -end-20 -top-20 h-56 w-56 rounded-full border border-white/10"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 -start-12 h-48 w-48 rounded-full border border-primary-300/20"
                />

                <div className="relative flex h-full flex-col">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-label font-medium text-primary-300">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {eyebrow}
                  </div>

                  <div className="mt-8 max-w-xl">
                    <p className="text-label font-medium uppercase tracking-[0.16em] text-neutral-400">
                      ALI STORE
                    </p>
                    <h1
                      id="auth-page-title"
                      className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
                    >
                      {title}
                    </h1>
                    <p className="mt-4 max-w-lg text-body leading-7 text-neutral-300">
                      {description}
                    </p>
                  </div>

                  <div className="mt-10 grid gap-3">
                    {reassurance.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand-ink">
                              <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                              <h2 className="text-body-sm font-medium text-white">
                                {item.title}
                              </h2>
                              <p className="mt-1 text-caption leading-5 text-neutral-400">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto hidden pt-10 lg:block">
                    <Link
                      href="/support"
                      className="text-caption font-medium text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      تحتاج مساعدة؟ افتح مركز المساعدة
                    </Link>
                  </div>
                </div>
              </section>

              <section className="flex min-w-0 flex-col rounded-[1.75rem] border border-neutral-200 bg-surface p-6 shadow-raised sm:p-8 lg:p-9">
                <div className="mb-7 border-b border-neutral-100 pb-6">
                  <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
                    {eyebrow}
                  </p>
                  <h2 className="mt-2 text-h2 font-bold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>

                <div className="min-w-0">{children}</div>

                <div className="mt-7 border-t border-neutral-100 pt-6">
                  {formFooter}
                </div>
              </section>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-center text-caption text-muted-foreground sm:flex-row sm:text-start">
            <span>
              {focused
                ? "بياناتك تبقى ضمن حسابك وتُستخدم لتسهيل تجربة الشراء."
                : "تجربة تسجيل دخول مخصصة وآمنة لـ ALI STORE"}
            </span>
            <Link
              href="/"
              className="font-medium text-neutral-600 underline-offset-4 hover:text-brand hover:underline"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
