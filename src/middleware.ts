import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect legacy /admin to /urang-dalam-bas-adv
  if (pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.redirect(new URL("/urang-dalam-bas-adv", request.url), 307);
  }

  // 2. Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
