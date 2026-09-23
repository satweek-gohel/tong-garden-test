"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { VerificationBanner } from "@/components/auth/VerificationBanner";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 px-12 py-10 flex flex-col gap-7 min-w-0">
        <VerificationBanner />
        {children}
      </main>
    </div>
  </ProtectedRoute>
);
