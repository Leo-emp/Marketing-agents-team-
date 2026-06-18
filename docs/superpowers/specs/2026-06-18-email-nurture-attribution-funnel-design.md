# Spec 1: Email Nurture + UTM Attribution + Funnel Dashboard

**Date:** 2026-06-18
**Repo:** jobpilot-marketing
**Status:** Approved

## Overview

Add three tightly coupled features to Marketing HQ as new dashboard tabs:

1. **Email Nurture Sequences** — automated welcome + free-to-Pro drip campaigns via Resend
2. **UTM Attribution Tracking** — auto-tag all outbound links, capture source data on signups
3. **Funnel Dashboard** — visualize visit → signup → first AI use → Pro conversion by channel

All features live in Marketing HQ. User event data is polled from the main app (jobpilot-website) via an internal API endpoint.

## Data Model

### New Prisma Models

```prisma
model EmailSequence {
  id          String   @id @default(cuid())
  name        String                              // "Welcome Series", "Free-to-Pro Drip"
  description String?
  trigger     String                              // signup, day_3, day_7, no_ai_usage_3d, high_usage_free, plan_upgrade
  priority    Int      @default(5)                // Higher = takes precedence when frequency cap hit
  status      String   @default("draft")          // draft, active, paused
  steps       String                              // JSON: [{ delayDays, subject, bodyTemplate, ctaUrl, ctaText }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sends       EmailSend[]
}

model EmailSend {
  id              String    @id @default(cuid())
  sequenceId      String
  stepIndex       Int                             // Which step in the sequence (0-based)
  recipientEmail  String
  recipientUserId String?                         // Main app user ID (if known)
  subject         String
  status          String    @default("queued")    // queued, sent, delivered, opened, clicked, bounced, failed
  resendMessageId String?                         // Resend API message ID for tracking
  utmSource       String?                         // Auto-tagged: email
  utmMedium       String?                         // Auto-tagged: nurture
  utmCampaign     String?                         // Auto-tagged: sequence name slug
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

model FunnelEvent {
  id          String   @id @default(cuid())
  userId      String                              // Main app user ID
  email       String?
  eventType   String                              // visit, signup, first_ai_use, fifth_ai_use, pro_upgrade
  utmSource   String?                             // twitter, linkedin, blog, email, reddit, extension, direct
  utmMedium   String?                             // social, organic, nurture, cpc
  utmCampaign String?                             // Specific campaign name
  utmTerm     String?                             // Keyword (for paid)
  utmContent  String?                             // A/B variant
  metadata    String?                             // JSON: { feature, planAmount, etc. }
  eventDate   DateTime @default(now())
  createdAt   DateTime @default(now())

  @@unique([userId, eventType])                   // Deduplicate: one event per type per user
  @@index([eventType])
  @@index([utmSource])
  @@index([eventDate])
}
```

## Anti-Annoyance Email Controls

### Frequency Caps (enforced at send time)
- **Max 3 emails per month per user** — hard cap, no exceptions
- **Min 5-day gap between emails** — prevents clustering
- **Max 1 active sequence per user** — if user qualifies for multiple, highest priority wins

### Smart Suppression
- Skip "try Pro" drip if user already upgraded (check latest FunnelEvent)
- Skip "come back" emails if user was active in last 48 hours
- Auto-pause sequence for a user if they haven't opened the last 2 emails (cold detection)
- Never send anything except the welcome email in the first 24 hours after signup

### Unsubscribe
- Every email includes `List-Unsubscribe` header (Gmail/Yahoo 2024+ requirement)
- One-click unsubscribe link → `/api/email/unsubscribe?token=<signed-token>`
- Sets `EmailPreference.unsubscribedAt` — permanently excluded from all sequences
- Unsubscribe token is HMAC-signed to prevent abuse

## Email Sequences

### Welcome Series (trigger: signup, priority: 10)

| Step | Delay | Subject | Purpose |
|------|-------|---------|---------|
| 1 | 0 days | Welcome to JobPilot — here's your quick start | Feature overview, single CTA: try resume analyzer |
| 2 | 5 days | Your resume score might surprise you | Nudge to upload resume if they haven't yet |
| 3 | 12 days | 3 things most job seekers miss | Value content, soft CTA to interview prep |

### Free-to-Pro Drip (trigger: 5+ AI uses on free plan, priority: 5)

| Step | Delay | Subject | Purpose |
|------|-------|---------|---------|
| 1 | 0 days | You're getting serious about your job search | Acknowledge usage, show what Pro unlocks |
| 2 | 7 days | How resume optimization users land interviews faster | Social proof, data-driven |
| 3 | 14 days | Your Pro upgrade is waiting | Direct upgrade CTA |

### Template Design
- Dark theme HTML matching JobPilot brand (indigo/purple palette, space theme)
- Generated by a new Email Agent using existing Gemini infrastructure
- Reviewed and approved in the Emails tab before activation
- All links auto-tagged with UTM params: `utm_source=email&utm_medium=nurture&utm_campaign=<sequence-slug>`

## UTM Attribution System

### Auto-Tagging Outbound Links
- Social posts: UTM params appended to all jobpilotai.co links in posted content
  - Format: `?utm_source=<platform>&utm_medium=social&utm_campaign=<content-id>`
- Email links: tagged as described above
- Blog posts (Spec 2): `utm_source=blog&utm_medium=organic`

### Main App Change Required
One new internal API endpoint in `jobpilot-website`:

```
GET /api/internal/funnel-events?since=<ISO-date>
Authorization: Bearer <INTERNAL_API_SECRET>
```

Returns:
```json
[
  {
    "userId": "clx...",
    "email": "user@example.com",
    "eventType": "signup",
    "utmSource": "twitter",
    "utmMedium": "social",
    "utmCampaign": "resume-tips-post",
    "eventDate": "2026-06-18T10:30:00Z",
    "metadata": { "referralSource": "twitter" }
  }
]
```

Event types derived from main app data:
- `signup` — new User record created
- `first_ai_use` — first AiResult record for user
- `fifth_ai_use` — 5th AiResult record for user
- `pro_upgrade` — User.plan changed from "free" to "pro"

UTM data source: User.referralSource field (already exists) + new cookie-based UTM capture on the main app's signup flow.

### Polling
Marketing HQ cron runs hourly, calls the internal API with `?since=<last-sync-timestamp>`, upserts FunnelEvent records (deduplicated by userId + eventType).

## Funnel Dashboard

New **Funnel** tab in Marketing HQ with three views:

### Conversion Funnel
Visual funnel chart (SVG/canvas) showing drop-off at each stage:
```
Signups → First AI Use → 5th AI Use → Pro Upgrade
  100%       67%            34%           8%
```
Filterable by: date range, UTM source, UTM campaign.

### Attribution Table
Sortable table showing per-channel metrics:

| Channel | Signups | First Use | Pro Upgrades | Conv. Rate | Est. Revenue |
|---------|---------|-----------|-------------|------------|-------------|
| Blog | 89 | 71 | 14 | 15.7% | £139 |
| Twitter | 142 | 95 | 11 | 7.7% | £109 |
| Email | 34 | 28 | 9 | 26.5% | £89 |
| LinkedIn | 67 | 45 | 6 | 9.0% | £59 |
| Extension | 203 | 178 | 22 | 10.8% | £219 |
| Direct | 312 | 189 | 15 | 4.8% | £149 |

### Trend Charts
Line charts showing signups, conversions, and revenue over time, broken down by channel. Matches existing KPI tab dark theme styling.

### AI Insights
KPI Analyst agent extended to analyze funnel data:
- "Blog traffic converts at 2x the rate of Twitter — consider doubling SEO content output"
- "Email nurture drives 26.5% conversion vs 4.8% for direct — highest ROI channel"
- "Chrome Extension users have the best first-use rate (88%) — optimize the extension onboarding"

## Architecture

### New Files

```
src/lib/email/
  resend.ts              — Resend SDK: send email, verify webhook signature
  sequences.ts           — Sequence engine: evaluate triggers, enforce caps, queue sends
  templates.ts           — HTML email template builder (dark theme, branded)
  unsubscribe.ts         — Token signing/verification for unsubscribe links

src/app/api/email/
  send/route.ts          — POST: trigger sequence evaluation + send queued emails (cron)
  webhook/route.ts       — POST: Resend webhook for delivery/open/click events
  unsubscribe/route.ts   — GET: one-click unsubscribe handler

src/lib/funnel/
  sync.ts                — Poll main app API, upsert FunnelEvent records
  analytics.ts           — Funnel calculations: conversion rates, attribution breakdown
  utm.ts                 — UTM tag generation for outbound links

src/app/api/funnel/
  sync/route.ts          — POST: cron-triggered funnel data sync
  route.ts               — GET: funnel data for dashboard
  attribution/route.ts   — GET: per-channel attribution breakdown
```

### Dashboard Changes
`page.tsx` gets two new tabs: **Emails** and **Funnel**, following the existing tab pattern.

### Cron Jobs (vercel.json)
```json
{
  "crons": [
    { "path": "/api/email/send", "schedule": "*/30 * * * *" },
    { "path": "/api/funnel/sync", "schedule": "0 * * * *" },
    { "path": "/api/scheduler", "schedule": "*/5 * * * *" }
  ]
}
```
(Last one already exists for social posting.)

### Environment Variables
```
RESEND_API_KEY          — Resend API key
RESEND_WEBHOOK_SECRET   — Resend webhook signing secret
JOBPILOT_API_URL        — Main app base URL (e.g., https://jobpilotai.co)
JOBPILOT_API_SECRET     — Shared secret for internal API auth
UNSUBSCRIBE_SECRET      — HMAC key for signing unsubscribe tokens
```

## Main App Changes (jobpilot-website)

Minimal changes needed:

1. **New API route:** `GET /api/internal/funnel-events?since=<date>` — returns recent user events with UTM data
2. **UTM cookie capture:** On landing pages, read `utm_*` query params and store in a cookie (30-day expiry, first-touch attribution — only set if no existing UTM cookie). On signup, save cookie value to User.referralSource as JSON. For returning users who already have a referralSource, do not overwrite.
3. **Shared secret auth:** Validate `Authorization: Bearer <INTERNAL_API_SECRET>` on the internal endpoint.

## Dependencies

- `resend` — npm package for Resend email API
- No other new dependencies. Existing Gemini, Prisma, and Tailwind infrastructure handles everything else.

## Out of Scope (Spec 2 & 3)

- SEO Blog Pipeline — separate spec
- Open Generative AI / Creative Studio — separate spec
- A/B testing email subject lines — future enhancement
- SMS/push notifications — future enhancement
