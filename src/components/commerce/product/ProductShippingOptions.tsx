import { Clock3, Truck } from "lucide-react";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import type { ProductShippingMethod } from "@/features/products/types/product.types";

export function ProductShippingOptions({
  methods,
}: {
  methods: ProductShippingMethod[];
}) {
  const activeMethods = methods.filter((method) => method.available);

  if (activeMethods.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="product-shipping-options-title"
      className="mt-8 rounded-2xl border border-neutral-200 bg-surface p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-brand">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h2
            id="product-shipping-options-title"
            className="text-base font-black text-foreground"
          >
            طرق الشحن المتاحة
          </h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            الأسعار والمدد من إعدادات الشحن المعتمدة في المتجر، وقد تتغير حسب وجهة التوصيل.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {activeMethods.map((method) => (
          <article
            key={method.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-800">
                {method.name}
              </h3>
              {method.description ? (
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {method.description}
                </p>
              ) : null}
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Clock3 className="h-3.5 w-3.5" />
                {method.estimatedMinDays}-{method.estimatedMaxDays} يوم عمل
              </p>
            </div>
            <div className="shrink-0 text-sm font-black text-brand-ink">
              {method.price === 0 ? (
                "مجاني"
              ) : (
                <LocalizedPrice amountUSD={method.price} currency={method.currency} />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
