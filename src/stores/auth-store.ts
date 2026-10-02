"use client";

import { create } from "zustand";

import { apiClient, HttpApiError } from "@/lib/api/http-client";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
}

type AuthState = {
  status: "loading" | "unauthenticated" | "authenticated";
  user: AuthUser | null;
  error: string | null;
  hydrate: () => Promise<AuthUser | null>;
  login: (email: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  logout: () => Promise<void>;
};

function messageFromError(error: unknown) {
  if (error instanceof HttpApiError) {
    if (error.status === 401) return "بيانات الدخول غير صحيحة.";
    if (error.status === 403) return "ليس لديك صلاحية لتنفيذ هذا الإجراء.";
    return error.message || "حدث خطأ غير متوقع.";
  }
  return "تعذر الاتصال بالخادم.";
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  error: null,

  hydrate: async () => {
    try {
      const user = await apiClient.get<AuthUser>("/auth/session");
      set({ status: "authenticated", user, error: null });
      return user;
    } catch (error) {
      if (error instanceof HttpApiError && error.status === 401) {
        set({ status: "unauthenticated", user: null, error: null });
        return null;
      }
      set({ status: "unauthenticated", user: null, error: messageFromError(error) });
      return null;
    }
  },

  login: async (email, password) => {
    try {
      await apiClient.post("/auth/login", { email, password });
      const user = await apiClient.get<AuthUser>("/auth/session");
      set({ status: "authenticated", user, error: null });
      return { ok: true, user };
    } catch (error) {
      const message = messageFromError(error);
      set({ status: "unauthenticated", user: null, error: message });
      return { ok: false, error: message };
    }
  },

  register: async (input) => {
    try {
      await apiClient.post("/auth/register", input);
      const user = await apiClient.get<AuthUser>("/auth/session");
      set({ status: "authenticated", user, error: null });
      return { ok: true, user };
    } catch (error) {
      const message = messageFromError(error);
      set({ status: "unauthenticated", user: null, error: message });
      return { ok: false, error: message };
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ status: "unauthenticated", user: null, error: null });
    }
  },
}));
