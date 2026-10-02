"use client";

import { useAuthStore } from "@/stores/auth-store";

export type SessionStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated";

export function useSession() {
  return useAuthStore((state) => ({
    status: state.status as SessionStatus,
    user: state.user,
  }));
}

export async function login(credentials: {
  identifier: string;
  password: string;
}) {
  return useAuthStore
    .getState()
    .login(credentials.identifier, credentials.password);
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}) {
  return useAuthStore.getState().register(input);
}
