import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendBaseUrl =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8080";

const FORWARDED_HEADERS = [
  "accept",
  "content-type",
  "cookie",
  "authorization",
  "x-correlation-id",
  "x-request-id",
];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const suffix = path.map(encodeURIComponent).join("/");
  const upstream = new URL(
    `/api/v1/${suffix}${request.nextUrl.search}`,
    backendBaseUrl.endsWith("/") ? backendBaseUrl : `${backendBaseUrl}/`,
  );

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
