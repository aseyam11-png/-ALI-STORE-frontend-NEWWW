import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "ali_store_session";

const PROTECTED_PREFIXES = ["/buyer", "/admin", "/system", "/warehouse"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (!protectedPath) {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/admin/:path*", "/system/:path*", "/warehouse/:path*"],
};
