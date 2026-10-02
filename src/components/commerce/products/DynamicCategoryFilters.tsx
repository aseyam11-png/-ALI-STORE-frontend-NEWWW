"use client";

import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  CategoryFilterDefinition,
} from "@/features/catalog/types/filter.types";

interface DynamicCategoryFiltersProps {
  filters: CategoryFilterDefinition[];

  onChange?: (
    filters: Record<
      string,
      string[]
    >,
  ) => void;
}

export function DynamicCategoryFilters({
  filters,
  onChange,
}: DynamicCategoryFiltersProps) {
  const [values, setValues] =
    useState<
      Record<
        string,
        string[]
      >
    >({});

  const activeCount =
    useMemo(
      () =>
        Object.values(
          values,
        ).reduce(
          (
            total,
            current,
          ) =>
            total +
            current.length,
          0,
        ),
      [values],
    );

  const update = (
    filterId: string,
    value: string,
    checked: boolean,
  ) => {
    const next =
      {
        ...values,
      };

    const current =
      next[filterId] ??
      [];

    if (checked) {
      next[filterId] =
        Array.from(
          new Set([
            ...current,
            value,
          ]),
        );
    } else {
      next[filterId] =
        current.filter(
          (item) =>
            item !==
            value,
        );
    }

    setValues(next);
    onChange?.(next);
  };

  const clear = () => {
    setValues({});
    onChange?.({});
  };

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 p-5">

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />

          <div>
            <h2 className="text-sm font-black text-slate-900">
              Filters
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {activeCount} active
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#2563EB] hover:underline"
        >
          <RotateCcw className="h-3 w-3" />
          Clear
        </button>

      </div>

      <div className="divide-y divide-slate-100">

        {filters.map(
          (filter) => (
            <FilterBlock
              key={filter.id}
              filter={filter}
              selected={
                values[
                  filter.id
                ] ?? []
              }
              onChange={(
                value,
                checked,
              ) =>
                update(
                  filter.id,
                  value,
                  checked,
                )
              }
            />
          ),
        )}

      </div>
    </aside>
  );
}

function FilterBlock({
  filter,
  selected,
  onChange,
}: {
  filter: CategoryFilterDefinition;
  selected: string[];
  onChange: (
    value: string,
    checked: boolean,
  ) => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(true);

  const options =
    filter.options ?? [];

  return (
    <div className="p-5">

      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-black uppercase tracking-wide text-slate-600">
          {filter.label}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-2">

          {options.map(
            (option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
              >

                <span className="flex min-w-0 items-center gap-2">

                  <input
                    type={
                      filter.control ===
                      "select"
                        ? "radio"
                        : "checkbox"
                    }
                    name={
                      filter.id
                    }
                    value={
                      option.value
                    }
                    checked={selected.includes(
                      option.value,
                    )}
                    onChange={(
                      event,
                    ) =>
                      onChange(
                        option.value,
                        event
                          .target
                          .checked,
                      )
                    }
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span className="truncate text-xs font-semibold text-slate-600">
                    {option.label}
                  </span>

                </span>

                {option.count !==
                  undefined && (
                  <span className="text-[10px] text-slate-400">
                    {option.count}
                  </span>
                )}

              </label>
            ),
          )}

        </div>
      )}

    </div>
  );
}