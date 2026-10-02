"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";

type ToastVariant = "success" | "error";

interface ToastProps {
  open: boolean;
  message: ReactNode;
  variant?: ToastVariant;
  onClose: () => void;
}

export function Toast({
  open,
  message,
  variant = "success",
  onClose,
}: ToastProps) {
  if (!open) {
    return null;
  }

  const success = variant === "success";

  return (
    <div
      className="fixed bottom-5 end-5 z-[120] w-[min(380px,calc(100vw-2rem))]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-surface p-4 shadow-2xl ${
          success
            ? "border-success-100"
            : "border-danger-100"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            success
              ? "bg-success-50 text-success-600"
              : "bg-danger-50 text-danger-600"
          }`}
        >
          {success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-neutral-800">
            {success ? "Success" : "Error"}
          </p>

          <div className="mt-1 text-xs leading-5 text-neutral-500">
            {message}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}