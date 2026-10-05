export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="جاري تحميل الصفحة"
      className="min-h-[60vh] bg-background px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1440px] animate-pulse">
        <div className="h-7 w-40 rounded-lg bg-neutral-100" />
        <div className="mt-4 h-4 w-72 rounded bg-neutral-100" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-72 rounded-2xl border border-neutral-200 bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
