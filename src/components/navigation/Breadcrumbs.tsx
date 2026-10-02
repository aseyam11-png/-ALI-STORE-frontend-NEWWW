"use client";

import type { Route } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

function formatSegment(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const visibleSegments = segments.slice(0, 4);

  return (
    <nav
      aria-label="Breadcrumb"
      className="overflow-x-auto text-sm text-slate-500"
    >
      <ol className="flex min-w-max items-center gap-1.5">

        <li>
          <Link
            href="/"
            className="rounded-md outline-none transition hover:text-[#2563EB] focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            Home
          </Link>
        </li>

        {visibleSegments.map((segment, index) => {
          const href =
            ("/" +
              visibleSegments
                .slice(0, index + 1)
                .join("/")) as Route;

          const isLast =
            index === visibleSegments.length - 1;

          return (
            <li
              key={`${segment}-${index}`}
              className="flex items-center gap-1.5"
            >
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-300 rtl:rotate-180"
                aria-hidden="true"
              />

              {isLast ? (
                <span
                  className="font-semibold text-slate-800"
                  aria-current="page"
                >
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="rounded-md outline-none transition hover:text-[#2563EB] focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}

      </ol>
    </nav>
  );
}
