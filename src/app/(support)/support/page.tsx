import { AppShell } from "@/components/layout/AppShell";
import { SupportCenterContent } from "@/components/support/SupportCenterContent";

export default function SupportPage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <section className="border-b border-neutral-200 bg-surface">
          <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
              Help center
            </p>
            <h1 className="mt-3 text-h1 font-bold tracking-tight text-foreground">
              كيف يمكننا مساعدتك؟
            </h1>
            <p className="mt-2 max-w-2xl text-body leading-7 text-muted-foreground">
              وصل سريع إلى الوظائف الفعلية في حسابك وطلباتك، دون عرض محادثات أو بيانات تجريبية.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
          <SupportCenterContent />
        </div>
      </main>
    </AppShell>
  );
}
