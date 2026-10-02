export interface InventoryRecord {
  productId: string;
  sellerId: string;

  stock: number;
  reserved: number;

  available: number;

  price: number;
  currency: string;

  lastSyncedAt: string;

  supplierStatus:
    | "ONLINE"
    | "OFFLINE"
    | "OUT_OF_STOCK"
    | "SYNC_ERROR";
}