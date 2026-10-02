import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-neutral-300 bg-surface p-10 text-center sm:p-14">
      {icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      )}

      <h2 className="mt-5 text-xl font-black text-neutral-900">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </section>
  );
}