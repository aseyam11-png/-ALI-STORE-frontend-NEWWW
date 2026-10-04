import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

interface ProductTrustProps {
  estimatedDelivery?: string;
  returnPolicy?: string;
}

// Replaces the old SupplierCard — that component was a per-product
// marketplace-seller profile ("Contact Supplier", "Visit Store", response
// rate/time, years on platform). AliStore is a single-merchant store: every
// order is with AliStore, never an independent seller, so this section
// reinforces customer -> AliStore instead of customer -> supplier. Only
// claims backed by real product/app data are shown (delivery estimate and
// return policy come from the actual product); the rest are standing,
// site-wide fulfillment facts already used elsewhere (see the homepage
// trust strip), not invented guarantees.
export function ProductTrust({
  estimatedDelivery,
  returnPolicy,
}: ProductTrustProps) {
  const items = [
    ...(estimatedDelivery
      ? [{
          icon: Truck,
          title: "Delivery",
          description: estimatedDelivery,
        }]
      : [{
          icon: Truck,
          title: "Shipping",
          description:
            "يتم تأكيد تكلفة الشحن وموعد التوصيل عند إتمام الطلب.",
        }]),
    {
      icon: ShieldCheck,
      title: "Secure checkout",
      description:
        "بيانات الدفع والطلب محمية أثناء العملية.",
    },
    ...(returnPolicy
      ? [{
          icon: RotateCcw,
          title: "Returns",
          description: returnPolicy,
        }]
      : []),
    {
      icon: Headphones,
      title: "AliStore support",
      description:
        "تابع طلبك أو تواصل مع الدعم بعد إتمام الشراء.",
    },
  ];

  return (
    <section
      aria-label="معلومات الشحن والثقة"
      className="rounded-2xl border border-neutral-200 bg-surface p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-surface text-brand">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-foreground">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
