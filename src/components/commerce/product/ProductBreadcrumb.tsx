import Link from "next/link";

interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

export function ProductBreadcrumb({
  category,
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      <Link
        href="/shop/products"
        className="transition-colors hover:text-foreground"
      >
        Shop
      </Link>

      <span>/</span>

      <span>{category}</span>

      <span>/</span>

      <span className="font-medium text-foreground">
        {productName}
      </span>
    </nav>
  );
}