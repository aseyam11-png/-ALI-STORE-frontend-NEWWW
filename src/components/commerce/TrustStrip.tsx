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
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-10">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-brand">
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
