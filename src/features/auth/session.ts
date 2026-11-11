"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL, HttpApiError, apiClient } from "@/lib/api/http-client";

type ApiEnvelope<T> = {
  data: T;
};

export type OtpPurpose = "EMAIL_VERIFICATION" | "LOGIN" | "ADMIN_LOGIN";

type AuthResponse = {
  email: string;
  role: string;
  requiresEmailVerification?: boolean;
  challengeId?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  purpose?: OtpPurpose;
};

export type VerificationChallenge = {
  challengeId: string;
  maskedEmail: string;
  expiresInSeconds: number;
  purpose: OtpPurpose;
};

export type SessionStatus = "loading" | "unauthenticated" | "authenticated";

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

    const loadSession = async () => {
      try {
        const user = await getSession();
        if (!mounted) return;
        setSession(
          user
            ? { status: "authenticated", user }
            : { status: "unauthenticated" },
        );
      } catch {
        if (mounted) setSession({ status: "unauthenticated" });
      }
    };

    void loadSession();

    const handleProfileUpdated = () => {
      void loadSession();
    };

    const handleLogout = () => {
      if (mounted) setSession({ status: "unauthenticated" });
    };

    window.addEventListener("alistore:profile-updated", handleProfileUpdated);
    window.addEventListener("alistore:logout", handleLogout);

    return () => {
      mounted = false;
      window.removeEventListener(
        "alistore:profile-updated",
        handleProfileUpdated,
      );
      window.removeEventListener("alistore:logout", handleLogout);
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
      purpose: OtpPurpose;
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

export async function adminLogin(credentials: {
  email: string;
  password: string;
  adminGatePassword: string;
  captchaToken: string;
}): Promise<AuthResult> {
  try {
    const response = await apiClient.request<ApiEnvelope<AuthResponse>>(
      "/api/v1/auth/admin/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    return mapAuthResponse(response.data);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "admin_login_failed",
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
  purpose?: OtpPurpose;
}): Promise<AuthResult> {
  try {
    const endpoint =
      input.purpose === "ADMIN_LOGIN"
        ? "/api/v1/auth/admin/email/verify"
        : "/api/v1/auth/email/verify";
    const response = await apiClient.request<ApiEnvelope<AuthResponse>>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify({
          challengeId: input.challengeId,
          code: input.code,
        }),
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
  purpose: OtpPurpose = "EMAIL_VERIFICATION",
): Promise<
  { ok: true; challenge: VerificationChallenge } | { ok: false; reason: string }
> {
  try {
    const response = await apiClient.request<
      ApiEnvelope<VerificationChallenge>
    >(
      purpose === "ADMIN_LOGIN"
        ? "/api/v1/auth/admin/email/resend"
        : "/api/v1/auth/email/resend",
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

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<SessionUser> {
  const response = await apiClient.requestData<SessionUser>("/api/v1/me", {
    method: "PUT",
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phoneNumber: input.phoneNumber?.trim() || null,
    }),
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alistore:profile-updated"));
  }

  return response;
}

export async function logout(): Promise<void> {
  await apiClient.request<void>("/api/v1/auth/logout", {
    method: "POST",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("alistore:logout"));
  }
}
