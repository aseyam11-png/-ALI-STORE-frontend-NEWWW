"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { apiClient, HttpApiError } from "@/lib/api/http-client";

export type SessionStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated";

export type SessionRole = "CUSTOMER" | "ADMIN";

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: SessionRole;
}

export interface Session {
  status: SessionStatus;
  user?: SessionUser;
}

interface MeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

let snapshot: Session = { status: "unauthenticated" };
let initialized = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(next: Session) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function normalizeRole(role: string): SessionRole {
  return role === "ROLE_ADMIN" || role === "ADMIN" ? "ADMIN" : "CUSTOMER";
}

function mapUser(user: MeResponse): SessionUser {
  return {
    id: String(user.id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: normalizeRole(user.role),
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): Session {
  return { status: "unauthenticated" };
}

export async function refreshSession(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const previousUser = snapshot.user;
    emit({
      status: "authenticating",
      user: previousUser,
    });

    try {
      const user = await apiClient.requestApi<MeResponse>("/api/v1/auth/session");
      emit({
        status: "authenticated",
        user: mapUser(user),
      });
    } catch (error) {
      if (!(error instanceof HttpApiError) || error.status !== 401) {
        // A failed session lookup is still safer as unauthenticated than
        // rendering protected UI from stale client state.
      }
      emit({ status: "unauthenticated" });
    }
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

export function useSession(): Session {
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      void refreshSession();
    }
  }, []);

  return session;
}

export type LoginResult =
  | { ok: true; user: SessionUser }
  | {
      ok: false;
      reason:
        | "invalid_credentials"
        | "auth_unavailable"
        | "invalid_identifier";
    };

export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult> {
  const email = credentials.identifier.trim().toLowerCase();

  if (!email.includes("@")) {
    return { ok: false, reason: "invalid_identifier" };
  }

  emit({ status: "authenticating" });

  try {
    await apiClient.requestApi("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: credentials.password,
      }),
    });

    await refreshSession();

    if (snapshot.status === "authenticated" && snapshot.user) {
      return { ok: true, user: snapshot.user };
    }

    return { ok: false, reason: "auth_unavailable" };
  } catch (error) {
    emit({ status: "unauthenticated" });

    if (error instanceof HttpApiError && (error.status === 401 || error.status === 403)) {
      return { ok: false, reason: "invalid_credentials" };
    }

    return { ok: false, reason: "auth_unavailable" };
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.requestApi<void>("/api/v1/auth/logout", {
      method: "POST",
    });
  } finally {
    emit({ status: "unauthenticated" });
  }
}

export function useLogout() {
  return useCallback(() => logout(), []);
}
