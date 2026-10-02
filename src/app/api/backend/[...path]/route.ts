import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const ALLOWED_PREFIXES = [
  "/v1/auth",
  "/v1/products",
  "/v1/categories",
  "/v1/brands",
  "/v1/cart",
  "/v1/orders",
  "/v1/payments",
  "/v1/wishlists",
  "/v1/shipping",
  "/v1/coupons",
  "/v1/shipping-addresses",
  "/v1/reviews",
];

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const backendPath = "/" + path.join("/");

  if (!isAllowedPath(backendPath)) {
    return NextResponse.json(
      { success: false, message: "API route is not exposed", data: null },
      { status: 404 },
    );
  }

  const backendUrl = new URL(
    backendPath,
    BACKEND_URL.endsWith("/") ? BACKEND_URL : BACKEND_URL + "/",
  );
  backendUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("accept-encoding");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    responseHeaders.set("set-cookie", setCookie);
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
