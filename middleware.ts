import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect /admin/* routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("admin_auth")?.value;
  if (cookie === process.env.ADMIN_PASSWORD) {
    return NextResponse.next();
  }

  // Check basic auth header (for API clients)
  const auth = request.headers.get("authorization");
  if (auth) {
    const [, encoded] = auth.split(" ");
    const decoded = Buffer.from(encoded, "base64").toString();
    const [, pass] = decoded.split(":");
    if (pass === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  // Redirect to login
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
