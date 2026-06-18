/* ============================================================
   RESEND WEBHOOK — /api/email/webhook
   ============================================================
   POST: Receives delivery/open/click events from Resend.
   Updates the corresponding EmailSend record status.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

// # Resend webhook event types we care about
const EVENT_STATUS_MAP: Record<string, string> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "bounced",
};

export async function POST(req: NextRequest) {
  // # Verify the Svix signature before processing any payload
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // # Read the raw body as text so Svix can verify the exact bytes
  const rawBody = await req.text();

  // # Extract the three Svix signing headers sent by Resend
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  // # All three headers must be present for a valid signed request
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing signature headers" },
      { status: 401 }
    );
  }

  // # Verify signature — wh.verify() returns the parsed payload on success
  // # or throws if the signature is invalid or the timestamp is too old
  let body: any;
  try {
    const wh = new Webhook(secret);
    body = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const eventType = body.type as string;

    // # Only process events we track
    const newStatus = EVENT_STATUS_MAP[eventType];
    if (!newStatus) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // # Find the EmailSend by Resend message ID
    const messageId = body.data?.email_id as string;
    if (!messageId) {
      return NextResponse.json({ error: "Missing email_id" }, { status: 400 });
    }

    const send = await prisma.emailSend.findFirst({
      where: { resendMessageId: messageId },
    });

    if (!send) {
      // # Unknown message — probably not from our nurture system
      return NextResponse.json({ received: true, unknown: true });
    }

    // # Build the update data based on event type
    const updateData: Record<string, unknown> = { status: newStatus };
    if (eventType === "email.opened") updateData.openedAt = new Date();
    if (eventType === "email.clicked") updateData.clickedAt = new Date();

    await prisma.emailSend.update({
      where: { id: send.id },
      data: updateData,
    });

    return NextResponse.json({ received: true, updated: send.id });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
