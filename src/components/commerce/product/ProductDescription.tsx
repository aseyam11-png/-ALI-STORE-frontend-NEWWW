import { FileText } from "lucide-react";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({
  description,
}: ProductDescriptionProps) {
  if (!description.trim()) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-surface text-brand">
          <FileText className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-black text-foreground">
            Product description
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            Everything you need to know before you buy
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-4xl">
        <p className="whitespace-pre-line text-sm leading-7 text-neutral-600">
          {description}
        </p>
      </div>
    </section>
  );
}
