import { api } from "./api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface MockEmailResponse {
  message: string;
  dev_link: string | null;
}

export interface MockOtpResponse {
  message: string;
  dev_otp: string | null;
}

export const authService = {
  login: (email: string, password: string) => api.post<User>("/auth/login", { email, password }),
  register: (email: string, full_name: string, password: string, role: "user" | "admin" = "user") =>
    api.post<User>("/auth/register", { email, full_name, password, role }),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<User>("/auth/me"),

  forgotPassword: (email: string) => api.post<MockOtpResponse>("/auth/forgot-password", { email }),
  resetPassword: (email: string, otp: string, newPassword: string, confirmPassword: string) =>
    api.post<User>("/auth/reset-password", {
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),

  resendVerification: (email: string) =>
    api.post<MockEmailResponse>("/auth/resend-verification", { email }),
  verifyEmail: (token: string) => api.post<User>("/auth/verify-email", { token }),
};
