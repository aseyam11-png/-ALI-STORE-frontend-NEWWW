import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ?? "ali_store_session";

export function middleware(request: NextRequest) {
  const protectedArea =
    request.nextUrl.pathname.startsWith("/buyer") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/system") ||
    request.nextUrl.pathname.startsWith("/warehouse");

  if (!protectedArea) {
    return NextResponse.next();
  }

  const hasSession = Boolean(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "?next=" + encodeURIComponent(
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/buyer/:path*",
    "/admin/:path*",
    "/system/:path*",
    "/warehouse/:path*",
  ],
};
