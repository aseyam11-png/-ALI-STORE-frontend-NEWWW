interface SkeletonProps {
  className?: string;
}

export function Skeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-surface">
      <Skeleton className="aspect-[4/3] rounded-none" />

      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}