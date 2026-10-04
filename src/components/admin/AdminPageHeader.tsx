import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="text-label font-bold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-h1 font-bold tracking-tight text-foreground sm:text-display">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-body text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
