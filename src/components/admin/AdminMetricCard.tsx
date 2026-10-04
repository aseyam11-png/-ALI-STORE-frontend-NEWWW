import type { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "neutral";
  detail?: string;
}

const toneClasses = {
  brand: {
    icon: "bg-primary-50 text-brand",
    value: "text-foreground",
  },
  success: {
    icon: "bg-success-surface text-success-700",
    value: "text-foreground",
  },
  warning: {
    icon: "bg-warning-surface text-warning-700",
    value: "text-foreground",
  },
  neutral: {
    icon: "bg-neutral-100 text-neutral-600",
    value: "text-foreground",
  },
} as const;

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  detail,
}: AdminMetricCardProps) {
  const styles = toneClasses[tone];

  return (
    <article className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-raised transition-transform duration-200 ease-brand hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-body-sm font-medium text-muted-foreground">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-4 text-2xl font-bold tracking-tight ${styles.value}`}>{value}</p>
      {detail ? (
        <p className="mt-1 text-caption text-muted-foreground">{detail}</p>
      ) : null}
    </article>
  );
}
