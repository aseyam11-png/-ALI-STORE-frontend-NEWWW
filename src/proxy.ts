import { NextRequest, NextResponse } from "next/server";

const VERCEL_OIDC_HEADER = "x-vercel-oidc-token";
const TRUSTED_SOURCE_HEADER = "x-vercel-trusted-oidc-idp-token";

function unavailable(message: string): NextResponse {
  return NextResponse.json({ message }, { status: 503 });
}

/**
 * Same-origin backend-for-frontend proxy.
 *
 * Vercel injects the short-lived deployment OIDC token into the incoming
 * Function request header. The proxy forwards it only as the Trusted Sources
 * identity header; it never exposes the token to browser JavaScript.
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
  const deploymentIdentity = request.headers.get(VERCEL_OIDC_HEADER)?.trim();

  // Never forward platform identity material or trust a client-supplied
  // Trusted Sources header. The backend validates the signed OIDC token.
  headers.delete(VERCEL_OIDC_HEADER);
  headers.delete(TRUSTED_SOURCE_HEADER);

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
