"use client";

export default function GlobalError() {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
          <section
            role="alert"
            className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised"
          >
            <p className="text-label font-bold uppercase tracking-[0.14em] text-brand">
              ALI STORE
            </p>
            <h1 className="mt-3 text-2xl font-bold">حدث خطأ غير متوقع</h1>
            <p className="mt-3 text-body-sm leading-6 text-muted-foreground">
              أعد تحميل الصفحة للمتابعة.
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
