"use client";

interface ProductToolbarProps {
  productCount: number;
  sort?: "featured" | "price-low" | "price-high";
  onSortChange?: (
    sort: "featured" | "price-low" | "price-high",
  ) => void;
}

export function ProductToolbar({
  productCount,
  sort = "featured",
  onSortChange,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-black text-foreground">
          المنتجات
        </p>
        <p className="text-sm text-muted-foreground">
          {productCount.toLocaleString("en-US")} منتجات
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor="sort"
          className="text-sm text-muted-foreground"
        >
          الترتيب
        </label>

        <select
          id="sort"
          value={sort}
          onChange={(event) =>
            onSortChange?.(
              event.target.value as
                | "featured"
                | "price-low"
                | "price-high",
            )
          }
          className="h-10 rounded-xl border border-neutral-200 bg-background px-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-primary-100"
        >
          <option value="featured">الأكثر صلة</option>
          <option value="price-low">السعر: من الأقل</option>
          <option value="price-high">السعر: من الأعلى</option>
        </select>
      </div>
    </div>
  );
}
