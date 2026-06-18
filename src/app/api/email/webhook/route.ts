/* ============================================================
   RESEND WEBHOOK — /api/email/webhook
   ============================================================
   POST: Receives delivery/open/click events from Resend.
   Updates the corresponding EmailSend record status.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
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
  try {
    const body = await req.json();
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
