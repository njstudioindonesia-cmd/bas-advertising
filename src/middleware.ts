import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://urangdalambas.vercel.app";

  // 1. Redirect admin & operational portals ke domain terpisah Vercel
  if (pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.redirect(new URL(adminUrl), 307);
  }
  if (pathname === "/urang-dalam-bas-adv" || pathname.startsWith("/urang-dalam-bas-adv/")) {
    return NextResponse.redirect(new URL(adminUrl), 307);
  }
  if (pathname === "/driver" || pathname.startsWith("/driver/")) {
    return NextResponse.redirect(new URL(`${adminUrl}/driver`), 307);
  }
  if (pathname === "/vendor" || pathname.startsWith("/vendor/")) {
    return NextResponse.redirect(new URL(`${adminUrl}/vendor`), 307);
  }

  // 2. Tambahkan Security Headers standar industri & perbankan
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/urang-dalam-bas-adv/:path*",
    "/vendor/:path*",
    "/driver/:path*",
    "/((?!_next/static|_next/image|favicon.ico|uploads/|sw.js|manifest.webmanifest).*)",
  ],
};
