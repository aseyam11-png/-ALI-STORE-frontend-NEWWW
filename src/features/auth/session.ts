"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/http-client";

export type SessionStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated";

export interface SessionUser {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phoneNumber?: string | null;
  role: string;
}

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function useSession(): Session {
  const [session, setSession] = useState<Session>({
    status: "authenticating",
    user: null,
  });

  useEffect(() => {
    let cancelled = false;

    apiClient
      .request<ApiResponse<SessionUser>>("/api/v1/auth/session")
      .then((response) => {
        if (!cancelled) {
          setSession({
            status: "authenticated",
            user: response.data,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession({
            status: "unauthenticated",
            user: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}

export interface LoginResult {
  ok: true;
  user: SessionUser;
}

export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult | { ok: false; reason: string }> {
  const response = await apiClient.request<ApiResponse<{ email: string; role: string }>>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: credentials.identifier.trim(),
        password: credentials.password,
      }),
    },
  );

  const session = await apiClient.request<ApiResponse<SessionUser>>(
    "/api/v1/auth/session",
  );

  return {
    ok: true,
    user: session.data,
  };
}

export async function logout(): Promise<void> {
  await apiClient.request("/api/v1/auth/logout", {
    method: "POST",
  });
}
