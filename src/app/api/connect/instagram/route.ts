/* ============================================================
   INSTAGRAM/META OAUTH — /api/connect/instagram
   ============================================================
   GET:    Returns the Facebook OAuth authorization URL
           (Instagram posting uses Facebook Graph API)
   POST:   Exchanges code for token, fetches IG business account ID
   DELETE: Disconnects Instagram
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  return `${base}/api/connect/instagram/callback`;
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "FACEBOOK_APP_ID not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getRedirectUri(),
    scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
    response_type: "code",
    state: "instagram-connect",
  });

  return NextResponse.json({ url: `https://www.facebook.com/v19.0/dialog/oauth?${params}` });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
  }

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
