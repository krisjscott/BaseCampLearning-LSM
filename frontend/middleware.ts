import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Every route whose page component wraps itself in <AuthGuard/> needs to be
// listed here too - AuthGuard is a client-side check (it only runs once the
// page's JS has loaded and mounted), so on its own it can't stop the
// server from serving the initial page shell to a logged-out visitor. This
// list used to cover only 6 of the ~25 actually-guarded routes; anything
// missing from it was reachable (at least for that first request) with no
// session at all - e.g. straight from the not-found page's "Explore
// courses" link, which points at a route that wasn't on this list.
const PROTECTED_ROUTES = [
  "/onboarding",
  "/learning",
  "/my-learning",
  "/my-learning-empty",
  "/profile-preferences",
  "/notifications",
  "/certificates",
  "/certificate-detail",
  "/certificate-progress",
  "/course",
  "/course-discussion",
  "/lesson",
  "/reading-lesson",
  "/assignment-submission",
  "/quiz",
  "/quiz-review",
  "/quiz-result",
  "/quiz-result-retake-required",
  "/progress",
  "/notes-bookmarks",
  "/explore",
  "/achievements",
  "/search-results",
  "/mandatory-learning",
  "/learning-calendar",
  "/help-support",
  "/category",
  "/path",
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
