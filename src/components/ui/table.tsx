import type { HTMLAttributes } from "react";

export function Table({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200">
      <table
        className={`w-full min-w-[640px] text-start text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

export function TableHead({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 ${className}`}
      {...props}
    />
  );
}

export function TableBody({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-neutral-100 ${className}`}
      {...props}
    />
  );
}

export function TableRow({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors duration-200 ease-brand hover:bg-neutral-50 ${className}`}
      {...props}
    />
  );
}

export function TableHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 text-start font-bold ${className}`}
      {...props}
    />
  );
}

export function TableCell({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-4 py-3 text-neutral-600 ${className}`}
      {...props}
    />
  );
}
