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

let cachedSessionUser: SessionUser | null | undefined;
let sessionRequest: Promise<SessionUser | null> | null = null;

async function readSession(): Promise<SessionUser | null> {
  try {
    const user = await apiClient.request<SessionUser>("/api/v1/auth/session");
    cachedSessionUser = user;
    return user;
  } catch (error) {
    if (error instanceof HttpApiError && error.status !== 401) throw error;
    cachedSessionUser = null;
    return null;
  }
}

function getSessionUser(): Promise<SessionUser | null> {
  if (cachedSessionUser !== undefined) return Promise.resolve(cachedSessionUser);
  sessionRequest ??= readSession().finally(() => { sessionRequest = null; });
  return sessionRequest;
}

export function clearCachedSession() {
  cachedSessionUser = undefined;
  sessionRequest = null;
}
export interface Session {
  status: SessionStatus;
  user?: SessionUser;
}

export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: "authenticating" });

  useEffect(() => {
    let active = true;

    getSessionUser()
      .then((user) => {
        if (active) {
          setSession(user ? { status: "authenticated", user } : { status: "unauthenticated" });
        }
      })
      .catch(() => {
        if (active) setSession({ status: "unauthenticated" });
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
    cachedSessionUser = user;
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
  clearCachedSession();
}
