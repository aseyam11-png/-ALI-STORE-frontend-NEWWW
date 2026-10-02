import { ListChecks } from "lucide-react";

interface ProductSpecification {
  name: string;
  value: string;
}

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
}

export function ProductSpecifications({
  specifications,
}: ProductSpecificationsProps) {
  if (specifications.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-6 sm:p-8">

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          <ListChecks className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-black text-foreground">
            Product specifications
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            Technical and commercial details
          </p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-xl border border-neutral-200">
        {specifications.map((specification, index) => (
          <div
            key={`${specification.name}-${index}`}
            className={`grid grid-cols-1 sm:grid-cols-[240px_1fr] ${
              index !== specifications.length - 1
                ? "border-b border-neutral-200"
                : ""
            }`}
          >
            <div className="bg-neutral-50 px-4 py-3.5 text-sm font-bold text-neutral-700">
              {specification.name}
            </div>

            <div className="px-4 py-3.5 text-sm text-neutral-600">
              {specification.value}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
