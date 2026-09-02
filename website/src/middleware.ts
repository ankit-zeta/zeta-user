import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers middleware — defense-in-depth layer.
// Auth is still enforced client-side (Convex localStorage token) and
// server-side (Convex functions verify sessions). This adds transport-level
// protections that the browser enforces before any JS runs.

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── 301 Redirects: /affiliate → /partner ─────────────────────────────────
  if (pathname.startsWith("/affiliate")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/affiliate", "/partner");
    // Preserve query string (e.g. ?ref=XXXXX)
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();

  // ── Security Headers ──────────────────────────────────────────────────
  // Prevent browsers from MIME-sniffing responses
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent page from being embedded in an iframe (clickjacking)
  response.headers.set("X-Frame-Options", "DENY");

  // Control referrer information sent with requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy — disable camera, microphone, geolocation by default
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );

  // HSTS — force HTTPS for 1 year, include subdomains (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // ── Block direct access to protected routes without valid session ─────
  // Note: Since Convex tokens are in localStorage (not cookies), middleware
  // cannot verify auth. The client-side layout already handles redirect.
  // This middleware adds a no-cache header to protected pages so browsers
  // don't serve stale authenticated content.
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/learning");

  if (isProtected) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|covers/).*)",
  ],
};
