import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("auth_session")?.value;
    const mockRole = request.cookies.get("mock_role")?.value;

    // Check if the user is in mock admin mode or has a session token
    // If no session token at all, redirect to home
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If it's a dev mock session, ensure it's admin if mock_role is set
    // In production, layout.tsx (Server Component) will securely verify the DB session
    if (
      sessionToken.startsWith("tok_mock_") &&
      sessionToken !== "tok_mock_admin" &&
      mockRole !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
