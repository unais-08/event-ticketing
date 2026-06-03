import { create } from "zustand";
import type { AuthSession, User } from "@/app/_lib/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  setSession: (session: AuthSession) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  clearSession: () => void;
}

const STORAGE_USER = "eventflow_user";
const STORAGE_TOKEN = "eventflow_token";

function readInitialState() {
  if (typeof window === "undefined") {
    return { user: null as User | null, token: null as string | null, status: "idle" as const };
  }

  const rawUser = localStorage.getItem(STORAGE_USER);
  const token = localStorage.getItem(STORAGE_TOKEN);

  return {
    user: rawUser ? (JSON.parse(rawUser) as User) : null,
    token: token ?? null,
    status: rawUser ? ("authenticated" as const) : ("unauthenticated" as const),
  };
}

export const useAuthStore = create<AuthState>((set) => {
  const init = readInitialState();

  return {
    user: init.user,
    token: init.token,
    status: init.status,
    setSession: (session) => {
      if (session.token) {
        try {
          localStorage.setItem(STORAGE_TOKEN, session.token);
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_USER, JSON.stringify(session.user));
      } catch {}

      set({ user: session.user, token: session.token ?? null, status: "authenticated" });
    },
    setUser: (user) => {
      try {
        if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_USER);
      } catch {}

      set({ user, status: user ? "authenticated" : "unauthenticated" });
    },
    setStatus: (status) => set({ status }),
    clearSession: () => {
      try {
        localStorage.removeItem(STORAGE_USER);
        localStorage.removeItem(STORAGE_TOKEN);
      } catch {}
      set({ user: null, token: null, status: "unauthenticated" });
    },
  };
});
