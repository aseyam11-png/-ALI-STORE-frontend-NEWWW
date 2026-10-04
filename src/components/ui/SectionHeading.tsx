import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: Route;
  actionLabel?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  action,
}: SectionHeadingProps) {
  const actionNode =
    action ??
    (actionHref && actionLabel ? (
      <Link
        href={actionHref}
        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-surface px-4 text-body-sm font-medium text-neutral-700 transition-all duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        {actionLabel}
      </Link>
    ) : null);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-h2 font-bold tracking-tight text-foreground lg:text-h1">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-body-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actionNode}
    </div>
  );
}
