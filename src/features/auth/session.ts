"use client";

import { useCallback, useEffect, useState } from "react";

import { HttpApiError, apiClient } from "@/lib/api/http-client";

export type SessionStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
}

export interface Session {
  status: SessionStatus;
  user: CurrentUser | null;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends Credentials {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export function useSession(): Session {
  const [session, setSession] = useState<Session>({
    status: "loading",
    user: null,
  });

  const refresh = useCallback(async () => {
    try {
      const user = await apiClient.request<CurrentUser>("/v1/auth/session");
      setSession({ status: "authenticated", user });
    } catch (error) {
      if (error instanceof HttpApiError && error.status === 401) {
        setSession({ status: "unauthenticated", user: null });
        return;
      }
      setSession({ status: "unauthenticated", user: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return session;
}

export async function login(credentials: Credentials) {
  return apiClient.request<{ email: string; role: string }>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function register(credentials: RegisterCredentials) {
  return apiClient.request<{ email: string; role: string }>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  await apiClient.request<void>("/v1/auth/logout", {
    method: "POST",
  });
}
