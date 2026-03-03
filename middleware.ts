import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function verifySession(token: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;

  const iat = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);

  // Check expiry
  const issued = parseInt(iat, 10);
  if (isNaN(issued) || Date.now() - issued > SESSION_MAX_AGE_MS) return false;

  // Import HMAC key from SESSION_SECRET
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.SESSION_SECRET!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch {
    return false;
  }

  // Decode hex signature
  const hexPairs = sigHex.match(/[0-9a-f]{2}/gi);
  if (!hexPairs || hexPairs.length !== 32) return false; // SHA-256 = 32 bytes
  const sigBytes = new Uint8Array(hexPairs.map((h) => parseInt(h, 16)));

  // crypto.subtle.verify is timing-safe by spec
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(iat));
}

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Login page must not be protected (would cause infinite redirect loop)
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  if (token && (await verifySession(token))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
