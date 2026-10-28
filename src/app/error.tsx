"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ALI STORE route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
      <section
        role="alert"
        className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised"
      >
        <p className="text-label font-bold uppercase tracking-[0.14em] text-brand">
          ALI STORE
        </p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          تعذر تحميل هذه الصفحة
        </h1>
        <p className="mt-3 text-body-sm leading-6 text-muted-foreground">
          حدث خطأ مؤقت أثناء جلب البيانات. جرّب إعادة المحاولة قبل مغادرة
          الصفحة.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-body-sm font-medium text-white transition hover:bg-brand-hover"
        >
          إعادة المحاولة
        </button>
      </section>
    </main>
  );
}
