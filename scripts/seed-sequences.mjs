/* ============================================================
   SEED SEQUENCES - Create default email nurture sequences
   ============================================================
   Runs during Vercel builds (after sync-db.mjs) and can also be
   run manually: node scripts/seed-sequences.mjs
   Creates the Welcome Series and Free-to-Pro Drip sequences
   in draft status (must be manually activated in the dashboard).

   Uses @libsql/client with raw SQL (same pattern as sync-db.mjs)
   because the Prisma 7 generated client is TypeScript-only and
   cannot be imported from a plain .mjs script.

   Idempotent — INSERT OR IGNORE on fixed primary keys means
   existing sequences (including their status) are never touched.
   ============================================================ */

import { createClient } from "@libsql/client";

// # Connect to production Turso during builds, local SQLite in dev
const db = createClient({
  url: process.env.DATABASE_URL || "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const BASE_URL = "https://jobpilotai.co";

// # ── Sequence definitions ─────────────────────────────────────
// # Each entry becomes one EmailSequence row; steps are stored as
// # a JSON string exactly as the dashboard and send cron expect.
const SEQUENCES = [
  {
    id: "welcome-series",
    name: "Welcome Series",
    description: "Onboarding sequence for new signups — introduces key features over 12 days",
    trigger: "signup",
    priority: 10,
    status: "draft", // # Activate manually in the dashboard after reviewing templates
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
  {
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
];

// # ── Seed ─────────────────────────────────────────────────────
async function seed() {
  for (const seq of SEQUENCES) {
    // # INSERT OR IGNORE — if the row already exists (by primary key)
    // # nothing happens, so re-running on every build never overwrites
    // # a sequence the admin has since activated or edited.
    const result = await db.execute({
      sql: `INSERT OR IGNORE INTO EmailSequence
              (id, name, description, trigger, priority, status, steps)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [seq.id, seq.name, seq.description, seq.trigger, seq.priority, seq.status, seq.steps],
    });
    console.log(
      result.rowsAffected > 0
        ? `  Created "${seq.name}" (${seq.status})`
        : `  Skipping "${seq.name}" — already exists`
    );
  }
  console.log("Seed complete. Activate sequences in the dashboard Emails tab when ready.");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.close());
