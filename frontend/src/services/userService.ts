import { api } from "./api";
import { User } from "./authService";

export const userService = {
  getAll: (skip = 0, limit = 50) => api.get<User[]>(`/users?skip=${skip}&limit=${limit}`),
};
