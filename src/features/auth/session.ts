"use client";

import { useEffect, useState } from "react";

import {
  API_BASE_URL,
  HttpApiError,
  apiClient,
} from "@/lib/api/http-client";

type ApiEnvelope<T> = {
  data: T;
};

type AuthResponse = {
  email: string;
  role: string;
  requiresEmailVerification?: boolean;
  challengeId?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  purpose?: "EMAIL_VERIFICATION" | "LOGIN";
};

export type VerificationChallenge = {
  challengeId: string;
  maskedEmail: string;
  expiresInSeconds: number;
  purpose: "EMAIL_VERIFICATION" | "LOGIN";
};

export type SessionStatus =
  | "loading"
  | "unauthenticated"
  | "authenticated";

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
  const [session, setSession] = useState<Session>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((user) => {
        if (!mounted) return;
        setSession(user
          ? { status: "authenticated", user }
          : { status: "unauthenticated" });
      })
      .catch(() => {
        if (mounted) setSession({ status: "unauthenticated" });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return session;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const response = await apiClient.request<ApiEnvelope<SessionUser>>(
      "/api/v1/auth/session",
    );
    return response.data;
  } catch (error) {
    if (error instanceof HttpApiError && error.status === 401) return null;
    throw error;
  }
}

export type AuthResult =
  | { ok: true; email: string; role: string }
  | {
      ok: false;
      requiresEmailVerification: true;
      challengeId: string;
      maskedEmail: string;
      expiresInSeconds: number;
      purpose: "EMAIL_VERIFICATION" | "LOGIN";
    }
  | { ok: false; requiresEmailVerification?: false; reason: string };

function mapAuthResponse(data: AuthResponse): AuthResult {
  if (
    data.requiresEmailVerification &&
    data.challengeId &&
    data.maskedEmail &&
    data.expiresInSeconds &&
    data.purpose
  ) {
    return {
      ok: false,
      requiresEmailVerification: true,
      challengeId: data.challengeId,
      maskedEmail: data.maskedEmail,
      expiresInSeconds: data.expiresInSeconds,
      purpose: data.purpose,
    };
  }

  return {
    ok: true,
    email: data.email,
    role: data.role,
  };
}

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const response = await apiClient.request<ApiEnvelope<AuthResponse>>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    return mapAuthResponse(response.data);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "login_failed",
    };
  }
}

export async function register(credentials: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}): Promise<AuthResult> {
  try {
    const response = await apiClient.request<ApiEnvelope<AuthResponse>>(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    return mapAuthResponse(response.data);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "registration_failed",
    };
  }
}

export async function verifyEmailCode(input: {
  challengeId: string;
  code: string;
}): Promise<AuthResult> {
  try {
    const response = await apiClient.request<ApiEnvelope<AuthResponse>>(
      "/api/v1/auth/email/verify",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

    return mapAuthResponse(response.data);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "verification_failed",
    };
  }
}

export async function resendEmailCode(
  challengeId: string,
): Promise<
  | { ok: true; challenge: VerificationChallenge }
  | { ok: false; reason: string }
> {
  try {
    const response = await apiClient.request<ApiEnvelope<VerificationChallenge>>(
      "/api/v1/auth/email/resend",
      {
        method: "POST",
        body: JSON.stringify({ challengeId }),
      },
    );

    return { ok: true, challenge: response.data };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "resend_failed",
    };
  }
}

export function loginWithGoogle(): void {
  window.location.assign(API_BASE_URL + "/api/v1/auth/google");
}

export async function logout(): Promise<void> {
  await apiClient.request<void>("/api/v1/auth/logout", {
    method: "POST",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("alistore:logout"),
    );
  }
}
