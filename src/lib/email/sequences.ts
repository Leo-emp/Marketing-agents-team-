/* ============================================================
   SEQUENCE ENGINE - Email Nurture with Anti-Annoyance Controls
   ============================================================
   Evaluates active sequences against funnel events, enforces
   frequency caps (3/month, 5-day gap), and queues/sends emails.
   ============================================================ */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "./resend";
import { signUnsubscribeToken } from "./unsubscribe";
import { buildEmailHtml, appendUtmParams } from "./templates";

// # Step shape stored as JSON in EmailSequence.steps
interface SequenceStep {
  delayDays: number;
  subject: string;
  bodyTemplate: string; // HTML body content (goes inside the email template wrapper)
  ctaUrl: string;
  ctaText: string;
}

// # Monthly cap — hard limit, no exceptions
const MAX_EMAILS_PER_MONTH = 3;

// # Minimum days between emails to a single user
const MIN_GAP_DAYS = 5;

// # Check if we're allowed to send to this user right now
export async function canSendToUser(
  userId: string,
  email: string
): Promise<{ allowed: boolean; reason?: string }> {
  // # Check unsubscribe status
  const pref = await prisma.emailPreference.findUnique({ where: { userId } });
  if (pref?.unsubscribedAt) {
    return { allowed: false, reason: "unsubscribed" };
  }

  // # Check monthly cap — count emails sent in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthCount = await prisma.emailSend.count({
    where: {
      recipientUserId: userId,
      status: { in: ["sent", "delivered", "opened", "clicked"] },
      sentAt: { gte: thirtyDaysAgo },
    },
  });
  if (monthCount >= MAX_EMAILS_PER_MONTH) {
    return { allowed: false, reason: `monthly cap (${MAX_EMAILS_PER_MONTH})` };
  }

  // # Check minimum gap — last email must be at least 5 days ago
  const lastSend = await prisma.emailSend.findFirst({
    where: {
      recipientUserId: userId,
      status: { in: ["sent", "delivered", "opened", "clicked"] },
    },
    orderBy: { sentAt: "desc" },
  });
  if (lastSend?.sentAt) {
    const daysSince = (Date.now() - lastSend.sentAt.getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince < MIN_GAP_DAYS) {
      return { allowed: false, reason: `${MIN_GAP_DAYS}-day gap (last sent ${Math.round(daysSince)}d ago)` };
    }
  }

  // # Cold user detection — skip if last 2 delivered emails were not opened
  // # Include all post-send statuses so opened emails aren't excluded from the check
  const recentSends = await prisma.emailSend.findMany({
    where: {
      recipientUserId: userId,
      status: { in: ["sent", "delivered", "opened", "clicked"] },
    },
    orderBy: { sentAt: "desc" },
    take: 2,
  });
  if (recentSends.length >= 2 && recentSends.every((s) => !s.openedAt)) {
    return { allowed: false, reason: "cold user (2 unopened)" };
  }

  return { allowed: true };
}

// # Main entry point — evaluate all active sequences and send due emails
export async function evaluateAndSendEmails(): Promise<{
  sent: number;
  skipped: number;
  errors: number;
}> {
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  // # Get all active sequences, ordered by priority (highest first)
  const sequences = await prisma.emailSequence.findMany({
    where: { status: "active" },
    orderBy: { priority: "desc" },
  });

  if (sequences.length === 0) return { sent, skipped, errors };

  // # Get recent funnel events — limit to last 90 days to prevent OOM on large datasets
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const funnelEvents = await prisma.funnelEvent.findMany({
    where: { eventDate: { gte: ninetyDaysAgo } },
  });

  // # Group events by userId
  const eventsByUser = new Map<string, typeof funnelEvents>();
  for (const evt of funnelEvents) {
    const list = eventsByUser.get(evt.userId) || [];
    list.push(evt);
    eventsByUser.set(evt.userId, list);
  }

  // # Track which users we've already queued in this run (max 1 sequence per user)
  const processedUsers = new Set<string>();

  for (const seq of sequences) {
    // # Fix 1: Wrap JSON.parse in try-catch to prevent malformed steps from crashing
    let steps: SequenceStep[];
    try {
      steps = JSON.parse(seq.steps);
    } catch (err) {
      // # Log and skip this sequence if steps JSON is invalid
      console.error(`Failed to parse steps for sequence ${seq.id}:`, err);
      errors++;
      continue;
    }
    if (steps.length === 0) continue;

    // # Find users who match this sequence's trigger
    for (const [userId, events] of eventsByUser) {
      // # Fix 2: Wrap per-user processing in try-catch so one user's error doesn't crash the batch
      try {
        if (processedUsers.has(userId)) continue;

        // # Check if this user's events match the sequence trigger
        const triggerEvent = matchTrigger(seq.trigger, events);
        if (!triggerEvent) continue;

        const email = triggerEvent.email;
        if (!email) continue;

        // # Determine which step is next for this user in this sequence
        const existingSends = await prisma.emailSend.findMany({
          where: { sequenceId: seq.id, recipientUserId: userId },
          orderBy: { stepIndex: "asc" },
        });

        const nextStepIndex = existingSends.length;
        if (nextStepIndex >= steps.length) {
          // # User has completed all steps in this sequence
          continue;
        }

        const step = steps[nextStepIndex];

        // # Check delay — has enough time passed since the trigger event?
        const triggerDate = triggerEvent.eventDate;
        const dueDate = new Date(triggerDate.getTime() + step.delayDays * 24 * 60 * 60 * 1000);
        if (new Date() < dueDate) continue;

        // # 24-hour signup protection — only welcome email (step 0 of signup trigger) allowed
        const signupEvent = events.find((e) => e.eventType === "signup");
        if (signupEvent) {
          const hoursSinceSignup = (Date.now() - signupEvent.eventDate.getTime()) / (60 * 60 * 1000);
          if (hoursSinceSignup < 24 && !(seq.trigger === "signup" && nextStepIndex === 0)) {
            skipped++;
            continue;
          }
        }

        // # Suppression: skip pro drip if user already upgraded
        if (seq.trigger === "high_usage_free") {
          const proEvent = events.find((e) => e.eventType === "pro_upgrade");
          if (proEvent) {
            skipped++;
            continue;
          }
        }

        // # Anti-annoyance frequency check
        const capCheck = await canSendToUser(userId, email);
        if (!capCheck.allowed) {
          skipped++;
          continue;
        }

        // # Build and send the email
        const campaignSlug = seq.name.toLowerCase().replace(/\s+/g, "-");
        const unsubToken = signUnsubscribeToken(userId);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://jobpilot-marketing.vercel.app";
        const unsubUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubToken)}`;

        // # Tag CTA link with UTM params
        const taggedCtaUrl = step.ctaUrl
          ? appendUtmParams(step.ctaUrl, "email", "nurture", campaignSlug)
          : "";

        const html = buildEmailHtml(
          step.subject,
          step.bodyTemplate,
          taggedCtaUrl,
          step.ctaText,
          unsubUrl
        );

        // # List-Unsubscribe header (Gmail/Yahoo 2024+ requirement)
        const headers: Record<string, string> = {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        };

        const result = await sendEmail(email, step.subject, html, headers);

        if (result) {
          // # Record the send
          await prisma.emailSend.create({
            data: {
              sequenceId: seq.id,
              stepIndex: nextStepIndex,
              recipientEmail: email,
              recipientUserId: userId,
              subject: step.subject,
              status: "sent",
              resendMessageId: result.id,
              utmSource: "email",
              utmMedium: "nurture",
              utmCampaign: campaignSlug,
              sentAt: new Date(),
            },
          });
          sent++;
          processedUsers.add(userId);
        } else {
          // # Record the failure
          await prisma.emailSend.create({
            data: {
              sequenceId: seq.id,
              stepIndex: nextStepIndex,
              recipientEmail: email,
              recipientUserId: userId,
              subject: step.subject,
              status: "failed",
              utmSource: "email",
              utmMedium: "nurture",
              utmCampaign: campaignSlug,
            },
          });
          errors++;
        }
      } catch (err) {
        // # Increment error counter and continue to next user
        console.error(`Error processing user ${userId} in sequence ${seq.id}:`, err);
        errors++;
      }
    }
  }

  return { sent, skipped, errors };
}

// # Match a sequence trigger against a user's funnel events
function matchTrigger(
  trigger: string,
  events: { eventType: string; metadata: string | null; email: string | null; eventDate: Date }[]
): (typeof events)[0] | null {
  switch (trigger) {
    case "signup":
      return events.find((e) => e.eventType === "signup") || null;
    case "high_usage_free":
      // # User has hit 5+ AI uses and is still on free plan
      return events.find((e) => e.eventType === "fifth_ai_use") || null;
    case "plan_upgrade":
      return events.find((e) => e.eventType === "pro_upgrade") || null;
    default:
      return null;
  }
}
