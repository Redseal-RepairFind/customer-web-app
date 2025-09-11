// middleware.ts
import { NextResponse, NextRequest } from "next/server";

/**
 * Name of the cookie that stores your user token.
 */
const COOKIE_NAME = process.env.NEXT_PUBLIC_TOKEN_COOKIE || "user_token";

/**
 * Where to send logged-in users.
 */
const APP_HOME = "/dashboard";

/**
 * Auth-only routes (users WITHOUT a token may access ONLY these).
 * Users WITH a token are redirected AWAY from these.
 */
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgotPassword",
  "/forgotPassword/checkEmail",
  "/forgotPassword/reset",
  "/resetPassword",
  "/otp",
  "/auth", // treat everything under /auth/* as auth screens
  "/home",
];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api");
}

/** reject callbackUrl to auth routes or "/" */
function sanitizeCallbackUrl(cb: string | null, req: NextRequest) {
  if (!cb) return null;
  try {
    const u = cb.startsWith("/") ? new URL(cb, req.url) : new URL(cb);
    const path = u.pathname;
    if (path === "/" || isAuthRoute(path)) return null; // prevent loops and auth->auth
    const rel = u.pathname + (u.search || "");
    if (rel.length > 1024) return null;
    return rel;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value ?? null;

  const isLoggedIn = Boolean(token);

  // === Unauthenticated ===
  if (!isLoggedIn) {
    // allow auth screens
    if (isAuthRoute(pathname)) {
      // strip bad callbackUrl if present on auth pages
      const raw = req.nextUrl.searchParams.get("callbackUrl");
      const safe = sanitizeCallbackUrl(raw, req);
      if (raw && !safe) {
        const url = req.nextUrl.clone();
        url.searchParams.delete("callbackUrl");
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // APIs: 401 instead of redirect
    if (isApiRoute(pathname)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // redirect ALL other routes (including "/") to /login (NOT "/")
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const target = pathname + (search || "");
    const safeCb = sanitizeCallbackUrl(target, req);
    if (safeCb) url.searchParams.set("callbackUrl", safeCb);
    return NextResponse.redirect(url);
  }

  // === Authenticated ===
  // root and auth screens should never be visible; always go to /dashboard
  if (pathname === "/" || isAuthRoute(pathname) || pathname === "/home") {
    const url = req.nextUrl.clone();
    url.pathname = APP_HOME;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // allowed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|public).*)",
  ],
};
