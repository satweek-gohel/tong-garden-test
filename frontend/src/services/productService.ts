import { api } from "./api";
import { Product } from "@/types";

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  category_id: number;
  manufacturer?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock_quantity?: number;
  category_id?: number;
}

export const productService = {
  getAll: (skip = 0, limit = 20, categoryId?: number) =>
    api.get<Product[]>(
      `/products?skip=${skip}&limit=${limit}${categoryId ? `&category_id=${categoryId}` : ""}`
    ),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  search: (query: string) => api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`),
  create: (data: CreateProductInput) => api.post<Product>("/products", data),
  update: (id: number, data: UpdateProductInput) => api.put<Product>(`/products/${id}`, data),
  updateStock: (id: number, quantityChange: number, reason?: string) =>
    api.patch<Product>(`/products/${id}/stock`, { quantity_change: quantityChange, reason }),
  delete: (id: number) => api.delete<void>(`/products/${id}`),
};
