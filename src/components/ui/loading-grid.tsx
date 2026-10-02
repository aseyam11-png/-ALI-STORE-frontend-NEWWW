import { ProductCardSkeleton } from "./skeleton";

interface LoadingGridProps {
  count?: number;
}

export function LoadingGrid({
  count = 6,
}: LoadingGridProps) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}