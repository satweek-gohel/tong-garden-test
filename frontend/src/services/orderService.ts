import { api } from "./api";
import { Order } from "@/types";

export const orderService = {
  getAll: (skip = 0, limit = 20) => api.get<Order[]>(`/orders?skip=${skip}&limit=${limit}`),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (userId: number) => api.post<Order>("/orders", { user_id: userId }),
  addItem: (orderId: number, productId: number, quantity: number) =>
    api.post(`/orders/${orderId}/items`, { product_id: productId, quantity }),
  updateStatus: (orderId: number, status: string) => api.put<Order>(`/orders/${orderId}`, { status }),
  delete: (orderId: number) => api.delete<void>(`/orders/${orderId}`),
  processPayment: (orderId: number, amount: number, paymentMethod: string) =>
    api.post<{ status: string; order_id: number; amount: number }>(`/orders/${orderId}/payment`, {
      amount,
      payment_method: paymentMethod,
    }),
};
