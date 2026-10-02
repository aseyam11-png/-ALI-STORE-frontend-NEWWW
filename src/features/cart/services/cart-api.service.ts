import { apiClient } from "@/lib/api/http-client";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export type BackendCartItem = {
  id: number;
  productId: number;
  productName: string;
  productPrice: number | string;
  quantity: number;
  subTotal: number | string;
};

export type BackendCart = {
  id: number;
  items: BackendCartItem[];
  totalPrice: number | string;
};

export async function replaceBackendCart(items: Array<{ productId: number; quantity: number }>) {
  const clear = await apiClient.request<ApiResponse<null>>("/api/v1/cart", { method: "DELETE" });
  if (!clear.success) throw new Error(clear.message);

  for (const item of items) {
    const response = await apiClient.request<ApiResponse<BackendCart>>("/api/v1/cart/items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    if (!response.success) throw new Error(response.message);
  }
}

export async function getBackendCart(): Promise<BackendCart> {
  const response = await apiClient.request<ApiResponse<BackendCart>>("/api/v1/cart");
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export async function clearBackendCart() {
  const response = await apiClient.request<ApiResponse<null>>("/api/v1/cart", {
    method: "DELETE",
  });
  if (!response.success) throw new Error(response.message);
}
