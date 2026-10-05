import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-surface p-8 text-center shadow-raised">
        <p className="text-5xl font-black text-brand">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          الصفحة غير موجودة
        </h1>
        <p className="mt-3 text-body-sm leading-6 text-muted-foreground">
          الرابط الذي فتحته غير متاح أو لم يعد موجودًا في المتجر.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-body-sm font-medium text-white transition hover:bg-brand-hover"
        >
          العودة للمتجر
        </Link>
      </section>
    </main>
  );
}
