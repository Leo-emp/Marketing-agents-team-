/* ============================================================
   AUTH CHECK - Simple admin password gate
   ============================================================
   Marketing dashboard is admin-only. Checks a session cookie
   against the ADMIN_PASSWORD env var.
   ============================================================ */

import { cookies } from "next/headers";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("marketing-session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
