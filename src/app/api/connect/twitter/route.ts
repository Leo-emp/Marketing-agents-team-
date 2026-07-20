/* ============================================================
   TWITTER/X OAUTH 2.0 — /api/connect/twitter
   ============================================================
   GET:    Returns the authorization URL for X OAuth 2.0 PKCE
   POST:   Exchanges the callback code for access + refresh tokens
   DELETE: Disconnects X (removes stored credential)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
  return `${base}/api/connect/twitter/callback`;
}

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET not configured");
  return secret;
}

function signValue(value: string): string {
  return createHmac("sha256", getStateSecret()).update(value).digest("hex");
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "TWITTER_CLIENT_ID not configured" }, { status: 500 });
  }

  // # Generate PKCE verifier and random state, store both in signed cookies
  const pkceVerifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(pkceVerifier).digest("base64url");
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("oauth-state-twitter", `${state}.${signValue(state)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("oauth-pkce-twitter", `${pkceVerifier}.${signValue(pkceVerifier)}`, {
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
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.json({ url: `https://twitter.com/i/oauth2/authorize?${params}` });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { code, state: clientState } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
  }

  const cookieStore = await cookies();

  // # Verify OAuth state to prevent CSRF
  const stateCookie = cookieStore.get("oauth-state-twitter")?.value;
  if (!stateCookie || !clientState) {
    return NextResponse.json({ error: "OAuth state missing — try connecting again" }, { status: 400 });
  }
  const [cookieState, cookieSig] = stateCookie.split(".");
  const expectedSig = signValue(cookieState);
  if (
    cookieSig.length !== expectedSig.length ||
    !timingSafeEqual(Buffer.from(cookieSig), Buffer.from(expectedSig)) ||
    cookieState !== clientState
  ) {
    return NextResponse.json({ error: "OAuth state mismatch — possible CSRF" }, { status: 400 });
  }
  cookieStore.delete("oauth-state-twitter");

  // # Read PKCE verifier from signed cookie
  const pkceCookie = cookieStore.get("oauth-pkce-twitter")?.value;
  if (!pkceCookie) {
    return NextResponse.json({ error: "PKCE session expired — try connecting again" }, { status: 400 });
  }

  const [pkceVerifier, pkceSig] = pkceCookie.split(".");
  const expectedPkceSig = signValue(pkceVerifier);
  if (
    pkceSig.length !== expectedPkceSig.length ||
    !timingSafeEqual(Buffer.from(pkceSig), Buffer.from(expectedPkceSig))
  ) {
    return NextResponse.json({ error: "Invalid PKCE session" }, { status: 400 });
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId) {
    return NextResponse.json({ error: "Twitter OAuth not configured" }, { status: 500 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (clientSecret) {
    headers["Authorization"] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      client_id: clientId,
      code_verifier: pkceVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 400 });
  }

  const tokenData = await tokenRes.json();
  const expiresAt = new Date(Date.now() + (tokenData.expires_in || 7200) * 1000);

  await prisma.platformCredential.upsert({
    where: { platform: "twitter" },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
    create: {
      platform: "twitter",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
  });

  // # Clean up OAuth cookies
  cookieStore.delete("oauth-state-twitter");
  cookieStore.delete("oauth-pkce-twitter");

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}

export async function DELETE() {
  if (!(await isAdmin())) return unauthorized();
  await prisma.platformCredential.deleteMany({ where: { platform: "twitter" } });
  return NextResponse.json({ success: true });
}
