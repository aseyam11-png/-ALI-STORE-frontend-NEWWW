"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  apiClient,
} from "@/lib/api/http-client";

import type {
  BackendUser,
} from "@/lib/api/contracts";

export type SessionStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated";

export interface Session {
  status: SessionStatus;
  user: BackendUser | null;
  refresh: () => Promise<void>;
}

let cachedUser:
  | BackendUser
  | null =
  null;

let sessionLoaded =
  false;

const listeners =
  new Set<
    () => void
  >();

function notify() {
  listeners.forEach(
    (listener) =>
      listener(),
  );
}

async function fetchSession() {
  try {
    const user =
      await apiClient.request<BackendUser>(
        "/api/v1/auth/session",
      );

    cachedUser = user;
    sessionLoaded = true;
    notify();

    return user;
  } catch (error) {
    cachedUser = null;
    sessionLoaded = true;
    notify();

    return null;
  }
}

export function useSession(): Session {
  const [user, setUser] =
    useState<BackendUser | null>(
      cachedUser,
    );

  const [
    loading,
    setLoading,
  ] = useState(
    !sessionLoaded,
  );

  useEffect(() => {
    const listener =
      () => {
        setUser(
          cachedUser,
        );
      };

    listeners.add(
      listener,
    );

    if (!sessionLoaded) {
      setLoading(true);

      void fetchSession()
        .finally(() =>
          setLoading(
            false,
          ),
        );
    }

    return () => {
      listeners.delete(
        listener,
      );
    };
  }, []);

  const refresh =
    useCallback(
      async () => {
        setLoading(true);

        try {
          await fetchSession();
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  return {
    status:
      loading
        ? "authenticating"
        : user
          ? "authenticated"
          : "unauthenticated",
    user,
    refresh,
  };
}

export interface LoginResult {
  ok: true;
  user: BackendUser;
}

export async function login(
  credentials: {
    identifier: string;
    password: string;
  },
): Promise<LoginResult> {
  const identifier =
    credentials.identifier.trim();

  if (!identifier) {
    throw new Error(
      "Email is required",
    );
  }

  const auth =
    await apiClient.request<{
      email: string;
      role: string;
    }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: identifier,
          password:
            credentials.password,
        }),
      },
    );

  void auth;

  const user =
    await fetchSession();

  if (!user) {
    throw new Error(
      "Login succeeded but no authenticated session was returned.",
    );
  }

  return {
    ok: true,
    user,
  };
}

export async function logout() {
  await apiClient.request<void>(
    "/api/v1/auth/logout",
    {
      method: "POST",
    },
  );

  cachedUser = null;
  sessionLoaded = true;
  notify();
}
