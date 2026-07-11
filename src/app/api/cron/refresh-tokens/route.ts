/* ============================================================
   INSTAGRAM TOKEN REFRESH — /api/cron/refresh-tokens
   ============================================================
   Called daily by Vercel Cron. Checks if the Instagram/Meta
   long-lived token expires within 7 days and refreshes it.

   Facebook Graph API long-lived tokens last 60 days but can be
   refreshed at any time after they're at least 24 hours old.
   The refresh returns a new 60-day token.

   Protected by CRON_SECRET (same as other cron routes).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/notify-admin";

// # Refresh when token expires within this many days
const REFRESH_THRESHOLD_DAYS = 7;

export async function GET(req: NextRequest) {
  // # Auth: verify CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // # Find Instagram credential with an expiry date
    const cred = await prisma.platformCredential.findUnique({
      where: { platform: "instagram" },
    });

    if (!cred || !cred.expiresAt) {
      return NextResponse.json({ refreshed: false, reason: "No Instagram token or no expiry date" });
    }

    // # Check if token expires within threshold
    const now = new Date();
    const msUntilExpiry = cred.expiresAt.getTime() - now.getTime();
    const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry > REFRESH_THRESHOLD_DAYS) {
      return NextResponse.json({
        refreshed: false,
        reason: `Token still valid for ${Math.round(daysUntilExpiry)} days`,
      });
    }

    if (daysUntilExpiry <= 0) {
      // # Token already expired — can't refresh, need manual re-auth
      await notifyAdmin("Instagram Token Expired", new Error("Token has expired and cannot be refreshed. Manual re-authentication required via /api/connect/instagram."), {
        expiredAt: cred.expiresAt.toISOString(),
      });
      return NextResponse.json({ refreshed: false, reason: "Token already expired — manual re-auth needed" });
    }

    // # Refresh the token via Facebook Graph API
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      return NextResponse.json({ error: "FACEBOOK_APP_ID or FACEBOOK_APP_SECRET not configured" }, { status: 500 });
    }

    const refreshRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: cred.accessToken,
      })}`
    );

    if (!refreshRes.ok) {
      const errText = await refreshRes.text();
      const error = new Error(`Facebook token refresh failed: ${refreshRes.status} ${errText}`);
      await notifyAdmin("Instagram Token Refresh Failed", error, {
        daysUntilExpiry: Math.round(daysUntilExpiry),
      });
      return NextResponse.json({ refreshed: false, error: errText }, { status: 502 });
    }

    const data = await refreshRes.json();
    const newToken = data.access_token;
    const newExpiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000);

    // # Update the stored credential with the fresh token
    await prisma.platformCredential.update({
      where: { platform: "instagram" },
      data: {
        accessToken: newToken,
        expiresAt: newExpiresAt,
      },
    });

    return NextResponse.json({
      refreshed: true,
      expiresAt: newExpiresAt.toISOString(),
      daysUntilOldExpiry: Math.round(daysUntilExpiry),
    });
  } catch (err) {
    await notifyAdmin("Instagram Token Refresh — Unexpected Error", err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: "Unexpected error during token refresh" }, { status: 500 });
  }
}
