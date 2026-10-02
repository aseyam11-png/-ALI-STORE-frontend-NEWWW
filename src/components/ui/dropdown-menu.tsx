"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface DropdownMenuProps {
  label: string;
  children: ReactNode;
}

export function DropdownMenu({
  label,
  children,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-surface px-4 text-sm font-bold text-neutral-700 transition-colors duration-200 ease-brand hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ease-brand ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute end-0 top-12 z-50 min-w-48 rounded-xl border border-neutral-200 bg-surface p-2 shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}
