"use client";

import type {
  CategoryFilter,
} from "@/features/categories/types/category.types";

interface CategoryFiltersProps {
  filters: CategoryFilter[];
  values: Record<
    string,
    string | string[]
  >;

  onChange: (
    filterId: string,
    value: string | string[],
  ) => void;

  onClear: () => void;
}

export function CategoryFilters({
  filters,
  values,
  onChange,
  onClear,
}: CategoryFiltersProps) {
  if (!filters.length) {
    return null;
  }

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900">
          Filters
        </h2>

        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-black text-[#2563EB] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="mt-6 space-y-6">

        {filters.map(
          (filter) => {
            const current =
              values[filter.id];

            if (
              filter.type ===
              "RANGE"
            ) {
              return (
                <div
                  key={
                    filter.id
                  }
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {filter.label}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={
                        filter.min
                      }
                      max={
                        filter.max
                      }
                      placeholder={`Min ${filter.min ?? ""}`}
                      value={
                        typeof current ===
                        "string"
                          ? current
                          : ""
                      }
                      onChange={(
                        event,
                      ) =>
                        onChange(
                          filter.id,
                          event.target
                            .value,
                        )
                      }
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                    />

                    <input
                      type="number"
                      min={
                        filter.min
                      }
                      max={
                        filter.max
                      }
                      placeholder={`Max ${filter.max ?? ""}`}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              );
            }

            if (
              filter.type ===
              "SELECT"
            ) {
              return (
                <div
                  key={
                    filter.id
                  }
                >
                  <label
                    htmlFor={`filter-${filter.id}`}
                    className="text-xs font-black uppercase tracking-wide text-slate-500"
                  >
                    {filter.label}
                  </label>

                  <select
                    id={`filter-${filter.id}`}
                    value={
                      typeof current ===
                      "string"
                        ? current
                        : "all"
                    }
                    onChange={(
                      event,
                    ) =>
                      onChange(
                        filter.id,
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="all">
                      All
                    </option>

                    {filter.options?.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              );
            }

            const selected =
              Array.isArray(
                current,
              )
                ? current
                : [];

            return (
              <div
                key={
                  filter.id
                }
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {filter.label}
                </p>

                <div className="mt-3 space-y-2">

                  {filter.options?.map(
                    (option) => {
                      const checked =
                        selected.includes(
                          option.value,
                        );

                      return (
                        <label
                          key={
                            option.value
                          }
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={(
                              event,
                            ) => {
                              const next =
                                event
                                  .target
                                  .checked
                                  ? [
                                      ...selected,
                                      option.value,
                                    ]
                                  : selected.filter(
                                      (
                                        value,
                                      ) =>
                                        value !==
                                        option.value,
                                    );

                              onChange(
                                filter.id,
                                next,
                              );
                            }}
                            className="h-4 w-4 accent-blue-600"
                          />

                          <span className="text-sm font-semibold text-slate-700">
                            {
                              option.label
                            }
                          </span>
                        </label>
                      );
                    },
                  )}

                </div>
              </div>
            );
          },
        )}

        <div className="border-t border-slate-100 pt-5">

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Free shipping
            </span>

            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-600"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">
              In stock
            </span>

            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-600"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Deals
            </span>

            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-600"
            />
          </label>

        </div>

      </div>
    </aside>
  );
}