import { api } from "./api";
import { Category } from "@/types";

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export const categoryService = {
  getAll: () => api.get<Category[]>("/categories"),
  create: (data: CreateCategoryInput) => api.post<Category>("/categories", data),
};
