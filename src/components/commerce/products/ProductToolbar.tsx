"use client";

interface ProductToolbarProps {
  productCount: number;
}

export function ProductToolbar({
  productCount,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">
          All Products
        </p>

        <p className="text-sm text-muted-foreground">
          {productCount} products available
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor="sort"
          className="text-sm text-muted-foreground"
        >
          Sort by
        </label>

        <select
          id="sort"
          className="h-10 rounded-md border bg-background px-3 text-sm"
          defaultValue="featured"
        >
          <option value="featured">
            Featured
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>

          <option value="rating">
            Highest Rated
          </option>

          <option value="reviews">
            Most Reviewed
          </option>
        </select>
      </div>
    </div>
  );
}