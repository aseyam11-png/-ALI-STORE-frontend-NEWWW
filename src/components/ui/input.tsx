import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id;

  return (
    <div className="w-full">
      {label && inputId && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-body-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      {label && !inputId && (
        <span className="mb-2 block text-body-sm font-medium text-foreground">
          {label}
        </span>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          inputId && error
            ? `${inputId}-error`
            : inputId && hint
              ? `${inputId}-hint`
              : undefined
        }
        className={`h-11 w-full rounded-md border bg-surface px-3 text-body text-foreground outline-none transition-colors duration-200 ease-brand placeholder:text-neutral-400 focus:border-brand focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 ${
          error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
            : "border-neutral-200"
        } ${className}`}
        {...props}
      />

      {hint && !error && (
        <p
          id={inputId ? `${inputId}-hint` : undefined}
          className="mt-1.5 text-caption text-muted-foreground"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          className="mt-1.5 text-caption font-medium text-danger-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
