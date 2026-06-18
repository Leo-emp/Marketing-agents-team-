# Email Nurture + UTM Attribution + Funnel Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email nurture sequences, UTM attribution tracking, and a funnel conversion dashboard to Marketing HQ so the user can see which channels drive signups and Pro upgrades.

**Architecture:** Three new Prisma models (EmailSequence, EmailSend, EmailPreference, FunnelEvent) in the existing Marketing HQ SQLite/Turso database. Resend SDK for email delivery. A new internal API endpoint in the main app (jobpilot-website) provides user lifecycle events. Marketing HQ polls it hourly via Vercel Cron. Two new dashboard tabs (Emails, Funnel) added to the existing `page.tsx` tab system.

**Tech Stack:** Next.js 16, Prisma 7 with libsql adapter, Resend (npm), Gemini 2.5 Flash, Tailwind v4, Vercel Cron

## Global Constraints

- **Next.js 16 breaking changes:** Read `node_modules/next/dist/docs/` before writing route handlers. Heed deprecation notices. See `AGENTS.md`.
- **Comment style:** All code must have `# comment` style comments throughout for learning (per user preference in CLAUDE.md memory).
- **Auth pattern:** All admin API routes must check `isAdmin()` from `@/lib/auth-check`. Cron routes use `CRON_SECRET` with timing-safe comparison (see `src/app/api/scheduler/route.ts` for pattern).
- **DB pattern:** Use `prisma` from `@/lib/prisma` (libsql adapter singleton).
- **Gemini pattern:** Use `callGemini()` from `@/lib/gemini` for AI calls.
- **Max 3 emails/month per user, 5-day minimum gap between emails.**
- **Dark theme UI:** `#09090b` background, indigo/purple gradients, Geist font — match existing dashboard.
- **No test framework installed.** Tests in this plan are manual curl/browser verification steps.

---

### Task 1: Prisma Schema + Migration

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `EmailSequence`, `EmailSend`, `EmailPreference`, `FunnelEvent` Prisma models available via `@/lib/prisma`

- [ ] **Step 1: Add EmailSequence model to schema**

Add after the `KpiGoal` model in `prisma/schema.prisma`:

```prisma
// ---- Email Nurture Sequences ----
// Automated email campaigns triggered by user lifecycle events
model EmailSequence {
  id          String   @id @default(cuid())
  name        String                              // "Welcome Series", "Free-to-Pro Drip"
  description String?
  trigger     String                              // signup, high_usage_free, plan_upgrade
  priority    Int      @default(5)                // Higher = wins when frequency cap hit
  status      String   @default("draft")          // draft, active, paused
  steps       String                              // JSON: [{ delayDays, subject, bodyTemplate, ctaUrl, ctaText }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sends       EmailSend[]

  @@index([trigger])
  @@index([status])
}
```

- [ ] **Step 2: Add EmailSend model**

Add after EmailSequence:

```prisma
// ---- Email Send Log ----
// Every email sent, with delivery/open/click tracking via Resend webhooks
model EmailSend {
  id              String    @id @default(cuid())
  sequenceId      String
  stepIndex       Int                             // Which step in the sequence (0-based)
  recipientEmail  String
  recipientUserId String?                         // Main app user ID
  subject         String
  status          String    @default("queued")    // queued, sent, delivered, opened, clicked, bounced, failed
  resendMessageId String?                         // Resend API message ID
  utmSource       String?                         // Auto-tagged: email
  utmMedium       String?                         // Auto-tagged: nurture
  utmCampaign     String?                         // Auto-tagged: sequence slug
  sentAt          DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  createdAt       DateTime  @default(now())

  sequence EmailSequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)

  @@index([recipientEmail])
  @@index([recipientUserId])
  @@index([sequenceId])
  @@index([status])
  @@index([sentAt])
}
```

- [ ] **Step 3: Add EmailPreference model**

Add after EmailSend:

```prisma
// ---- Email Preferences ----
// Tracks unsubscribe status per user (permanent opt-out)
model EmailPreference {
  id              String    @id @default(cuid())
  userId          String    @unique               // Main app user ID
  email           String
  unsubscribedAt  DateTime?                       // Null = subscribed
  reason          String?                         // Optional unsubscribe reason
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([email])
}
```

- [ ] **Step 4: Add FunnelEvent model**

Add after EmailPreference:

```prisma
// ---- Funnel Events ----
// User lifecycle events polled from the main app for attribution tracking
model FunnelEvent {
  id          String   @id @default(cuid())
  userId      String                              // Main app user ID
  email       String?
  eventType   String                              // signup, first_ai_use, fifth_ai_use, pro_upgrade
  utmSource   String?                             // twitter, linkedin, blog, email, reddit, extension, direct
  utmMedium   String?                             // social, organic, nurture, cpc
  utmCampaign String?                             // Specific campaign name
  utmTerm     String?                             // Keyword (for paid)
  utmContent  String?                             // A/B variant
  metadata    String?                             // JSON: { feature, planAmount, etc. }
  eventDate   DateTime @default(now())
  createdAt   DateTime @default(now())

  @@unique([userId, eventType])
  @@index([eventType])
  @@index([utmSource])
  @@index([eventDate])
}
```

- [ ] **Step 5: Run migration**

```bash
cd C:\Users\User\jobpilot-marketing
npx prisma generate
npx prisma db push
```

Expected: Prisma generates client with new models. No errors.

- [ ] **Step 6: Verify models exist**

Open a quick script or use `npx prisma studio` to confirm all 4 new tables appear in the database.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma src/generated/prisma/
git commit -m "feat: add Prisma models for email nurture, preferences, and funnel events"
```

---

### Task 2: Resend Email Client + Unsubscribe Tokens

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/unsubscribe.ts`

**Interfaces:**
- Produces:
  - `sendEmail(to: string, subject: string, html: string, headers?: Record<string, string>): Promise<{ id: string } | null>`
  - `verifyWebhookSignature(body: string, signature: string): boolean`
  - `signUnsubscribeToken(userId: string): string`
  - `verifyUnsubscribeToken(token: string): string | null` (returns userId or null)

- [ ] **Step 1: Create `src/lib/email/resend.ts`**

```typescript
/* ============================================================
   RESEND CLIENT - Email Sending via Resend API
   ============================================================
   Wraps the Resend SDK with lazy initialization and error
   handling. All marketing emails go through this module.
   ============================================================ */

import { Resend } from "resend";

// # Lazy-init so missing env var doesn't crash on import
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

// # Send a single email via Resend
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  headers?: Record<string, string>
): Promise<{ id: string } | null> {
  try {
    const result = await getResend().emails.send({
      from: "JobPilot AI <noreply@jobpilotai.co>",
      to,
      subject,
      html,
      headers,
    });
    // # Resend returns { data: { id }, error } — unwrap
    if (result.error) {
      console.error("Resend send error:", result.error);
      return null;
    }
    return result.data;
  } catch (err) {
    console.error("Resend send failed:", err);
    return null;
  }
}

// # Verify Resend webhook signature using the signing secret
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET not configured — rejecting webhook");
    return false;
  }
  // # Resend uses svix for webhook signing — for now, basic HMAC check
  // # In production, use the svix package for full verification
  const { createHmac } = require("crypto");
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return signature === expected;
}
```

- [ ] **Step 2: Create `src/lib/email/unsubscribe.ts`**

```typescript
/* ============================================================
   UNSUBSCRIBE TOKENS - HMAC-signed one-click unsubscribe
   ============================================================
   Signs and verifies tokens for email unsubscribe links.
   Prevents abuse — only valid tokens can trigger unsubscribe.
   ============================================================ */

import { createHmac, timingSafeEqual } from "crypto";

// # Generate a signed unsubscribe token for a user ID
export function signUnsubscribeToken(userId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_SECRET not configured");
  // # Token format: userId.hmacSignature
  const sig = createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

// # Verify an unsubscribe token — returns userId if valid, null if tampered
export function verifyUnsubscribeToken(token: string): string | null {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const userId = token.slice(0, dotIndex);
  const providedSig = token.slice(dotIndex + 1);

  // # Recompute the expected signature
  const expectedSig = createHmac("sha256", secret).update(userId).digest("hex");

  // # Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return userId;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Install resend package**

```bash
cd C:\Users\User\jobpilot-marketing
npm install resend
```

- [ ] **Step 4: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -20
```

Expected: No type errors related to the new files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/resend.ts src/lib/email/unsubscribe.ts package.json package-lock.json
git commit -m "feat: add Resend email client and HMAC unsubscribe token utilities"
```

---

### Task 3: Email Templates + Anti-Annoyance Sequence Engine

**Files:**
- Create: `src/lib/email/templates.ts`
- Create: `src/lib/email/sequences.ts`

**Interfaces:**
- Consumes: `sendEmail` from `src/lib/email/resend.ts`, `signUnsubscribeToken` from `src/lib/email/unsubscribe.ts`, `prisma` from `@/lib/prisma`
- Produces:
  - `buildEmailHtml(subject: string, body: string, ctaUrl: string, ctaText: string, unsubscribeUrl: string): string`
  - `evaluateAndSendEmails(): Promise<{ sent: number; skipped: number; errors: number }>`
  - `canSendToUser(userId: string, email: string): Promise<{ allowed: boolean; reason?: string }>`

- [ ] **Step 1: Create `src/lib/email/templates.ts`**

```typescript
/* ============================================================
   EMAIL TEMPLATES - Dark-themed branded HTML emails
   ============================================================
   Generates responsive HTML emails matching the JobPilot brand.
   Dark background, indigo/purple accents, Geist font fallback.
   ============================================================ */

// # Build a branded HTML email with dark theme
export function buildEmailHtml(
  subject: string,
  body: string,
  ctaUrl: string,
  ctaText: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;color:#e4e4e7;font-family:'Geist','Segoe UI',system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <!-- # Logo / brand header -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;background:linear-gradient(135deg,#818cf8,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        JobPilot AI
      </span>
    </div>

    <!-- # Email body content -->
    <div style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;padding:32px;margin-bottom:24px;">
      ${body}
    </div>

    <!-- # CTA button -->
    ${ctaUrl && ctaText ? `
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
        ${escapeHtml(ctaText)}
      </a>
    </div>
    ` : ""}

    <!-- # Footer with unsubscribe -->
    <div style="text-align:center;font-size:12px;color:#71717a;border-top:1px solid #27272a;padding-top:24px;">
      <p>JobPilot AI — Your Career Co-Pilot</p>
      <p><a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a;text-decoration:underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// # Escape HTML entities to prevent XSS in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// # Auto-append UTM params to a URL for tracking
export function appendUtmParams(
  url: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
}
```

- [ ] **Step 2: Create `src/lib/email/sequences.ts`**

```typescript
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

  // # Cold user detection — skip if last 2 emails were not opened
  const recentSends = await prisma.emailSend.findMany({
    where: {
      recipientUserId: userId,
      status: { in: ["sent", "delivered"] },
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

  // # Get all users who have triggered events (from FunnelEvent table)
  const funnelEvents = await prisma.funnelEvent.findMany();

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
    const steps: SequenceStep[] = JSON.parse(seq.steps);
    if (steps.length === 0) continue;

    // # Find users who match this sequence's trigger
    for (const [userId, events] of eventsByUser) {
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
    }
  }

  return { sent, skipped, errors };
}

// # Match a sequence trigger against a user's funnel events
function matchTrigger(
  trigger: string,
  events: { eventType: string; metadata: string | null }[]
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
```

- [ ] **Step 3: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -20
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/templates.ts src/lib/email/sequences.ts
git commit -m "feat: add email templates and anti-annoyance sequence engine (3/month cap, 5-day gap)"
```

---

### Task 4: Email API Routes (Cron Sender + Webhook + Unsubscribe)

**Files:**
- Create: `src/app/api/email/send/route.ts`
- Create: `src/app/api/email/webhook/route.ts`
- Create: `src/app/api/email/unsubscribe/route.ts`

**Interfaces:**
- Consumes: `evaluateAndSendEmails` from `src/lib/email/sequences.ts`, `verifyUnsubscribeToken` from `src/lib/email/unsubscribe.ts`, `prisma` from `@/lib/prisma`
- Produces:
  - `GET /api/email/send` — cron-triggered, sends due emails
  - `POST /api/email/webhook` — Resend delivery/open/click webhook
  - `GET /api/email/unsubscribe?token=...` — one-click unsubscribe

- [ ] **Step 1: Create `src/app/api/email/send/route.ts`**

```typescript
/* ============================================================
   EMAIL SEND CRON — /api/email/send
   ============================================================
   GET: Called by Vercel Cron every 30 minutes. Evaluates all
   active email sequences and sends due emails with anti-annoyance
   controls. Protected by CRON_SECRET.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { evaluateAndSendEmails } from "@/lib/email/sequences";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  // # Verify cron authorization (same pattern as /api/scheduler)
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
    // # Run the sequence engine
    const result = await evaluateAndSendEmails();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Email send cron failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `src/app/api/email/webhook/route.ts`**

```typescript
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
```

- [ ] **Step 3: Create `src/app/api/email/unsubscribe/route.ts`**

```typescript
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
```

- [ ] **Step 4: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -20
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/email/
git commit -m "feat: add email API routes — cron sender, Resend webhook, one-click unsubscribe"
```

---

### Task 5: UTM Utilities + Funnel Sync from Main App

**Files:**
- Create: `src/lib/funnel/utm.ts`
- Create: `src/lib/funnel/sync.ts`
- Create: `src/lib/funnel/analytics.ts`
- Create: `src/app/api/funnel/sync/route.ts`
- Create: `src/app/api/funnel/route.ts`
- Create: `src/app/api/funnel/attribution/route.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`, `callGemini` from `@/lib/gemini`
- Produces:
  - `tagContentLinks(body: string, platform: string, contentId: string): string`
  - `syncFunnelEvents(): Promise<{ synced: number; errors: number }>`
  - `getFunnelData(filters: { utmSource?: string; startDate?: string; endDate?: string }): Promise<FunnelData>`
  - `getAttribution(filters: { startDate?: string; endDate?: string }): Promise<AttributionRow[]>`
  - `analyzeFunnel(): Promise<{ insights: string[]; recommendations: string[] }>`

- [ ] **Step 1: Create `src/lib/funnel/utm.ts`**

```typescript
/* ============================================================
   UTM UTILITIES - Auto-tag outbound links with tracking params
   ============================================================
   Appends UTM parameters to jobpilotai.co links in social
   posts so we can attribute signups to specific content.
   ============================================================ */

// # Append UTM params to a URL
export function appendUtm(
  url: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=${enc(source)}&utm_medium=${enc(medium)}&utm_campaign=${enc(campaign)}`;
}

// # Find all jobpilotai.co links in a text body and append UTM params
export function tagContentLinks(
  body: string,
  platform: string,
  contentId: string
): string {
  // # Match URLs that point to jobpilotai.co
  const urlPattern = /(https?:\/\/(?:www\.)?jobpilotai\.co[^\s"'<>]*)/gi;

  return body.replace(urlPattern, (match) => {
    // # Don't double-tag URLs that already have utm params
    if (match.includes("utm_source=")) return match;
    return appendUtm(match, platform, "social", contentId);
  });
}

function enc(s: string): string {
  return encodeURIComponent(s);
}
```

- [ ] **Step 2: Create `src/lib/funnel/sync.ts`**

```typescript
/* ============================================================
   FUNNEL SYNC - Poll main app for user lifecycle events
   ============================================================
   Calls the main app's internal API to get new signups,
   first AI uses, and Pro upgrades. Upserts FunnelEvent records
   with deduplication by userId + eventType.
   ============================================================ */

import { prisma } from "@/lib/prisma";

// # Shape of events returned by the main app's internal API
interface RemoteFunnelEvent {
  userId: string;
  email: string;
  eventType: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  eventDate: string;
  metadata: Record<string, unknown> | null;
}

// # Sync funnel events from the main app
export async function syncFunnelEvents(): Promise<{ synced: number; errors: number }> {
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;

  if (!apiUrl || !apiSecret) {
    console.error("JOBPILOT_API_URL or JOBPILOT_API_SECRET not configured");
    return { synced: 0, errors: 1 };
  }

  // # Find the most recent event date to use as "since" parameter
  const lastEvent = await prisma.funnelEvent.findFirst({
    orderBy: { eventDate: "desc" },
  });
  // # Default to 30 days ago if no events exist yet
  const since = lastEvent?.eventDate?.toISOString()
    || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let synced = 0;
  let errors = 0;

  try {
    const res = await fetch(
      `${apiUrl}/api/internal/funnel-events?since=${encodeURIComponent(since)}`,
      {
        headers: { Authorization: `Bearer ${apiSecret}` },
        next: { revalidate: 0 }, // # No caching for sync calls
      }
    );

    if (!res.ok) {
      console.error(`Funnel sync failed: ${res.status} ${res.statusText}`);
      return { synced: 0, errors: 1 };
    }

    const events: RemoteFunnelEvent[] = await res.json();

    // # Upsert each event — deduplicate by userId + eventType
    for (const evt of events) {
      try {
        await prisma.funnelEvent.upsert({
          where: {
            userId_eventType: { userId: evt.userId, eventType: evt.eventType },
          },
          update: {
            email: evt.email,
            utmSource: evt.utmSource,
            utmMedium: evt.utmMedium,
            utmCampaign: evt.utmCampaign,
            utmTerm: evt.utmTerm,
            utmContent: evt.utmContent,
            metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
            eventDate: new Date(evt.eventDate),
          },
          create: {
            userId: evt.userId,
            email: evt.email,
            eventType: evt.eventType,
            utmSource: evt.utmSource,
            utmMedium: evt.utmMedium,
            utmCampaign: evt.utmCampaign,
            utmTerm: evt.utmTerm,
            utmContent: evt.utmContent,
            metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
            eventDate: new Date(evt.eventDate),
          },
        });
        synced++;
      } catch (err) {
        console.error(`Failed to upsert event for ${evt.userId}:`, err);
        errors++;
      }
    }
  } catch (err) {
    console.error("Funnel sync fetch failed:", err);
    return { synced: 0, errors: 1 };
  }

  return { synced, errors };
}
```

- [ ] **Step 3: Create `src/lib/funnel/analytics.ts`**

```typescript
/* ============================================================
   FUNNEL ANALYTICS - Conversion rates and attribution breakdown
   ============================================================
   Calculates funnel drop-off rates and per-channel attribution
   from FunnelEvent data. Powers the Funnel dashboard tab.
   ============================================================ */

import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";

// # Funnel stages in order
const STAGES = ["signup", "first_ai_use", "fifth_ai_use", "pro_upgrade"] as const;

export interface FunnelStage {
  name: string;
  count: number;
  percent: number; // Relative to signups (first stage = 100%)
}

export interface FunnelData {
  stages: FunnelStage[];
  totalSignups: number;
}

export interface AttributionRow {
  channel: string;
  signups: number;
  firstUse: number;
  proUpgrades: number;
  convRate: number;     // Pro upgrades / signups as percentage
  estRevenue: number;   // Pro upgrades × £9.99
}

// # Build funnel data with optional filters
export async function getFunnelData(filters: {
  utmSource?: string;
  startDate?: string;
  endDate?: string;
}): Promise<FunnelData> {
  // # Build where clause from filters
  const where: Record<string, unknown> = {};
  if (filters.utmSource) where.utmSource = filters.utmSource;
  if (filters.startDate || filters.endDate) {
    where.eventDate = {};
    if (filters.startDate) (where.eventDate as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters.endDate) (where.eventDate as Record<string, unknown>).lte = new Date(filters.endDate);
  }

  // # Count events for each stage
  const stages: FunnelStage[] = [];
  let signupCount = 0;

  for (const stage of STAGES) {
    const count = await prisma.funnelEvent.count({
      where: { ...where, eventType: stage },
    });
    if (stage === "signup") signupCount = count;
    stages.push({
      name: stage,
      count,
      percent: signupCount > 0 ? Math.round((count / signupCount) * 1000) / 10 : 0,
    });
  }

  return { stages, totalSignups: signupCount };
}

// # Attribution breakdown by UTM source
export async function getAttribution(filters: {
  startDate?: string;
  endDate?: string;
}): Promise<AttributionRow[]> {
  const where: Record<string, unknown> = {};
  if (filters.startDate || filters.endDate) {
    where.eventDate = {};
    if (filters.startDate) (where.eventDate as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters.endDate) (where.eventDate as Record<string, unknown>).lte = new Date(filters.endDate);
  }

  // # Get all events grouped by source
  const allEvents = await prisma.funnelEvent.findMany({ where });

  // # Group by source — normalize null/empty to "direct"
  const bySource = new Map<string, typeof allEvents>();
  for (const evt of allEvents) {
    const source = evt.utmSource || "direct";
    const list = bySource.get(source) || [];
    list.push(evt);
    bySource.set(source, list);
  }

  // # Build attribution rows
  const rows: AttributionRow[] = [];
  const pricePerPro = 9.99; // # £9.99/month Pro plan

  for (const [channel, events] of bySource) {
    const signups = events.filter((e) => e.eventType === "signup").length;
    const firstUse = events.filter((e) => e.eventType === "first_ai_use").length;
    const proUpgrades = events.filter((e) => e.eventType === "pro_upgrade").length;
    const convRate = signups > 0 ? Math.round((proUpgrades / signups) * 1000) / 10 : 0;

    rows.push({
      channel,
      signups,
      firstUse,
      proUpgrades,
      convRate,
      estRevenue: Math.round(proUpgrades * pricePerPro * 100) / 100,
    });
  }

  // # Sort by signups descending
  rows.sort((a, b) => b.signups - a.signups);
  return rows;
}

// # AI-powered funnel insights using the existing KPI Analyst agent
export async function analyzeFunnel(): Promise<{
  insights: string[];
  recommendations: string[];
}> {
  const funnel = await getFunnelData({});
  const attribution = await getAttribution({});

  if (funnel.totalSignups === 0) {
    return {
      insights: ["No funnel data yet. Sync with the main app to start tracking."],
      recommendations: ["Configure JOBPILOT_API_URL and JOBPILOT_API_SECRET, then run funnel sync."],
    };
  }

  const prompt = `You are a growth marketing analyst. Analyze this conversion funnel and attribution data for JobPilot AI (a career tech SaaS at £9.99/month Pro plan).

FUNNEL:
${JSON.stringify(funnel.stages, null, 2)}

ATTRIBUTION BY CHANNEL:
${JSON.stringify(attribution, null, 2)}

Provide:
1. 3-5 specific insights (what's working, what's dropping off, which channels convert best)
2. 3-5 actionable recommendations to improve conversion rates

Be SPECIFIC. Reference actual numbers and percentages. No generic advice.

Return JSON: {"insights":["..."],"recommendations":["..."]}
Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]);
  } catch {
    return {
      insights: ["Funnel analysis failed — check Gemini API key."],
      recommendations: [],
    };
  }
}
```

- [ ] **Step 4: Create `src/app/api/funnel/sync/route.ts`**

```typescript
/* ============================================================
   FUNNEL SYNC CRON — /api/funnel/sync
   ============================================================
   GET: Called by Vercel Cron every hour. Polls the main app
   for new user lifecycle events. Protected by CRON_SECRET.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { syncFunnelEvents } from "@/lib/funnel/sync";

export async function GET(req: NextRequest) {
  // # Verify cron authorization
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
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
    const result = await syncFunnelEvents();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Funnel sync cron failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
```

- [ ] **Step 5: Create `src/app/api/funnel/route.ts`**

```typescript
/* ============================================================
   FUNNEL API — /api/funnel
   ============================================================
   GET: Returns funnel conversion data with optional filters.
   POST: Triggers AI-powered funnel analysis.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { getFunnelData, analyzeFunnel } from "@/lib/funnel/analytics";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const utmSource = searchParams.get("source") || undefined;
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const data = await getFunnelData({ utmSource, startDate, endDate });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Funnel data fetch failed:", err);
    return NextResponse.json({ error: "Failed to load funnel data" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await isAdmin())) return unauthorized();

  try {
    const analysis = await analyzeFunnel();
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Funnel analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
```

- [ ] **Step 6: Create `src/app/api/funnel/attribution/route.ts`**

```typescript
/* ============================================================
   ATTRIBUTION API — /api/funnel/attribution
   ============================================================
   GET: Returns per-channel attribution breakdown (signups,
   first use, Pro upgrades, conversion rate, revenue).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { getAttribution } from "@/lib/funnel/analytics";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const rows = await getAttribution({ startDate, endDate });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Attribution fetch failed:", err);
    return NextResponse.json({ error: "Failed to load attribution" }, { status: 500 });
  }
}
```

- [ ] **Step 7: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/funnel/ src/app/api/funnel/
git commit -m "feat: add UTM tagging, funnel sync from main app, and attribution analytics"
```

---

### Task 6: Main App — Internal Funnel Events API + UTM Cookie Capture

**Files:**
- Create: `C:\Users\User\jobpilot-website\src\app\api\internal\funnel-events\route.ts`
- Modify: `C:\Users\User\jobpilot-website\src\app\api\auth\signup\route.ts`

**Interfaces:**
- Consumes: `prisma` from the main app's `@/lib/prisma`
- Produces: `GET /api/internal/funnel-events?since=<ISO-date>` — returns user lifecycle events with UTM data

- [ ] **Step 1: Create the internal funnel events endpoint**

Create `C:\Users\User\jobpilot-website\src\app\api\internal\funnel-events\route.ts`:

```typescript
/* ============================================================
   INTERNAL FUNNEL EVENTS — /api/internal/funnel-events
   ============================================================
   GET: Returns user lifecycle events for Marketing HQ to poll.
   Protected by INTERNAL_API_SECRET (shared with Marketing HQ).
   NOT a public API — only called by the marketing dashboard.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { dbRetry } from "@/lib/db-retry";

export async function GET(req: NextRequest) {
  // # Verify internal API secret
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "INTERNAL_API_SECRET not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${secret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // # Parse "since" parameter — defaults to 30 days ago
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // # Get new signups since the given date
    const newUsers = await dbRetry(() =>
      prisma.user.findMany({
        where: {
          createdAt: { gte: since },
          deletedAt: null, // # Exclude soft-deleted users
        },
        select: {
          id: true,
          email: true,
          plan: true,
          referralSource: true,
          createdAt: true,
          _count: { select: { aiResults: true } },
        },
      })
    );

    // # Build event list from user data
    const events: {
      userId: string;
      email: string;
      eventType: string;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      utmTerm: string | null;
      utmContent: string | null;
      eventDate: string;
      metadata: Record<string, unknown> | null;
    }[] = [];

    for (const user of newUsers) {
      // # Parse UTM data from referralSource (stored as JSON on signup)
      let utm: Record<string, string | null> = { source: null, medium: null, campaign: null, term: null, content: null };
      if (user.referralSource) {
        try {
          const parsed = JSON.parse(user.referralSource);
          utm = {
            source: parsed.utm_source || parsed.source || user.referralSource,
            medium: parsed.utm_medium || parsed.medium || null,
            campaign: parsed.utm_campaign || parsed.campaign || null,
            term: parsed.utm_term || parsed.term || null,
            content: parsed.utm_content || parsed.content || null,
          };
        } catch {
          // # Not JSON — treat as plain string source
          utm.source = user.referralSource;
        }
      }

      // # Signup event
      events.push({
        userId: user.id,
        email: user.email,
        eventType: "signup",
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        utmTerm: utm.term,
        utmContent: utm.content,
        eventDate: user.createdAt.toISOString(),
        metadata: null,
      });

      // # First AI use event
      if (user._count.aiResults >= 1) {
        events.push({
          userId: user.id,
          email: user.email,
          eventType: "first_ai_use",
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          utmTerm: utm.term,
          utmContent: utm.content,
          eventDate: user.createdAt.toISOString(), // # Approximation — actual date would need AiResult query
          metadata: { aiResultCount: user._count.aiResults },
        });
      }

      // # Fifth AI use event
      if (user._count.aiResults >= 5) {
        events.push({
          userId: user.id,
          email: user.email,
          eventType: "fifth_ai_use",
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          utmTerm: utm.term,
          utmContent: utm.content,
          eventDate: user.createdAt.toISOString(),
          metadata: { aiResultCount: user._count.aiResults },
        });
      }

      // # Pro upgrade event
      if (user.plan === "pro") {
        events.push({
          userId: user.id,
          email: user.email,
          eventType: "pro_upgrade",
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          utmTerm: utm.term,
          utmContent: utm.content,
          eventDate: user.createdAt.toISOString(),
          metadata: { plan: user.plan },
        });
      }
    }

    return NextResponse.json(events);
  } catch (err) {
    console.error("Internal funnel events failed:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add UTM cookie capture to signup route**

In `C:\Users\User\jobpilot-website\src\app\api\auth\signup\route.ts`, modify the user creation to read UTM data from the request body (the frontend will pass it from the cookie):

Find this block (around line 90-98):
```typescript
  const user = await dbRetry(() =>
    prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  );
```

Replace with:
```typescript
  // # Capture UTM attribution data from signup form (set by frontend from URL params / cookie)
  const utmData = body.utm;
  let referralSource: string | null = null;
  if (utmData && typeof utmData === "object") {
    referralSource = JSON.stringify({
      utm_source: utmData.source || null,
      utm_medium: utmData.medium || null,
      utm_campaign: utmData.campaign || null,
      utm_term: utmData.term || null,
      utm_content: utmData.content || null,
    });
  }

  const user = await dbRetry(() =>
    prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(referralSource ? { referralSource } : {}),
      },
    })
  );
```

- [ ] **Step 3: Verify main app build**

```bash
cd C:\Users\User\jobpilot-website
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit in main app**

```bash
cd C:\Users\User\jobpilot-website
git add src/app/api/internal/funnel-events/route.ts src/app/api/auth/signup/route.ts
git commit -m "feat: add internal funnel events API for Marketing HQ + UTM capture on signup"
```

---

### Task 7: Vercel Cron Configuration + Seed Default Sequences

**Files:**
- Modify: `C:\Users\User\jobpilot-marketing\vercel.json`
- Create: `C:\Users\User\jobpilot-marketing\scripts\seed-sequences.mjs`

**Interfaces:**
- Consumes: Prisma models from Task 1
- Produces: Two default email sequences in the database, updated cron config

- [ ] **Step 1: Update `vercel.json` with new crons**

Replace the entire `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduler",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/email/send",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/funnel/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [ ] **Step 2: Create seed script for default sequences**

Create `scripts/seed-sequences.mjs`:

```javascript
/* ============================================================
   SEED SEQUENCES - Create default email nurture sequences
   ============================================================
   Run once: node scripts/seed-sequences.mjs
   Creates the Welcome Series and Free-to-Pro Drip sequences
   in draft status (must be manually activated in the dashboard).
   ============================================================ */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const BASE_URL = "https://jobpilotai.co";

async function seed() {
  // # Welcome Series
  await prisma.emailSequence.upsert({
    where: { id: "welcome-series" },
    update: {},
    create: {
      id: "welcome-series",
      name: "Welcome Series",
      description: "Onboarding sequence for new signups — introduces key features over 12 days",
      trigger: "signup",
      priority: 10,
      status: "draft", // # Activate manually after reviewing templates
      steps: JSON.stringify([
        {
          delayDays: 0,
          subject: "Welcome to JobPilot — here's your quick start",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">Welcome aboard!</h2>
<p style="color:#a1a1aa;line-height:1.6;">You just joined thousands of job seekers who use AI to land interviews faster.</p>
<p style="color:#a1a1aa;line-height:1.6;">Here's what you can do right now:</p>
<ul style="color:#a1a1aa;line-height:1.8;">
<li><strong style="color:#e4e4e7;">Upload your resume</strong> — get an instant ATS score out of 100</li>
<li><strong style="color:#e4e4e7;">Generate a cover letter</strong> — matched to any job in seconds</li>
<li><strong style="color:#e4e4e7;">Practice interviews</strong> — with our AI interviewer Sarah</li>
</ul>
<p style="color:#a1a1aa;line-height:1.6;">Start with your resume — it takes 30 seconds.</p>`,
          ctaUrl: `${BASE_URL}/dashboard`,
          ctaText: "Analyze My Resume",
        },
        {
          delayDays: 5,
          subject: "Your resume score might surprise you",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">Have you checked your resume score yet?</h2>
<p style="color:#a1a1aa;line-height:1.6;">Most resumes score below 60/100 on ATS compatibility. That means automated systems might be filtering you out before a human ever sees your application.</p>
<p style="color:#a1a1aa;line-height:1.6;">Our Resume Analyzer tells you exactly what to fix — missing keywords, weak bullet points, formatting issues — so you can get past the bots.</p>
<p style="color:#a1a1aa;line-height:1.6;">It takes 30 seconds. Upload your resume and see your score.</p>`,
          ctaUrl: `${BASE_URL}/dashboard`,
          ctaText: "Check My Score",
        },
        {
          delayDays: 12,
          subject: "3 things most job seekers miss",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">Most job seekers make these 3 mistakes</h2>
<p style="color:#a1a1aa;line-height:1.6;"><strong style="color:#e4e4e7;">1. Generic cover letters.</strong> Hiring managers can tell. Our AI writes one matched to the specific job and company in seconds.</p>
<p style="color:#a1a1aa;line-height:1.6;"><strong style="color:#e4e4e7;">2. No interview prep.</strong> Our AI mock interviewer adapts to the exact role you're applying for — behavioral, technical, case, or HR screening.</p>
<p style="color:#a1a1aa;line-height:1.6;"><strong style="color:#e4e4e7;">3. Weak LinkedIn presence.</strong> Our LinkedIn audit scores your profile and rewrites your headline, about, and experience sections.</p>
<p style="color:#a1a1aa;line-height:1.6;">All of this is free to try.</p>`,
          ctaUrl: `${BASE_URL}/dashboard`,
          ctaText: "Try Interview Prep",
        },
      ]),
    },
  });

  // # Free-to-Pro Drip
  await prisma.emailSequence.upsert({
    where: { id: "free-to-pro" },
    update: {},
    create: {
      id: "free-to-pro",
      name: "Free to Pro Drip",
      description: "Conversion sequence for active free users with 5+ AI uses",
      trigger: "high_usage_free",
      priority: 5,
      status: "draft",
      steps: JSON.stringify([
        {
          delayDays: 0,
          subject: "You're getting serious about your job search",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">You've been putting in the work</h2>
<p style="color:#a1a1aa;line-height:1.6;">You've used JobPilot's AI tools multiple times now — that tells us you're serious about landing your next role.</p>
<p style="color:#a1a1aa;line-height:1.6;">With Pro, you get:</p>
<ul style="color:#a1a1aa;line-height:1.8;">
<li><strong style="color:#e4e4e7;">Unlimited AI generations</strong> — no monthly caps</li>
<li><strong style="color:#e4e4e7;">Resume Rebuilder</strong> — complete resume rewrite for any target job</li>
<li><strong style="color:#e4e4e7;">Career Pivot Mode</strong> — reframe your experience for a new industry</li>
<li><strong style="color:#e4e4e7;">Advanced mock interviews</strong> — all formats including case interviews</li>
</ul>`,
          ctaUrl: `${BASE_URL}/pricing`,
          ctaText: "See Pro Plans",
        },
        {
          delayDays: 7,
          subject: "How resume optimization users land interviews faster",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">The data is clear</h2>
<p style="color:#a1a1aa;line-height:1.6;">Job seekers who optimize their resume for each application are significantly more likely to get past ATS filters and land interviews.</p>
<p style="color:#a1a1aa;line-height:1.6;">With Pro, you can optimize your resume for every job you apply to — not just a few per month. That means more tailored applications, more interviews, and a shorter job search.</p>
<p style="color:#a1a1aa;line-height:1.6;">The average job search takes 5 months. Pro users tell us they cut that in half.</p>`,
          ctaUrl: `${BASE_URL}/pricing`,
          ctaText: "Upgrade to Pro",
        },
        {
          delayDays: 14,
          subject: "Your Pro upgrade is waiting",
          bodyTemplate: `<h2 style="color:#e4e4e7;margin:0 0 16px;">Ready to go all-in?</h2>
<p style="color:#a1a1aa;line-height:1.6;">You've seen what JobPilot can do on the free plan. Pro removes all limits and unlocks the full toolkit.</p>
<p style="color:#a1a1aa;line-height:1.6;">At £9.99/month, it's less than a single coffee a week — and it could be the difference between months of searching and landing your next role this month.</p>
<p style="color:#a1a1aa;line-height:1.6;">No commitment. Cancel anytime.</p>`,
          ctaUrl: `${BASE_URL}/pricing`,
          ctaText: "Start Pro Now",
        },
      ]),
    },
  });

  console.log("Seeded 2 email sequences (Welcome Series + Free-to-Pro Drip) in draft status.");
  console.log("Activate them in the Marketing HQ dashboard Emails tab when ready.");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Run seed script**

```bash
cd C:\Users\User\jobpilot-marketing
node scripts/seed-sequences.mjs
```

Expected: "Seeded 2 email sequences..."

- [ ] **Step 4: Commit**

```bash
git add vercel.json scripts/seed-sequences.mjs
git commit -m "feat: add email/funnel cron jobs and seed default nurture sequences"
```

---

### Task 8: Dashboard — Emails Tab + Funnel Tab UI

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: All API routes from Tasks 4-6

This is the largest task — adds two new tabs to the 1899-line `page.tsx`. Since the file is already large, we'll add the minimum viable UI for each tab.

- [ ] **Step 1: Add new tab types and state variables**

In `page.tsx`, update the tab type union (line ~148):

Find:
```typescript
const [tab, setTab] = useState<"queue" | "agents" | "plans" | "kpi" | "settings">("queue");
```

Replace with:
```typescript
const [tab, setTab] = useState<"queue" | "agents" | "plans" | "kpi" | "emails" | "funnel" | "settings">("queue");
```

After the existing state variables (around line 158), add new state for emails and funnel:

```typescript
  /* ---- Email Nurture state ---- */
  const [sequences, setSequences] = useState<{ id: string; name: string; description: string | null; trigger: string; priority: number; status: string; steps: string; createdAt: string }[]>([]);
  const [emailSends, setEmailSends] = useState<{ id: string; sequenceId: string; recipientEmail: string; subject: string; status: string; sentAt: string | null; openedAt: string | null; clickedAt: string | null }[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);

  /* ---- Funnel state ---- */
  const [funnelData, setFunnelData] = useState<{ stages: { name: string; count: number; percent: number }[]; totalSignups: number } | null>(null);
  const [attribution, setAttribution] = useState<{ channel: string; signups: number; firstUse: number; proUpgrades: number; convRate: number; estRevenue: number }[]>([]);
  const [funnelInsights, setFunnelInsights] = useState<{ insights: string[]; recommendations: string[] } | null>(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelAnalyzing, setFunnelAnalyzing] = useState(false);
```

- [ ] **Step 2: Add data fetch functions**

After the existing fetch functions (like `fetchKpi`), add:

```typescript
  /* # Fetch email sequences and recent sends */
  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    try {
      const [seqRes, sendsRes] = await Promise.all([
        fetch("/api/email/sequences"),
        fetch("/api/email/sends?limit=50"),
      ]);
      if (seqRes.ok) setSequences(await seqRes.json());
      if (sendsRes.ok) setEmailSends(await sendsRes.json());
    } catch (e) { console.error("Email fetch failed:", e); }
    setEmailsLoading(false);
  }, []);

  /* # Fetch funnel data and attribution */
  const fetchFunnel = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const [funnelRes, attrRes] = await Promise.all([
        fetch("/api/funnel"),
        fetch("/api/funnel/attribution"),
      ]);
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      if (attrRes.ok) setAttribution(await attrRes.json());
    } catch (e) { console.error("Funnel fetch failed:", e); }
    setFunnelLoading(false);
  }, []);

  /* # Run AI funnel analysis */
  const analyzeFunnelData = useCallback(async () => {
    setFunnelAnalyzing(true);
    try {
      const res = await fetch("/api/funnel", { method: "POST" });
      if (res.ok) setFunnelInsights(await res.json());
    } catch (e) { console.error("Funnel analysis failed:", e); }
    setFunnelAnalyzing(false);
  }, []);
```

Add auto-fetch in the existing `useEffect` block that handles tab changes (near line ~843):

```typescript
  useEffect(() => {
    if (authed && tab === "emails") fetchEmails();
    if (authed && tab === "funnel") fetchFunnel();
  }, [authed, tab, fetchEmails, fetchFunnel]);
```

- [ ] **Step 3: Add Emails and Funnel to the tab bar**

Find the tab bar render (line ~939):
```typescript
{(["queue", "plans", "agents", "kpi", "settings"] as const).map((t) => (
```

Replace with:
```typescript
{(["queue", "plans", "agents", "kpi", "emails", "funnel", "settings"] as const).map((t) => (
```

Update the label mapping (line ~943):
```typescript
{t === "queue" ? `Content${total ? ` (${total})` : ""}` : t === "plans" ? "Plans" : t === "kpi" ? "KPIs" : t === "emails" ? "Emails" : t === "funnel" ? "Funnel" : t === "settings" ? "Settings" : "Agents"}
```

- [ ] **Step 4: Add Emails tab UI**

Before the `{tab === "settings" && (` block, add:

```tsx
        {/* ---- EMAILS TAB ---- */}
        {tab === "emails" && (
          <div className="space-y-6">
            {/* # Sequences list */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Email Sequences</h2>
              {emailsLoading ? (
                <p className="text-text-secondary">Loading...</p>
              ) : sequences.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <p className="text-lg mb-2">No sequences yet</p>
                  <p className="text-sm">Run <code className="bg-space-700 px-2 py-1 rounded">node scripts/seed-sequences.mjs</code> to create the default Welcome + Pro drip sequences.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sequences.map((seq) => {
                    const steps = JSON.parse(seq.steps) as { delayDays: number; subject: string }[];
                    return (
                      <div key={seq.id} className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-text-primary">{seq.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">{seq.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            seq.status === "active" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                            seq.status === "paused" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                            "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                          }`}>{seq.status}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-text-secondary mb-3">
                          <span>Trigger: <strong className="text-text-primary">{seq.trigger}</strong></span>
                          <span>Priority: <strong className="text-text-primary">{seq.priority}</strong></span>
                          <span>Steps: <strong className="text-text-primary">{steps.length}</strong></span>
                        </div>
                        {/* # Step timeline */}
                        <div className="space-y-2">
                          {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                              <span className="text-text-secondary">Day {step.delayDays}:</span>
                              <span className="text-text-primary">{step.subject}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* # Recent sends */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Sends</h2>
              {emailSends.length === 0 ? (
                <p className="text-text-secondary text-sm">No emails sent yet. Activate a sequence and wait for the cron to run.</p>
              ) : (
                <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-space-600 text-text-secondary">
                        <th className="text-left p-3">Recipient</th>
                        <th className="text-left p-3">Subject</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailSends.map((send) => (
                        <tr key={send.id} className="border-b border-space-700 last:border-0">
                          <td className="p-3 text-text-primary">{send.recipientEmail}</td>
                          <td className="p-3 text-text-secondary">{send.subject}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              send.status === "clicked" ? "bg-green-500/15 text-green-400" :
                              send.status === "opened" ? "bg-blue-500/15 text-blue-400" :
                              send.status === "delivered" ? "bg-emerald-500/15 text-emerald-300" :
                              send.status === "sent" ? "bg-zinc-500/15 text-zinc-400" :
                              send.status === "bounced" || send.status === "failed" ? "bg-red-500/15 text-red-400" :
                              "bg-yellow-500/15 text-yellow-400"
                            }`}>{send.status}</span>
                          </td>
                          <td className="p-3 text-text-secondary">{send.sentAt ? new Date(send.sentAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
```

- [ ] **Step 5: Add Funnel tab UI**

After the Emails tab block, add:

```tsx
        {/* ---- FUNNEL TAB ---- */}
        {tab === "funnel" && (
          <div className="space-y-6">
            {funnelLoading ? (
              <p className="text-text-secondary">Loading funnel data...</p>
            ) : (
              <>
                {/* # Conversion funnel visualization */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Conversion Funnel</h2>
                  {!funnelData || funnelData.totalSignups === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                      <p className="text-lg mb-2">No funnel data yet</p>
                      <p className="text-sm">Configure <code className="bg-space-700 px-2 py-1 rounded">JOBPILOT_API_URL</code> and <code className="bg-space-700 px-2 py-1 rounded">JOBPILOT_API_SECRET</code> to start syncing.</p>
                    </div>
                  ) : (
                    <div className="bg-space-800 border border-space-600 rounded-xl p-6">
                      <div className="space-y-3">
                        {funnelData.stages.map((stage, i) => {
                          const labels: Record<string, string> = {
                            signup: "Signups",
                            first_ai_use: "First AI Use",
                            fifth_ai_use: "5th AI Use",
                            pro_upgrade: "Pro Upgrade",
                          };
                          const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#10b981"];
                          return (
                            <div key={stage.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-text-primary font-medium">{labels[stage.name] || stage.name}</span>
                                <span className="text-text-secondary">{stage.count} ({stage.percent}%)</span>
                              </div>
                              <div className="h-8 bg-space-700 rounded-lg overflow-hidden">
                                <div
                                  className="h-full rounded-lg transition-all duration-500"
                                  style={{ width: `${Math.max(stage.percent, 2)}%`, backgroundColor: colors[i] || colors[0] }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* # Attribution table */}
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Attribution by Channel</h2>
                  {attribution.length === 0 ? (
                    <p className="text-text-secondary text-sm">No attribution data yet.</p>
                  ) : (
                    <div className="bg-space-800 border border-space-600 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-space-600 text-text-secondary">
                            <th className="text-left p-3">Channel</th>
                            <th className="text-right p-3">Signups</th>
                            <th className="text-right p-3">First Use</th>
                            <th className="text-right p-3">Pro</th>
                            <th className="text-right p-3">Conv. Rate</th>
                            <th className="text-right p-3">Est. Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attribution.map((row) => (
                            <tr key={row.channel} className="border-b border-space-700 last:border-0">
                              <td className="p-3 text-text-primary font-medium capitalize">{row.channel}</td>
                              <td className="p-3 text-right text-text-secondary">{row.signups}</td>
                              <td className="p-3 text-right text-text-secondary">{row.firstUse}</td>
                              <td className="p-3 text-right text-text-primary font-medium">{row.proUpgrades}</td>
                              <td className="p-3 text-right">
                                <span className={row.convRate >= 10 ? "text-green-400" : row.convRate >= 5 ? "text-yellow-400" : "text-text-secondary"}>
                                  {row.convRate}%
                                </span>
                              </td>
                              <td className="p-3 text-right text-emerald-400">£{row.estRevenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* # AI Insights */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary">AI Insights</h2>
                    <button
                      onClick={analyzeFunnelData}
                      disabled={funnelAnalyzing}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 transition-colors disabled:opacity-50"
                    >
                      {funnelAnalyzing ? "Analyzing..." : "Run Analysis"}
                    </button>
                  </div>
                  {funnelInsights ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <h3 className="font-medium text-text-primary mb-3">Insights</h3>
                        <ul className="space-y-2">
                          {funnelInsights.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-text-secondary flex gap-2">
                              <span className="text-indigo-400 mt-0.5">-</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-space-800 border border-space-600 rounded-xl p-5">
                        <h3 className="font-medium text-text-primary mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {funnelInsights.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-text-secondary flex gap-2">
                              <span className="text-green-400 mt-0.5">-</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">Click &quot;Run Analysis&quot; to get AI-powered insights on your funnel data.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
```

- [ ] **Step 6: Add supporting API routes for Emails tab**

Create `src/app/api/email/sequences/route.ts`:

```typescript
/* ============================================================
   EMAIL SEQUENCES API — /api/email/sequences
   ============================================================
   GET: List all email sequences.
   PATCH: Update sequence status (activate/pause/draft).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const sequences = await prisma.emailSequence.findMany({
    orderBy: { priority: "desc" },
  });
  return NextResponse.json(sequences);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const { id, status } = await req.json();
  if (!id || !["draft", "active", "paused"].includes(status)) {
    return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
  }
  const updated = await prisma.emailSequence.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}
```

Create `src/app/api/email/sends/route.ts`:

```typescript
/* ============================================================
   EMAIL SENDS API — /api/email/sends
   ============================================================
   GET: List recent email sends with optional limit.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
  const sends = await prisma.emailSend.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });
  return NextResponse.json(sends);
}
```

- [ ] **Step 7: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 8: Test in browser**

```bash
cd C:\Users\User\jobpilot-marketing
npm run dev
```

Open `http://localhost:3000`, log in, verify:
1. Emails tab shows — displays the two seeded sequences (or "no sequences" message)
2. Funnel tab shows — displays empty state with setup instructions
3. All existing tabs still work (queue, plans, agents, KPI, settings)

- [ ] **Step 9: Commit**

```bash
git add src/app/page.tsx src/app/api/email/sequences/ src/app/api/email/sends/
git commit -m "feat: add Emails and Funnel dashboard tabs with sequence viewer, attribution table, and AI insights"
```

---

### Task 9: Wire UTM Tagging into Social Posting Pipeline

**Files:**
- Modify: `src/app/api/scheduler/route.ts`

**Interfaces:**
- Consumes: `tagContentLinks` from `src/lib/funnel/utm.ts`
- Produces: All outbound social posts now have UTM-tagged jobpilotai.co links

- [ ] **Step 1: Add UTM tagging to the scheduler**

In `src/app/api/scheduler/route.ts`, add the import at the top:

```typescript
import { tagContentLinks } from "@/lib/funnel/utm";
```

Find the block where `postText` is built (around line 51-55):

```typescript
    let postText = item.captionText || item.body;
    if (item.hashtags && item.platform !== "twitter") {
      const tags = item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ");
      postText += `\n\n${tags}`;
    }
```

Replace with:

```typescript
    let postText = item.captionText || item.body;
    // # Auto-tag jobpilotai.co links with UTM params for attribution tracking
    postText = tagContentLinks(postText, item.platform, item.id);
    if (item.hashtags && item.platform !== "twitter") {
      const tags = item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ");
      postText += `\n\n${tags}`;
    }
```

- [ ] **Step 2: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scheduler/route.ts
git commit -m "feat: auto-tag outbound social post links with UTM params for attribution"
```

---

### Task 10: Final Verification + Environment Variable Docs

**Files:**
- None new — this is a verification task

- [ ] **Step 1: Full build check**

```bash
cd C:\Users\User\jobpilot-marketing
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify main app builds too**

```bash
cd C:\Users\User\jobpilot-website
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Run dev server and smoke test**

```bash
cd C:\Users\User\jobpilot-marketing
npm run dev
```

Verify in browser:
1. **Emails tab**: Shows seeded sequences with step timelines
2. **Funnel tab**: Shows empty state with config instructions
3. **Existing tabs**: All still work (queue, plans, agents, KPI, settings)
4. **Unsubscribe**: Visit `/api/email/unsubscribe?token=invalid` — should show "Invalid link" page

- [ ] **Step 4: Document required environment variables**

The following env vars need to be set in Vercel for both apps:

**Marketing HQ (jobpilot-marketing):**
```
RESEND_API_KEY=re_...              # Resend API key (same as main app)
RESEND_WEBHOOK_SECRET=whsec_...    # From Resend webhook settings
JOBPILOT_API_URL=https://jobpilotai.co
JOBPILOT_API_SECRET=<generate-32-char-random-string>
UNSUBSCRIBE_SECRET=<generate-32-char-random-string>
```

**Main app (jobpilot-website):**
```
INTERNAL_API_SECRET=<same-value-as-JOBPILOT_API_SECRET-above>
```

- [ ] **Step 5: Final commit if any fixes needed**

```bash
cd C:\Users\User\jobpilot-marketing
git status
# If changes exist:
git add -A
git commit -m "fix: address build issues from email/funnel integration"
```
