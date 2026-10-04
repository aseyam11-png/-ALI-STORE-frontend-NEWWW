import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

// ALI STORE trust signals only — no supplier/marketplace trust language.
const items = [
  {
    icon: Truck,
    title: "توصيل موثوق",
    text: "تتبّع شحنتك من الطلب حتى الباب.",
  },
  {
    icon: ShieldCheck,
    title: "دفع آمن",
    text: "طرق دفع محمية عند كل عملية شراء.",
  },
  {
    icon: RotateCcw,
    title: "إرجاع سهل",
    text: "سياسة إرجاع واضحة وبسيطة.",
  },
  {
    icon: Headphones,
    title: "دعم العملاء",
    text: "فريق دعم جاهز لمساعدتك.",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-neutral-200 bg-surface">
      <div className="container-shell py-8 sm:py-9">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-neutral-200 lg:rtl:divide-x-reverse">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl px-2 py-2 lg:px-5 first:lg:ps-0 last:lg:pe-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-brand ring-1 ring-primary-100">
                  <Icon className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-body font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
