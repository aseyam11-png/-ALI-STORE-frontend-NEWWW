"use client";

import { useEffect, useState } from "react";
import { apiClient, HttpApiError } from "@/lib/api/http-client";

export type SessionStatus = "unauthenticated" | "authenticating" | "authenticated";

export interface SessionUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
}

export interface Session {
  status: SessionStatus;
  user?: SessionUser;
}

export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: "authenticating" });

  useEffect(() => {
    let active = true;

    apiClient
      .request<SessionUser>("/api/v1/auth/session")
      .then((user) => {
        if (active) setSession({ status: "authenticated", user });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof HttpApiError && error.status === 401) {
          setSession({ status: "unauthenticated" });
          return;
        }
        setSession({ status: "unauthenticated" });
      });

    return () => {
      active = false;
    };
  }, []);

  return session;
}

export interface LoginResult {
  ok: boolean;
  user?: SessionUser;
  reason?: "invalid_credentials" | "request_failed";
}

type AuthResponse = {
  email: string;
  role: string;
};

export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult> {
  const email = credentials.identifier.trim().toLowerCase();

  if (!email.includes("@")) {
    return { ok: false, reason: "invalid_credentials" };
  }

  try {
    await apiClient.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: credentials.password,
      }),
    });

    const user = await apiClient.request<SessionUser>("/api/v1/auth/session");
    return { ok: true, user };
  } catch (error) {
    if (error instanceof HttpApiError && (error.status === 401 || error.status === 403)) {
      return { ok: false, reason: "invalid_credentials" };
    }
    return { ok: false, reason: "request_failed" };
  }
}

export async function logout(): Promise<void> {
  await apiClient.request<void>("/api/v1/auth/logout", { method: "POST" });
}
