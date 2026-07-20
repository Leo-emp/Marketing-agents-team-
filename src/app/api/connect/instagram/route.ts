/* ============================================================
   INSTAGRAM/META OAUTH — /api/connect/instagram
   ============================================================
   GET:    Returns the Facebook OAuth authorization URL
           (Instagram posting uses Facebook Graph API)
   POST:   Exchanges code for token, fetches IG business account ID
   DELETE: Disconnects Instagram
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
  return `${base}/api/connect/instagram/callback`;
}

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET not configured");
  return secret;
}

function signState(state: string): string {
  return createHmac("sha256", getStateSecret()).update(state).digest("hex");
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "FACEBOOK_APP_ID not configured" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("oauth-state-instagram", `${state}.${signState(state)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getRedirectUri(),
    scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
    response_type: "code",
    state,
  });

  return NextResponse.json({ url: `https://www.facebook.com/v19.0/dialog/oauth?${params}` });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { code, state: clientState } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
  }

  // # Verify OAuth state to prevent CSRF
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("oauth-state-instagram")?.value;
  if (!stateCookie || !clientState) {
    return NextResponse.json({ error: "OAuth state missing — try connecting again" }, { status: 400 });
  }
  const [cookieState, cookieSig] = stateCookie.split(".");
  const expectedSig = signState(cookieState);
  if (
    cookieSig.length !== expectedSig.length ||
    !timingSafeEqual(Buffer.from(cookieSig), Buffer.from(expectedSig)) ||
    cookieState !== clientState
  ) {
    return NextResponse.json({ error: "OAuth state mismatch — possible CSRF" }, { status: 400 });
  }
  cookieStore.delete("oauth-state-instagram");

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Facebook/Instagram OAuth not configured" }, { status: 500 });
  }

  // # Exchange code for short-lived token
  const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: getRedirectUri(),
    code,
  })}`);

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 400 });
  }

  const { access_token: shortToken } = await tokenRes.json();

  // # Exchange for long-lived token (60 days)
  const longRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  })}`);

  const longData = await longRes.json();
  const accessToken = longData.access_token || shortToken;
  const expiresAt = new Date(Date.now() + (longData.expires_in || 5184000) * 1000);

  // # Find the Instagram Business Account ID linked to their Facebook pages
  const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  let igAccountId = "";

  for (const page of pagesData.data || []) {
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
    const igData = await igRes.json();
    if (igData.instagram_business_account?.id) {
      igAccountId = igData.instagram_business_account.id;
      break;
    }
  }

  if (!igAccountId) {
    return NextResponse.json({ error: "No Instagram Business account found. Make sure your Instagram is connected to a Facebook Page as a Business/Creator account." }, { status: 400 });
  }

  await prisma.platformCredential.upsert({
    where: { platform: "instagram" },
    update: {
      accessToken,
      expiresAt,
      metadata: JSON.stringify({ businessAccountId: igAccountId }),
    },
    create: {
      platform: "instagram",
      accessToken,
      expiresAt,
      metadata: JSON.stringify({ businessAccountId: igAccountId }),
    },
  });

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}

export async function DELETE() {
  if (!(await isAdmin())) return unauthorized();
  await prisma.platformCredential.deleteMany({ where: { platform: "instagram" } });
  return NextResponse.json({ success: true });
}
