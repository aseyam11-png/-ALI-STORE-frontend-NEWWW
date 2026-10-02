"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/http-client";

export type SessionStatus = "loading" | "unauthenticated" | "authenticated";

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
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        return await apiClient.request<CurrentUser>("/v1/auth/session");
      } catch (error) {
        if (
          error instanceof Error &&
          "status" in error &&
          (error as { status?: number }).status === 401
        ) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (query.isPending) {
    return { status: "loading", user: null };
  }

  if (!query.data) {
    return { status: "unauthenticated", user: null };
  }

  return {
    status: "authenticated",
    user: query.data,
  };
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
