import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual, createHmac } from "node:crypto";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const expected = Buffer.from(process.env.ADMIN_PASSWORD!, "utf8");
  const provided = Buffer.from(typeof password === "string" ? password : "", "utf8");

  const valid =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const iat = Date.now().toString();
  const sig = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(iat)
    .digest("hex");
  const token = `${iat}.${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
