"use client";

// The customer authentication boundary. No auth backend, session cookie,
// token store, or credential service exists anywhere in this repository
// today (verified by repository-wide search before writing this file) —
// there is nothing real to integrate with yet. This module exists so
// customer-facing UI (Login, Account, the Header) has ONE real seam to
// depend on instead of each screen inventing its own "am I logged in"
// logic or, worse, fabricating a logged-in state. Until a real backend is
// wired in, `status` can only ever be "unauthenticated" — this is
// intentional, not a bug: it is never allowed to silently become
// "authenticated" without a real credential exchange behind it.

export type SessionStatus = "unauthenticated" | "authenticating" | "authenticated";

export interface Session {
  status: SessionStatus;
}

// Deliberately not a hook with internal state yet — there is no session
// source to subscribe to. Kept as a function (not a stub returning fake
// user data) so call sites already read it the way they will once a real
// session provider exists, without pretending one exists now.
export function useSession(): Session {
  return { status: "unauthenticated" };
}

export interface LoginResult {
  ok: false;
  reason: "auth_backend_unavailable";
}

// Always fails honestly — there is no authentication backend to call. This
// function exists so the Login form has one real integration point to
// call (and to replace, wholesale, the day a real auth API exists) instead
// of the form component itself deciding what "success" would look like.
export async function login(credentials: {
  identifier: string;
  password: string;
}): Promise<LoginResult> {
  // Real input is accepted (and will be sent to a real backend once one
  // exists) but is not usable yet — nothing here inspects or stores it.
  void credentials;

  return { ok: false, reason: "auth_backend_unavailable" };
}
