import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "discount"
  | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// One badge system for the whole product: a discount/sale badge is always
// this exact color, shape and size — never re-invented per section.
const variants: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-success-surface text-success-700",
  warning: "bg-warning-surface text-warning-700",
  danger: "bg-danger-surface text-danger-700",
  discount: "bg-discount text-white",
  info: "bg-primary-50 text-primary-700",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
