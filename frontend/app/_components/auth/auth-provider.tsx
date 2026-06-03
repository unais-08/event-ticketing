"use client";

import { useEffect } from "react";
import { getMe } from "@/app/_lib/api";
import { useAuthStore } from "@/app/_stores/auth-store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      setStatus("loading");

      try {
        const response = await getMe();
        if (!isActive) return;
        setUser(response.data?.user ?? null);
      } catch {
        if (!isActive) return;
        setUser(null);
      }
    };

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [setStatus, setUser]);

  return children;
}
