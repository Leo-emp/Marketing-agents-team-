/* ============================================================
   TIKTOK OAUTH — /api/connect/tiktok
   ============================================================
   GET:    Returns the TikTok OAuth authorization URL
   POST:   Exchanges the callback code for access + refresh tokens
   DELETE: Disconnects TikTok (removes stored credential)
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
  return `${base}/api/connect/tiktok/callback`;
}

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET not configured");
  return secret;
}

function signState(state: string): string {
  return createHmac("sha256", getStateSecret()).update(state).digest("hex");
}

// # TikTok uses PKCE (Proof Key for Code Exchange) for OAuth 2.0
function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    return NextResponse.json({ error: "TIKTOK_CLIENT_KEY not configured" }, { status: 500 });
  }

  // # Generate CSRF state token
  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("oauth-state-tiktok", `${state}.${signState(state)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  // # Generate PKCE code verifier and store it in a cookie for the token exchange
  const codeVerifier = generateCodeVerifier();
  cookieStore.set("oauth-pkce-tiktok", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,video.publish,video.upload",
    redirect_uri: getRedirectUri(),
    state,
    code_challenge: generateCodeChallenge(codeVerifier),
    code_challenge_method: "S256",
  });

  return NextResponse.json({ url: `https://www.tiktok.com/v2/auth/authorize/?${params}` });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { code, state: clientState } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Authorization code required" }, { status: 400 });
  }

  // # Verify CSRF state
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("oauth-state-tiktok")?.value;
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
  cookieStore.delete("oauth-state-tiktok");

  // # Retrieve the PKCE code verifier stored during the GET step
  const codeVerifier = cookieStore.get("oauth-pkce-tiktok")?.value;
  if (!codeVerifier) {
    return NextResponse.json({ error: "PKCE verifier missing — try connecting again" }, { status: 400 });
  }
  cookieStore.delete("oauth-pkce-tiktok");

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    return NextResponse.json({ error: "TikTok OAuth not configured" }, { status: 500 });
  }

  // # Exchange the authorization code for tokens
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 400 });
  }

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: `TikTok error: ${tokenData.error_description || tokenData.error}` }, { status: 400 });
  }

  // # TikTok tokens typically expire in 24 hours, refresh tokens in 365 days
  const expiresAt = new Date(Date.now() + (tokenData.expires_in || 86400) * 1000);

  await prisma.platformCredential.upsert({
    where: { platform: "tiktok" },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
    create: {
      platform: "tiktok",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt,
    },
  });

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}

export async function DELETE() {
  if (!(await isAdmin())) return unauthorized();
  await prisma.platformCredential.deleteMany({ where: { platform: "tiktok" } });
  return NextResponse.json({ success: true });
}
