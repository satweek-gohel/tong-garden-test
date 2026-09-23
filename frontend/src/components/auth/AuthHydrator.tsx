"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const AuthHydrator: React.FC = () => {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return null;
};
