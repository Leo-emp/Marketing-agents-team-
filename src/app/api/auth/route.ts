/* ============================================================
   AUTH API — /api/auth
   ============================================================
   Simple password login. Sets a signed session cookie on success.
   DELETE: Clears the session cookie (logout).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildSessionToken } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("marketing-session", buildSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

/* # Logout — clear session cookie */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("marketing-session");
  return NextResponse.json({ success: true });
}
