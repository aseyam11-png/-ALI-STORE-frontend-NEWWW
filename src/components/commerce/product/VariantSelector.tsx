"use client";

import type {
  B2CProductVariant,
} from "@/features/products/types/b2c-product.types";

interface VariantSelectorProps {
  variants: B2CProductVariant[];

  selectedVariantId?: string;

  onChange: (
    variant: B2CProductVariant,
  ) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onChange,
}: VariantSelectorProps) {
  if (!variants.length) {
    return null;
  }

  const groups =
    Array.from(
      variants.reduce(
        (
          map,
          variant,
        ) => {
          const key =
            variant.name ||
            "Option";

          const group =
            map.get(key) ??
            [];

          group.push(
            variant,
          );

          map.set(
            key,
            group,
          );

          return map;
        },
        new Map<
          string,
          B2CProductVariant[]
        >(),
      ),
    );

  return (
    <div className="space-y-6">
      {groups.map(
        ([
          groupName,
          options,
        ]) => (
          <div
            key={groupName}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-foreground">
                {groupName}
              </h2>

              <span className="text-xs text-neutral-400">اختر</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {options.map(
                (variant) => {
                  const selected =
                    variant.id ===
                    selectedVariantId;

                  const isColor =
                    variant.type ===
                    "color";

                  return (
                    <button
                      key={
                        variant.id
                      }
                      type="button"
                      disabled={
                        !variant.available ||
                        (variant.stock !==
                          undefined &&
                          variant.stock <=
                            0)
                      }
                      onClick={() =>
                        onChange(
                          variant,
                        )
                      }
                      aria-pressed={
                        selected
                      }
                      className={`group/variant relative rounded-xl border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${
                        isColor
                          ? "h-11 w-11 p-1"
                          : "min-h-11 px-4"
                      } ${
                        selected
                          ? "border-brand bg-info-surface"
                          : "border-neutral-200 bg-surface hover:border-primary-200 hover:bg-info-surface"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {isColor ? (
                        <span
                          className="block h-full w-full rounded-lg border border-black/5"
                          style={{
                            backgroundColor:
                              variant.value,
                          }}
                          title={
                            variant.value
                          }
                        />
                      ) : (
                        <span className="text-xs font-bold text-neutral-700">
                          {
                            variant.value
                          }
                        </span>
                      )}

                      {selected && (
                        <span className="pointer-events-none absolute -end-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-black text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}