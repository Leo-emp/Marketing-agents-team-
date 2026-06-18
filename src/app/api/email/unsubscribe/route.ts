/* ============================================================
   UNSUBSCRIBE — /api/email/unsubscribe
   ============================================================
   GET: One-click unsubscribe handler. Verifies HMAC-signed
   token and marks user as permanently unsubscribed.
   Returns a simple confirmation page.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(unsubPage("Invalid link", "No unsubscribe token provided."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // # Verify the HMAC-signed token
  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return new NextResponse(unsubPage("Invalid link", "This unsubscribe link is invalid or expired."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // # Upsert the email preference — mark as unsubscribed
  await prisma.emailPreference.upsert({
    where: { userId },
    update: { unsubscribedAt: new Date() },
    create: { userId, email: "unknown", unsubscribedAt: new Date() },
  });

  return new NextResponse(
    unsubPage("Unsubscribed", "You've been removed from all JobPilot marketing emails. We're sorry to see you go."),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

// # Also handle POST for List-Unsubscribe-Post one-click compliance
export async function POST(req: NextRequest) {
  return GET(req);
}

// # Simple branded confirmation page
function unsubPage(title: string, message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#09090b;color:#e4e4e7;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;max-width:400px;padding:40px;">
<h1 style="font-size:24px;margin-bottom:16px;background:linear-gradient(135deg,#818cf8,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${title}</h1>
<p style="color:#a1a1aa;">${message}</p>
</div></body></html>`;
}
