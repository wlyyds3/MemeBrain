"use client";

import { create } from "zustand";

import type { User } from "@/lib/api";

const AUTH_COOKIE_NAME = "memebrain-token";

function writeAuthCookie(token: string) {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("memebrain-token", token);
      localStorage.setItem("memebrain-user", JSON.stringify(user));
      writeAuthCookie(token);
    }
    set({ token, user });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("memebrain-token");
      localStorage.removeItem("memebrain-user");
      clearAuthCookie();
    }
    set({ token: null, user: null });
  },
  markHydrated: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("memebrain-token");
      const userRaw = localStorage.getItem("memebrain-user");
      set({
        token,
        user: userRaw ? (JSON.parse(userRaw) as User) : null,
        hydrated: true,
      });
      return;
    }
    set({ hydrated: true });
  },
}));
