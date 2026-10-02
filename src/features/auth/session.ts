"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ApiResponse } from "@/lib/api/contracts";
import { apiClient, HttpApiError } from "@/lib/api/http-client";

export type SessionStatus = "loading" | "unauthenticated" | "authenticated";

export interface SessionUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
}

export interface LoginResult {
  ok: boolean;
  user?: SessionUser;
  message?: string;
}

const EMPTY_SESSION: Session = {
  status: "unauthenticated",
  user: null,
};

export async function getCurrentSession(): Promise<SessionUser | null> {
  try {
    const response = await apiClient.request<ApiResponse<SessionUser>>(
      "/api/v1/auth/session",
    );
    return response.data;
  } catch (error) {
    if (error instanceof HttpApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult> {
  const email = credentials.identifier.trim().toLowerCase();

  if (!email.includes("@")) {
    return {
      ok: false,
      message: "أدخل بريدًا إلكترونيًا صالحًا.",
    };
  }

  try {
    const response = await apiClient.request<
      ApiResponse<{ email: string; role: string }>
    >("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: credentials.password,
      }),
    });

    const user = await getCurrentSession();

    return {
      ok: true,
      user:
        user ?? {
          id: 0,
          firstName: "",
          lastName: "",
          email: response.data.email,
          role: response.data.role,
        },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof HttpApiError
          ? error.message
          : "تعذر تسجيل الدخول حاليًا.",
    };
  }
}

export async function logout(): Promise<void> {
  await apiClient.request<ApiResponse<null>>("/api/v1/auth/logout", {
    method: "POST",
  });
}

interface SessionContextValue extends Session {
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    status: "loading",
    user: null,
  });

  const refresh = useCallback(async () => {
    setSession((current) =>
      current.status === "authenticated"
        ? current
        : { status: "loading", user: null },
    );

    try {
      const user = await getCurrentSession();
      setSession(user ? { status: "authenticated", user } : EMPTY_SESSION);
    } catch {
      setSession(EMPTY_SESSION);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider
      value={{
        ...session,
        refresh,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
