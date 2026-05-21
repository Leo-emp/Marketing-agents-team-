/* ============================================================
   AUTH CHECK - Simple admin password gate
   ============================================================
   Marketing dashboard is admin-only. Checks a session cookie
   containing a signed token.
   ============================================================ */

import { cookies } from "next/headers";
import { createHmac } from "crypto";

/* # Build a signed session token from the admin password */
export function buildSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD || "";
  return createHmac("sha256", secret).update("marketing-session").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("marketing-session");
  if (!session?.value) return false;
  return session.value === buildSessionToken();
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
