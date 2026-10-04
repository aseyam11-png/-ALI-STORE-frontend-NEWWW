interface AdminStatusPillProps {
  label: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
}

const toneClasses = {
  neutral: "bg-neutral-100 text-neutral-700",
  brand: "bg-primary-50 text-brand",
  success: "bg-success-surface text-success-700",
  warning: "bg-warning-surface text-warning-700",
  danger: "bg-danger-surface text-danger-700",
} as const;

export function AdminStatusPill({
  label,
  tone = "neutral",
}: AdminStatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium ${toneClasses[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
