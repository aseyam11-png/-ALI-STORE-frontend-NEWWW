import { NextRequest, NextResponse } from "next/server";

const TRUSTED_SOURCE_HEADER = "x-vercel-trusted-oidc-idp-token";

function unavailable(message: string): NextResponse {
  return NextResponse.json({ message }, { status: 503 });
}

/**
 * Same-origin backend-for-frontend proxy.
 *
 * The browser never receives the backend origin or Vercel workload identity.
 * On Vercel, the frontend deployment authenticates to the protected backend
 * through Trusted Sources using its short-lived deployment OIDC token.
 */
export function proxy(request: NextRequest) {
  const configuredBackend = process.env.BACKEND_INTERNAL_URL?.trim();
  if (!configuredBackend) {
    return unavailable("Backend API is not configured.");
  }

  let backend: URL;
  try {
    backend = new URL(configuredBackend);
  } catch {
    return unavailable("Backend API configuration is invalid.");
  }

  if (
    backend.username ||
    backend.password ||
    backend.search ||
    backend.hash ||
    (process.env.NODE_ENV === "production" && backend.protocol !== "https:")
  ) {
    return unavailable("Backend API configuration is not allowed.");
  }

  const target = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    backend,
  );
  if (target.origin !== backend.origin) {
    return unavailable("Backend API destination is invalid.");
  }

  const headers = new Headers(request.headers);
  // Never trust a client-supplied workload identity header.
  headers.delete(TRUSTED_SOURCE_HEADER);

  const deploymentIdentity = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (process.env.VERCEL === "1" && !deploymentIdentity) {
    return unavailable("Vercel deployment identity is unavailable.");
  }
  if (deploymentIdentity) {
    headers.set(TRUSTED_SOURCE_HEADER, deploymentIdentity);
  }

  return NextResponse.rewrite(target, {
    request: { headers },
  });
}

export const config = {
  matcher: ["/api/v1/:path*", "/oauth2/:path*", "/login/oauth2/:path*"],
};
