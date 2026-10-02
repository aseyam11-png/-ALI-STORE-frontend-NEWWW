"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Remember whatever had focus before the dialog opened so it can be
    // restored on close — the trigger button in every current caller.
    triggerRef.current = document.activeElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ui-dialog-title"
      aria-describedby={
        description ? "ui-dialog-description" : undefined
      }
    >
      <button
        type="button"
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-modal"
      >
        <div className="flex items-start justify-between border-b border-neutral-100 p-5">
          <div>
            <h2
              id="ui-dialog-title"
              className="text-h4 text-foreground"
            >
              {title}
            </h2>

            {description && (
              <p
                id="ui-dialog-description"
                className="mt-1 text-body-sm leading-6 text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-neutral-500 transition-colors duration-200 ease-brand hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}