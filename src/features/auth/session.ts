"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient, HttpApiError } from "@/lib/api/http-client";

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendSession = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
};

export type Session = {
  status: "unauthenticated" | "authenticating" | "authenticated" | "error";
  user?: SessionUser;
};

export function useSession(): Session {
  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      try {
        const response = await apiClient.request<ApiResponse<BackendSession>>("/api/v1/auth/session");
        if (!response.success) return null;
        return response.data;
      } catch (error) {
        if (error instanceof HttpApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  if (query.isLoading) return { status: "authenticating" };
  if (query.isError) return { status: "error" };
  if (!query.data) return { status: "unauthenticated" };

  return {
    status: "authenticated",
    user: {
      id: String(query.data.id),
      firstName: query.data.firstName,
      lastName: query.data.lastName,
      email: query.data.email,
      phoneNumber: query.data.phoneNumber,
      role: query.data.role,
    },
  };
}

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "invalid_credentials" | "server_error" };

export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult> {
  try {
    const response = await apiClient.request<ApiResponse<{
      token: string;
      email: string;
      role: string;
    }>>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.identifier.trim(),
        password: credentials.password,
      }),
    });

    if (!response.success || !response.data) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const me = await apiClient.request<ApiResponse<BackendSession>>("/api/v1/auth/session");
    if (!me.success) return { ok: false, reason: "server_error" };

    return {
      ok: true,
      user: {
        id: String(me.data.id),
        firstName: me.data.firstName,
        lastName: me.data.lastName,
        email: me.data.email,
        phoneNumber: me.data.phoneNumber,
        role: me.data.role,
      },
    };
  } catch (error) {
    if (error instanceof HttpApiError && [400, 401, 403, 404].includes(error.status)) {
      return { ok: false, reason: "invalid_credentials" };
    }
    return { ok: false, reason: "server_error" };
  }
}

export async function logout(queryClient?: QueryClient) {
  try {
    await apiClient.request<ApiResponse<null>>("/api/v1/auth/logout", {
      method: "POST",
    });
  } finally {
    queryClient?.removeQueries?.({ queryKey: ["auth", "session"] });
    await queryClient?.invalidateQueries?.({ queryKey: ["auth", "session"] });
  }
}

export function useSessionClientControls() {
  const queryClient = useQueryClient();
  return {
    refresh: () => queryClient.invalidateQueries({ queryKey: ["auth", "session"] }),
    logout: () => logout(queryClient),
  };
}
