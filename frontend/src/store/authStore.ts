"use client";

import { create } from "zustand";
import { authService, User } from "@/services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string, role?: "user" | "admin") => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    try {
      const user = await authService.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const user = await authService.login(email, password);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, fullName, password, role = "user") => {
    await authService.register(email, fullName, password, role);
    const user = await authService.login(email, password);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authService.logout().catch(() => {});
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

export const useAuth = useAuthStore;
