import type { InventoryRecord } from "../types/inventory.types";

export interface SupplierInventoryResponse {
  productId: string;
  sellerId: string;

  stock: number;
  price: number;

  currency: string;
}

export function mapSupplierInventory(
  response: SupplierInventoryResponse,
): InventoryRecord {
  const stock = Math.max(
    0,
    Math.floor(response.stock),
  );

  return {
    productId:
      response.productId,

    sellerId:
      response.sellerId,

    stock,

    reserved: 0,

    available: stock,

    price:
      Number(response.price) >= 0
        ? Number(response.price)
        : 0,

    currency:
      response.currency || "SAR",

    lastSyncedAt:
      new Date().toISOString(),

    supplierStatus:
      stock > 0
        ? "ONLINE"
        : "OUT_OF_STOCK",
  };
}

/*
  This is intentionally frontend-safe.

  Later the frontend will call:

  Spring Boot
      ↓
  Supplier Integration Service
      ↓
  Supplier API
      ↓
  Inventory + Price
*/

export async function fetchSupplierInventory(
  productId: string,
): Promise<InventoryRecord | null> {
  void productId;

  return null;
}