/* ============================================================
   CONNECT STATUS — /api/connect/status
   ============================================================
   GET: Returns which platforms are connected with token
   expiry info. Used by the dashboard Settings tab.
   ============================================================ */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const creds = await prisma.platformCredential.findMany();

  // # Build a status map showing connected state and expiry for each platform
  const platforms: Record<string, { connected: boolean; expiresAt: string | null }> = {
    linkedin: { connected: false, expiresAt: null },
    twitter: { connected: false, expiresAt: null },
    instagram: { connected: false, expiresAt: null },
    tiktok: { connected: false, expiresAt: null },
  };

  for (const cred of creds) {
    platforms[cred.platform] = {
      connected: true,
      expiresAt: cred.expiresAt?.toISOString() || null,
    };
  }

  return NextResponse.json(platforms);
}
