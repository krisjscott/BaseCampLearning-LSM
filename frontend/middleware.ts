import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/onboarding",
  "/learning",
  "/my-learning",
  "/profile-preferences",
  "/notifications",
  "/certificates",
];

const SESSION_COOKIE = "basecamp_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
