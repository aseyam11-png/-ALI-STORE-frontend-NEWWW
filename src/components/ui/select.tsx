import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  children,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id;

  return (
    <div className="w-full">
      {label && selectId && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-bold text-neutral-800"
        >
          {label}
        </label>
      )}

      {label && !selectId && (
        <span className="mb-2 block text-sm font-bold text-neutral-800">
          {label}
        </span>
      )}

      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          selectId && error
            ? `${selectId}-error`
            : selectId && hint
              ? `${selectId}-hint`
              : undefined
        }
        className={`h-11 w-full rounded-xl border bg-surface px-3 text-sm text-neutral-700 outline-none transition-colors duration-200 ease-brand focus:border-brand focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 ${
          error
            ? "border-danger-300 focus:border-danger-500 focus:ring-danger-100"
            : "border-neutral-200"
        } ${className}`}
        {...props}
      >
        {children}
      </select>

      {hint && !error && (
        <p
          id={selectId ? `${selectId}-hint` : undefined}
          className="mt-1.5 text-xs text-neutral-500"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={selectId ? `${selectId}-error` : undefined}
          role="alert"
          className="mt-1.5 text-xs font-semibold text-danger-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
