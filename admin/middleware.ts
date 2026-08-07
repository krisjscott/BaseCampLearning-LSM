import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/recover-access"];

// This cookie is a UX marker only ("has this browser logged in before"), not a session
// token - it carries no data and isn't validated here. The real auth boundary is the
// Bearer access token AdminGuard checks client-side and every backend call re-validates
// server-side with @PreAuthorize/hasRole. Do not treat this middleware as an auth gate.
const SESSION_COOKIE = "basecamp_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|uploads/|actuator/|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|css|js|map)$).*)",
  ],
};
