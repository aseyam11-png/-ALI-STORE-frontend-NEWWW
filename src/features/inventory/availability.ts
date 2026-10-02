import { fetchSupplierInventory } from "./services/inventory-sync.service";

// The canonical CUSTOMER-FACING availability boundary. `inventory-sync.
// service.ts` (in this same feature) is the internal/supplier-facing sync
// boundary — its `InventoryRecord` carries `sellerId`, `price`,
// `supplierStatus` and other fields that must never reach customer UI
// (see business rule: suppliers are backend/integration concerns only).
// This module exists specifically to derive the small, safe, public shape
// from that internal record, so no component ever touches `InventoryRecord`
// directly. There is exactly one inventory boundary in this codebase now,
// not two — this file is a thin adapter over `inventory-sync.service.ts`,
// not an independent source.
//
// `useInventoryStore` (src/stores/inventory-store.ts) is not part of this
// boundary: it is never seeded by anything, has exactly one reader
// (B2CProductCard.tsx, on /shop/products, which this task does not modify),
// and is not adopted here — see the architecture report for why.
//
// No real inventory source exists yet (`fetchSupplierInventory` honestly
// returns `null`), so this can only ever resolve "unknown" today.
// Deliberately conservative: nothing may map "unknown" to "in stock" — that
// would be the exact fabrication this boundary exists to prevent. A
// component that cannot show real availability should hide availability UI
// entirely rather than call this and render "unknown" as if it were a real
// state.

export type PublicAvailability =
  | { state: "in_stock" }
  | { state: "out_of_stock" }
  | { state: "unknown" };

export async function getPublicAvailability(
  productId: string,
): Promise<PublicAvailability> {
  const record = await fetchSupplierInventory(productId);

  if (!record) {
    return { state: "unknown" };
  }

  return record.available > 0
    ? { state: "in_stock" }
    : { state: "out_of_stock" };
}
