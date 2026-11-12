const VERCEL_OIDC_HEADER = "x-vercel-oidc-token";
const TRUSTED_SOURCE_HEADER = "x-vercel-trusted-oidc-idp-token";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

function proxyError(message: string, status: number): Response {
  return Response.json(
    { success: false, message },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );
}

/**
 * Server-side Backend-for-Frontend transport.
 *
 * This runs inside a Node.js Route Handler, not Next.js Proxy/Middleware.
 * Vercel Functions provide the short-lived OIDC token on the incoming
 * x-vercel-oidc-token request header. The token is forwarded only to Vercel's
 * Trusted Sources verifier and is never returned to browser code.
 */
export async function proxyBackendRequest(request: Request): Promise<Response> {
  const configuredBackend = process.env.BACKEND_INTERNAL_URL?.trim();
  if (!configuredBackend) {
    return proxyError("Backend API is not configured.", 503);
  }

  let backend: URL;
  let incoming: URL;
  try {
    backend = new URL(configuredBackend);
    incoming = new URL(request.url);
  } catch {
    return proxyError("Backend API configuration is invalid.", 503);
  }

  if (
    backend.username ||
    backend.password ||
    backend.search ||
    backend.hash ||
    backend.pathname !== "/" ||
    (process.env.NODE_ENV === "production" && backend.protocol !== "https:")
  ) {
    return proxyError("Backend API configuration is not allowed.", 503);
  }

  const target = new URL(
    `${incoming.pathname}${incoming.search}`,
    backend,
  );
  if (target.origin !== backend.origin) {
    return proxyError("Backend API destination is invalid.", 503);
  }

  const deploymentIdentity =
    request.headers.get(VERCEL_OIDC_HEADER)?.trim() ?? "";
  if (process.env.VERCEL === "1" && !deploymentIdentity) {
    return proxyError("Vercel deployment identity is unavailable.", 503);
  }

  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  headers.delete("host");
  headers.delete("content-length");
  // Never forward platform identity material or trust an incoming
  // Trusted Sources header. Replace it with the signed token provided by Vercel.
  headers.delete(VERCEL_OIDC_HEADER);
  headers.delete(TRUSTED_SOURCE_HEADER);

  if (deploymentIdentity) {
    headers.set(TRUSTED_SOURCE_HEADER, deploymentIdentity);
  }

  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : request.body;

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
    ...(body ? { duplex: "half" as const } : {}),
  };

  try {
    const upstream = await fetch(target, init);
    const responseHeaders = new Headers(upstream.headers);
    const upstreamHeaders = upstream.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies = upstreamHeaders.getSetCookie?.() ?? [];

    for (const header of HOP_BY_HOP_HEADERS) {
      responseHeaders.delete(header);
    }
    // Node fetch may transparently decompress the upstream body.
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");

    if (setCookies.length > 0) {
      responseHeaders.delete("set-cookie");
      for (const cookie of setCookies) {
        responseHeaders.append("set-cookie", cookie);
      }
    }

    // Keep backend-local redirects on the same-origin BFF route. External
    // redirects (for example, Google OAuth) remain unchanged.
    const location = responseHeaders.get("location");
    if (location) {
      try {
        const redirectUrl = new URL(location, backend);
        if (redirectUrl.origin === backend.origin) {
          redirectUrl.host = incoming.host;
          redirectUrl.protocol = incoming.protocol;
          responseHeaders.set("location", redirectUrl.toString());
        }
      } catch {
        // Leave malformed or relative Location values untouched.
      }
    }

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy transport failed", {
      path: incoming.pathname,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return proxyError("Backend API is temporarily unavailable.", 502);
  }
}
