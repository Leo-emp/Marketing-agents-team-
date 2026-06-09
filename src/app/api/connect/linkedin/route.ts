/* ============================================================
   LINKEDIN OAUTH — /api/connect/linkedin
   ============================================================
   GET:  Redirects to LinkedIn authorization page
   POST: Handles the callback code, exchanges for access token,
         stores in PlatformCredential table
   DELETE: Disconnects LinkedIn (removes stored credential)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  return `${base}/api/connect/linkedin/callback`;
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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "LINKEDIN_CLIENT_ID not configured" }, { status: 500 });
  }

  // # Generate random state and store signed version in cookie
  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("oauth-state-linkedin", `${state}.${signState(state)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    scope: "openid profile w_member_social",
    state,
  });

  return NextResponse.json({ url: `https://www.linkedin.com/oauth/v2/authorization?${params}` });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { code, state: clientState } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
  }

  // # Verify OAuth state to prevent CSRF
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("oauth-state-linkedin")?.value;
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
  cookieStore.delete("oauth-state-linkedin");

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "LinkedIn OAuth not configured" }, { status: 500 });
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 400 });
  }

  const tokenData = await tokenRes.json();
  const expiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

  await prisma.platformCredential.upsert({
    where: { platform: "linkedin" },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
    create: {
      platform: "linkedin",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}

export async function DELETE() {
  if (!(await isAdmin())) return unauthorized();
  await prisma.platformCredential.deleteMany({ where: { platform: "linkedin" } });
  return NextResponse.json({ success: true });
}
