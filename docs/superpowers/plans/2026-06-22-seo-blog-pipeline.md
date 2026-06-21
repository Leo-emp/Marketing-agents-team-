# SEO Blog Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automated pipeline that generates SEO blog articles via AI, queues them for approval, publishes to jobpilotai.co/blog, and auto-shares to social channels.

**Architecture:** Blog Writer Agent in Marketing HQ uses Research Agent for topic discovery, Gemini for writing 200-400 word articles, Visual Designer for cover images, and Editorial Agent for quality gating. Approved articles push to main app via internal API. Main app stores BlogPost in DB and serves via ISR. Social share posts auto-generate on publish.

**Tech Stack:** Next.js 16 (both repos), Prisma/LibSQL, Gemini 2.5 Flash, Tailwind v4, react-markdown

## Global Constraints

- All code uses `// # comment` style comments throughout for learning
- Cron routes: `CRON_SECRET` with timing-safe comparison (Buffer-based `timingSafeEqual`, length check first)
- Internal API routes: `INTERNAL_API_SECRET` Bearer token with timing-safe comparison
- Admin routes: `isAdmin()` from `@/lib/auth-check`
- Gemini calls: `callGemini()` and `callGeminiWithSearch()` from `@/lib/gemini`
- Research: `conductResearch()` and `discoverTopic()` from `@/lib/research`
- Editorial: `reviewContent()` from `@/lib/editorial`
- Visual: `designVisual()` from `@/lib/visual/designer-agent`
- Blog article word count: 200-400 words
- Cover image: 1200x630 OG size, dark/space theme
- Volume: 3 articles per week (Mon/Wed/Fri cron)
- Categories (fixed set): Resume Tips, Interview Prep, LinkedIn, Cover Letters, Career Change, Job Search, Career Advice, Networking
- Main app blog pages: ISR with `revalidate = 3600`
- Next.js 16: read `node_modules/next/dist/docs/` before writing route handlers

## File Structure

### Marketing HQ (`jobpilot-marketing`)

| File | Responsibility |
|------|---------------|
| `src/lib/blog-writer.ts` | Blog Writer Agent — topic discovery, article generation, cover image, editorial, queuing |
| `src/app/api/blog/generate/route.ts` | Cron route — triggers blog pipeline Mon/Wed/Fri |
| `src/app/api/blog/publish/route.ts` | Publish hook — pushes approved blog to main app + creates social share |
| `vercel.json` | Add blog/generate cron entry |

### Main App (`jobpilot-website`)

| File | Responsibility |
|------|---------------|
| `prisma/schema.prisma` | Add BlogPost model |
| `src/app/api/internal/blog-posts/route.ts` | POST: receive published articles, GET: return slugs |
| `src/app/(marketing)/blog/page.tsx` | Refactor: DB-driven listing with cover images |
| `src/app/(marketing)/blog/[slug]/page.tsx` | Refactor: DB-driven article with react-markdown + cover image |
| `src/app/sitemap.ts` | Dynamic blog URLs from DB |
| `scripts/seed-blog-posts.mjs` | Migrate 6 hardcoded articles to DB |

---

### Task 1: BlogPost Prisma Model + Migration (main app)

**Files:**
- Modify: `C:\Users\User\jobpilot-website\prisma\schema.prisma`

**Interfaces:**
- Produces: `BlogPost` model with fields: `id`, `slug` (unique), `title`, `excerpt`, `content`, `category`, `tags`, `metaTitle`, `metaDescription`, `coverImageUrl`, `author`, `readTime`, `status`, `publishedAt`, `createdAt`, `updatedAt`

- [ ] **Step 1: Add BlogPost model to schema**

Append to `prisma/schema.prisma`:

```prisma
// # ---- Blog Posts ----
// # SEO blog articles published via Marketing HQ pipeline
// # Served at /blog with ISR, content in markdown
model BlogPost {
  id              String    @id @default(cuid())
  slug            String    @unique               // # URL slug e.g. "how-to-beat-ats-2026"
  title           String                          // # Article title (H1)
  excerpt         String                          // # Short description for cards (~30 words)
  content         String                          // # Full markdown article body
  category        String                          // # "Resume Tips", "Interview Prep", etc.
  tags            String?                         // # Comma-separated SEO tags
  metaTitle       String?                         // # SEO <title> override (falls back to title)
  metaDescription String?                         // # SEO meta description (under 160 chars)
  coverImageUrl   String?                         // # 1200x630 OG/cover image URL
  author          String   @default("JobPilot AI Team")
  readTime        String                          // # "2 min read"
  status          String   @default("draft")      // # draft, published, archived
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@index([category])
}
```

- [ ] **Step 2: Run migration**

```bash
cd C:\Users\User\jobpilot-website
npx prisma migrate dev --name add_blog_post_model
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add BlogPost model for SEO blog pipeline"
```

---

### Task 2: Main App Internal Blog API Routes

**Files:**
- Create: `C:\Users\User\jobpilot-website\src\app\api\internal\blog-posts\route.ts`

**Interfaces:**
- Consumes: `BlogPost` Prisma model from Task 1
- Produces:
  - `POST /api/internal/blog-posts` — accepts `{ slug, title, excerpt, content, category, tags?, metaTitle?, metaDescription?, coverImageUrl?, author?, readTime }`, returns `{ id, slug }`, 409 on duplicate slug
  - `GET /api/internal/blog-posts` — returns `{ slugs: string[] }` for duplicate avoidance

- [ ] **Step 1: Read Next.js 16 route handler docs**

```bash
cat C:\Users\User\jobpilot-website\node_modules\next\dist\docs\app-router-route-handlers.md
```

- [ ] **Step 2: Create the route file**

Create `src/app/api/internal/blog-posts/route.ts`:

```typescript
/* ============================================================
   INTERNAL BLOG POSTS — /api/internal/blog-posts
   ============================================================
   POST: Receive published articles from Marketing HQ.
   GET:  Return all existing slugs for duplicate avoidance.
   Protected by INTERNAL_API_SECRET Bearer token.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { dbRetry } from "@/lib/db-retry";

// # Verify internal API secret — shared with Marketing HQ
function verifyAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${secret}`;

  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return false;
  }
  return true;
}

// # POST: Create a new published blog post
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // # Validate required fields
  const { slug, title, excerpt, content, category, readTime } = body;
  if (!slug || !title || !excerpt || !content || !category || !readTime) {
    return NextResponse.json(
      { error: "Missing required fields: slug, title, excerpt, content, category, readTime" },
      { status: 400 }
    );
  }

  // # Check for duplicate slug
  const existing = await dbRetry(() =>
    prisma.blogPost.findUnique({ where: { slug } })
  );
  if (existing) {
    return NextResponse.json(
      { error: `Blog post with slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  // # Create the blog post as published
  const post = await dbRetry(() =>
    prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        tags: body.tags || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        coverImageUrl: body.coverImageUrl || null,
        author: body.author || "JobPilot AI Team",
        readTime,
        status: "published",
        publishedAt: new Date(),
      },
    })
  );

  return NextResponse.json({ id: post.id, slug: post.slug });
}

// # GET: Return all existing slugs for duplicate avoidance
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await dbRetry(() =>
    prisma.blogPost.findMany({
      select: { slug: true },
    })
  );

  return NextResponse.json({ slugs: posts.map((p) => p.slug) });
}
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/internal/blog-posts/route.ts
git commit -m "feat: add internal blog posts API for Marketing HQ publishing"
```

---

### Task 3: Seed Existing Articles + Refactor Blog Pages (main app)

**Files:**
- Create: `C:\Users\User\jobpilot-website\scripts\seed-blog-posts.mjs`
- Modify: `C:\Users\User\jobpilot-website\src\app\(marketing)\blog\page.tsx`
- Modify: `C:\Users\User\jobpilot-website\src\app\(marketing)\blog\[slug]\page.tsx`
- Modify: `C:\Users\User\jobpilot-website\src\app\sitemap.ts`

**Interfaces:**
- Consumes: `BlogPost` model from Task 1, `react-markdown` package
- Produces: DB-driven blog listing and article pages with cover images, dynamic sitemap

- [ ] **Step 1: Install react-markdown**

```bash
cd C:\Users\User\jobpilot-website
npm install react-markdown
```

- [ ] **Step 2: Create seed script**

Create `scripts/seed-blog-posts.mjs`:

```javascript
/* # Seed script — migrates 6 hardcoded blog articles to BlogPost table
   # Run once after migration: node scripts/seed-blog-posts.mjs */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// # Connect to the database
const libsql = createClient({ url: `file:./dev.db` });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const posts = [
  {
    slug: "how-to-beat-ats-systems-2026",
    title: "How to Beat ATS Systems in 2026",
    excerpt: "Applicant Tracking Systems reject 75% of resumes before a human ever sees them. Here's exactly how to format your resume to get through every time.",
    category: "Resume Tips",
    readTime: "5 min read",
    publishedAt: new Date("2026-05-02"),
    content: `## What Is an ATS?\n\nAn Applicant Tracking System (ATS) is software that companies use to manage job applications. It scans, parses, and ranks resumes before a human recruiter ever sees them. In 2026, over 99% of Fortune 500 companies and 75% of mid-size companies use some form of ATS.\n\nThe harsh reality: **up to 75% of resumes are rejected by ATS before reaching a human**. Your resume could be perfect, but if it's not formatted correctly for the ATS, it goes straight to the digital trash.\n\n## Why Most Resumes Get Rejected\n\nATS software isn't reading your resume the way a person would. It's parsing text, looking for keywords, and trying to extract structured data. Here's what trips it up:\n\n- **Fancy formatting** — columns, tables, text boxes, and headers/footers confuse most ATS parsers\n- **Graphics and icons** — ATS can't read images, icons, or infographics\n- **Unusual file formats** — always submit .docx or .pdf unless told otherwise\n- **Missing keywords** — if the job description says "project management" and you wrote "managed projects," some ATS won't make the connection\n\n## How to Format Your Resume for ATS\n\n### 1. Use a Clean, Single-Column Layout\n\nStick to a simple, top-to-bottom layout. No columns, no sidebars, no text boxes. Use standard section headings: "Work Experience," "Education," "Skills." ATS software looks for these exact headings to categorize your information.\n\n### 2. Mirror the Job Description\n\nThis is the single most impactful thing you can do. Read the job posting carefully and incorporate the exact phrases and keywords they use.\n\n### 3. Use Standard Fonts and Formatting\n\nStick with Arial, Calibri, or Times New Roman. Use bold for headings, but avoid underlining or italics for critical information.\n\n### 4. Include a Skills Section\n\nCreate a dedicated "Skills" section near the top of your resume. List both hard skills and soft skills that match the job description.\n\n### 5. Save in the Right Format\n\nUnless the job posting specifies otherwise, submit your resume as a **.docx file**.\n\n## Test Your Resume\n\nBefore submitting, run your resume through an ATS simulator. Tools like JobPilot AI can analyze your resume against a specific job description and give you an ATS compatibility score.\n\n**Your resume is great. Make sure it actually gets seen.**`,
  },
  {
    slug: "linkedin-profile-mistakes",
    title: "7 LinkedIn Profile Mistakes That Cost You Interviews",
    excerpt: "Your LinkedIn profile is your digital first impression. These common mistakes are silently killing your chances of getting contacted by recruiters.",
    category: "LinkedIn",
    readTime: "4 min read",
    publishedAt: new Date("2026-04-28"),
    content: `## Your LinkedIn Profile Is Your Digital First Impression\n\nRecruiters spend an average of **7.4 seconds** scanning a LinkedIn profile before deciding whether to reach out. In those few seconds, small mistakes can cost you big opportunities.\n\n## 1. A Weak or Generic Headline\n\nYour headline is the most visible part of your profile. Lead with your expertise, not "Open to Work."\n\n## 2. No Profile Photo\n\nProfiles without photos get 21x fewer views.\n\n## 3. An Empty "About" Section\n\nThe About section is your elevator pitch. Don't leave it blank.\n\n## 4. Job Descriptions That Read Like Resumes\n\nHighlight accomplishments with measurable results instead of listing responsibilities.\n\n## 5. Ignoring the Skills Section\n\nAdd at least 10 relevant skills. LinkedIn's algorithm uses them for search ranking.\n\n## 6. No Recommendations\n\nRecommendations are social proof. Aim for 3-5.\n\n## 7. Not Engaging with Content\n\nLinkedIn rewards active users. Comment on 2-3 posts per day.\n\n**Your LinkedIn profile works for you 24/7 — make sure it's saying the right things.**`,
  },
  {
    slug: "cover-letter-that-gets-read",
    title: "How to Write a Cover Letter That Actually Gets Read",
    excerpt: "Most cover letters get skimmed in under 10 seconds. Learn the structure that hooks hiring managers and makes them want to read your resume.",
    category: "Cover Letters",
    readTime: "6 min read",
    publishedAt: new Date("2026-04-21"),
    content: `## Do Cover Letters Still Matter?\n\nYes — but only if they're good. **83% of hiring managers say a strong cover letter can convince them to interview a candidate** even if their resume isn't a perfect match.\n\n## The 4-Paragraph Structure That Works\n\n### Paragraph 1: The Hook\n\nOpen with something specific to the company or role.\n\n### Paragraph 2: Your Proof\n\nPick 2-3 accomplishments that directly relate to the job requirements.\n\n### Paragraph 3: Why This Company\n\nShow genuine interest in the company's mission, product, or culture.\n\n### Paragraph 4: The Close\n\nEnd with a clear call to action.\n\n## Common Mistakes to Avoid\n\n- Repeating your resume\n- Making it about you instead of them\n- Being too long — keep it under 400 words\n- Generic templates\n- Typos\n\n**A great cover letter doesn't just get read — it gets you remembered.**`,
  },
  {
    slug: "career-change-resume-guide",
    title: "The Complete Guide to Career Change Resumes",
    excerpt: "Switching industries? Your resume needs a different strategy. Learn how to reframe your experience and highlight transferable skills that matter.",
    category: "Career Change",
    readTime: "7 min read",
    publishedAt: new Date("2026-04-15"),
    content: `## Switching Careers? Your Resume Needs a Different Strategy\n\nA career change resume isn't about hiding your past — it's about reframing it.\n\n## Step 1: Identify Your Transferable Skills\n\nMap your existing skills to the requirements of your target role.\n\n## Step 2: Use a Combination Format\n\nLead with a skills-based summary, then list work history chronologically.\n\n## Step 3: Write a Powerful Summary Statement\n\nBridge your past and your future in 3-4 lines.\n\n## Step 4: Reframe Your Experience\n\nTranslate achievements into the language of your target industry.\n\n## Step 5: Fill the Gaps\n\nShow initiative with certifications, side projects, and volunteer work.\n\n**Your past experience isn't a liability — it's your unfair advantage. Frame it right.**`,
  },
  {
    slug: "interview-questions-you-will-be-asked",
    title: "The 20 Interview Questions You Will Be Asked (And How to Answer Them)",
    excerpt: "From 'Tell me about yourself' to 'Why should we hire you?' — proven answer frameworks for every common interview question in 2026.",
    category: "Interview Prep",
    readTime: "8 min read",
    publishedAt: new Date("2026-04-08"),
    content: `## Preparation Beats Improvisation\n\nMaster these 20 questions and walk into any interview with confidence.\n\n## The Big 5\n\n### 1. "Tell me about yourself."\n\nStructure: Present → Past → Future.\n\n### 2. "Why do you want to work here?"\n\nShow genuine research about the company.\n\n### 3. "What are your greatest strengths?"\n\nPick 2-3 strengths backed by examples.\n\n### 4. "What is your greatest weakness?"\n\nChoose a real weakness you're actively improving.\n\n### 5. "Where do you see yourself in 5 years?"\n\nShow ambition aligned with the company.\n\n## Behavioral Questions: Use STAR\n\n- **S**ituation — set the scene\n- **T**ask — your responsibility\n- **A**ction — what you did\n- **R**esult — the outcome\n\n**The interview is a conversation, not an interrogation. Prepare well, be authentic.**`,
  },
  {
    slug: "remote-job-search-strategy",
    title: "How to Land a Remote Job: A Step-by-Step Strategy",
    excerpt: "Remote jobs get 10x more applications than on-site roles. Here's how to stand out, where to look, and what remote-first companies actually want to see.",
    category: "Job Search",
    readTime: "6 min read",
    publishedAt: new Date("2026-04-01"),
    content: `## Remote Jobs Are Competitive\n\nRemote positions receive **10x more applications** than on-site roles. You need a targeted strategy.\n\n## Step 1: Optimize Your Profile for Remote Work\n\nSignal "remote-ready" on LinkedIn and your resume.\n\n## Step 2: Know Where to Look\n\nUse remote-first job boards: We Work Remotely, Remote.co, FlexJobs.\n\n## Step 3: Target Remote-First Companies\n\nLook for "remote-first" or "distributed team" signals.\n\n## Step 4: Highlight Remote-Specific Skills\n\nWritten communication, self-management, async collaboration.\n\n## Step 5: Nail the Remote Interview\n\nTest your tech, look at the camera, have remote work examples ready.\n\n**Remote work isn't just about where you work. It's about how you work.**`,
  },
];

async function seed() {
  console.log("Seeding blog posts...");

  for (const post of posts) {
    // # Skip if already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      console.log(`  Skipping "${post.slug}" — already exists`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        ...post,
        status: "published",
      },
    });
    console.log(`  Created "${post.slug}"`);
  }

  console.log("Done!");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Run seed script**

```bash
node scripts/seed-blog-posts.mjs
```

- [ ] **Step 4: Refactor blog listing page**

Rewrite `src/app/(marketing)/blog/page.tsx` to query BlogPost from DB:

```tsx
/* ============================================================
   BLOG PAGE - DB-Driven Blog Listing
   ============================================================
   Career advice and job search tips blog. Articles created by
   Marketing HQ's Blog Writer Agent, stored in BlogPost table.
   ISR: regenerates every hour for fresh content.
   ============================================================ */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dbRetry } from "@/lib/db-retry";

// # ISR: regenerate every hour to pick up new published posts
export const revalidate = 3600;

export const metadata = {
  title: "Blog — JobPilot AI",
  description: "Career tips, resume advice, and job search strategies from the JobPilot AI team.",
};

// # Category color mapping for visual variety
const CATEGORY_COLORS: Record<string, string> = {
  "Resume Tips": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Interview Prep": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "LinkedIn": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Cover Letters": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Career Change": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Job Search": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Career Advice": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Networking": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export default async function BlogPage() {
  // # Fetch all published posts, newest first
  const posts = await dbRetry(() =>
    prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        readTime: true,
        coverImageUrl: true,
        publishedAt: true,
      },
    })
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
      {/* # Page Header */}
      <div className="mb-16">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold mb-4 glow-text-strong">
          Blog
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Career advice, resume tips, and job search strategies to help you land your next role faster.
        </p>
      </div>

      {/* # Blog Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => {
          const color = CATEGORY_COLORS[post.category] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
          const dateStr = post.publishedAt
            ? post.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "";

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-card-border bg-space-800/60 overflow-hidden hover:border-brand-indigo/30 hover:bg-space-700/60 transition-all duration-300"
            >
              {/* # Cover image */}
              {post.coverImageUrl && (
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-7">
                {/* # Category + Read time */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-text-muted">{post.readTime}</span>
                </div>

                {/* # Title */}
                <h2 className="text-xl font-bold mb-3 group-hover:text-brand-light transition-colors leading-tight">
                  {post.title}
                </h2>

                {/* # Excerpt */}
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* # Date + Read more */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">{dateStr}</span>
                  <span className="text-sm text-brand-light font-medium group-hover:text-white transition-colors">
                    Read more &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* # Empty state */}
      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">No blog posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Refactor article page**

Rewrite `src/app/(marketing)/blog/[slug]/page.tsx` to fetch from DB and render markdown with `react-markdown`:

```tsx
/* ============================================================
   BLOG POST PAGE - DB-Driven Article View
   ============================================================
   Fetches blog post from BlogPost table by slug. Renders
   markdown content with react-markdown. ISR for fresh content.
   ============================================================ */

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { prisma } from "@/lib/prisma";
import { dbRetry } from "@/lib/db-retry";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

// # ISR: regenerate every hour
export const revalidate = 3600;

// # Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  "Resume Tips": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Interview Prep": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "LinkedIn": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Cover Letters": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Career Change": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Job Search": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Career Advice": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Networking": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

// # Generate static paths from published posts
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

// # SEO metadata per post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await dbRetry(() =>
    prisma.blogPost.findUnique({ where: { slug } })
  );

  if (!post || post.status !== "published") {
    return { title: "Post Not Found — JobPilot AI" };
  }

  const description = post.metaDescription || post.excerpt;
  const title = post.metaTitle || `${post.title} — JobPilot AI Blog`;

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      url: `https://jobpilotai.co/blog/${slug}`,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

// # Blog Post Page Component
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await dbRetry(() =>
    prisma.blogPost.findUnique({ where: { slug } })
  );

  // # 404 if not found or not published
  if (!post || post.status !== "published") {
    notFound();
  }

  const color = CATEGORY_COLORS[post.category] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  const dateStr = post.publishedAt
    ? post.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const dateISO = post.publishedAt?.toISOString().split("T")[0] || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      {/* # Structured data for Google rich results */}
      <ArticleJsonLd
        title={post.title}
        description={post.metaDescription || post.excerpt}
        slug={slug}
        datePublished={dateISO}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://jobpilotai.co" },
        { name: "Blog", url: "https://jobpilotai.co/blog" },
        { name: post.title, url: `https://jobpilotai.co/blog/${slug}` },
      ]} />

      {/* # Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-light transition-colors mb-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      {/* # Cover image */}
      {post.coverImageUrl && (
        <div className="w-full rounded-2xl overflow-hidden mb-8">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
            width={1200}
            height={630}
          />
        </div>
      )}

      {/* # Post Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
            {post.category}
          </span>
          <span className="text-xs text-text-muted">{post.readTime}</span>
          <span className="text-xs text-text-muted">{dateStr}</span>
        </div>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold glow-text-strong leading-tight">
          {post.title}
        </h1>
      </div>

      {/* # Article Content — rendered from markdown */}
      <article className="prose-custom">
        <ReactMarkdown
          components={{
            h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-8 mb-3">{children}</h3>,
            p: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
            li: ({ children }) => <li className="ml-6 text-text-secondary leading-relaxed list-disc">{children}</li>,
            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
            a: ({ href, children }) => (
              <a href={href} className="text-brand-light hover:text-white underline transition-colors" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      {/* # CTA at the bottom */}
      <div className="mt-16 rounded-2xl border border-card-border bg-space-800/60 p-8 text-center">
        <h3 className="text-xl font-bold mb-3">Ready to Put This Into Practice?</h3>
        <p className="text-text-secondary text-base mb-6 max-w-md mx-auto">
          JobPilot AI helps you build ATS-optimized resumes, write tailored cover letters, and prepare for interviews — all powered by AI.
        </p>
        <Link href="/signup" className="btn-primary inline-block px-8 py-3 text-base">
          Try JobPilot AI Free
        </Link>
      </div>

      {/* # Back to Blog */}
      <div className="mt-10 text-center">
        <Link href="/blog" className="text-sm text-brand-light hover:text-white transition-colors">
          &larr; Back to all posts
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update sitemap**

Modify `src/app/sitemap.ts` — replace the hardcoded `BLOG_SLUGS` array with a dynamic DB query:

Replace the `BLOG_SLUGS` constant and `blogPages` section with:

```typescript
  /* # Blog post pages — dynamic from DB */
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
    blogPages = blogPosts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    /* # DB error shouldn't break the sitemap */
  }
```

Remove the `BLOG_SLUGS` constant entirely.

- [ ] **Step 7: Verify build**

```bash
npx tsc --noEmit
npx next build
```

- [ ] **Step 8: Commit**

```bash
git add scripts/seed-blog-posts.mjs src/app/\(marketing\)/blog/ src/app/sitemap.ts package.json package-lock.json
git commit -m "feat: refactor blog pages to DB-driven with react-markdown + seed existing articles"
```

---

### Task 4: Blog Writer Agent (Marketing HQ)

**Files:**
- Create: `C:\Users\User\jobpilot-marketing\src\lib\blog-writer.ts`

**Interfaces:**
- Consumes:
  - `discoverTopic(platform: string, contentType: string, tone?: string)` from `@/lib/research` — returns `{ topic, reasoning, researchBrief }`
  - `reviewContent(content: string, platform: string, contentType: string, hook: string)` from `@/lib/editorial` — returns `EditorialReview`
  - `designVisual(content: string, platform: string, contentType: string, mediaPrompt: string | null, topic?: string)` from `@/lib/visual/designer-agent` — returns `{ slides, caption }`
  - `callGemini(prompt: string)` from `@/lib/gemini`
  - `prisma.content.create()` for queuing drafts
- Produces:
  - `generateBlogArticle(): Promise<{ drafted: boolean; contentId?: string; error?: string }>` — full pipeline: discover topic → write article → generate cover image → editorial review → queue as Content record

- [ ] **Step 1: Create blog-writer.ts**

Create `src/lib/blog-writer.ts`:

```typescript
/* ============================================================
   BLOG WRITER AGENT - SEO Article Pipeline
   ============================================================
   Generates 200-400 word SEO blog articles for jobpilotai.co.
   Pipeline: topic discovery → write → cover image → editorial
   review → queue as Content for approval.
   ============================================================ */

import { callGemini } from "./gemini";
import { discoverTopic } from "./research";
import { reviewContent } from "./editorial";
import { designVisual } from "./visual/designer-agent";
import { renderSlide } from "./visual/canvas-renderer";
import { prisma } from "./prisma";

// # Fixed categories matching the blog
const CATEGORIES = [
  "Resume Tips", "Interview Prep", "LinkedIn", "Cover Letters",
  "Career Change", "Job Search", "Career Advice", "Networking",
];

// # Blog article shape parsed from Gemini response
interface BlogArticle {
  title: string;
  slug: string;
  content: string;       // # Markdown body
  excerpt: string;       // # ~30 word summary
  category: string;
  tags: string;          // # Comma-separated
  metaDescription: string; // # Under 160 chars
  mediaPrompt: string;   // # Description for cover image
}

// # Fetch existing slugs from main app to avoid duplicates
async function getExistingSlugs(): Promise<string[]> {
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;
  if (!apiUrl || !apiSecret) return [];

  try {
    const res = await fetch(`${apiUrl}/api/internal/blog-posts`, {
      headers: { Authorization: `Bearer ${apiSecret}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slugs || [];
  } catch {
    return [];
  }
}

// # Calculate read time from word count
function calcReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// # Main pipeline — discover topic, write article, generate cover, review, queue
export async function generateBlogArticle(): Promise<{
  drafted: boolean;
  contentId?: string;
  error?: string;
}> {
  // # Step 1: Discover a trending topic
  const { topic, reasoning, researchBrief } = await discoverTopic("blog", "article", "expert career advisor");

  // # Step 2: Get existing slugs to avoid duplicates
  const existingSlugs = await getExistingSlugs();

  // # Step 3: Generate the article via Gemini
  const writePrompt = `You are a senior career content writer for JobPilot AI (jobpilotai.co), an all-in-one AI career platform.

TOPIC: ${topic}
REASONING: ${reasoning}

RESEARCH DATA:
${researchBrief.rawBrief}

EXISTING BLOG SLUGS (DO NOT duplicate these topics):
${existingSlugs.slice(-30).join(", ") || "none yet"}

WRITE A BLOG ARTICLE following these rules:

1. LENGTH: 200-400 words. Punchy, scannable, no padding. Every sentence earns its place.
2. TITLE: SEO-optimized with the target keyword near the front. Specific and compelling.
3. STRUCTURE: Use ## H2 and ### H3 headings for featured snippets. Short paragraphs (2-3 sentences max).
4. CONTENT:
   - One clear takeaway per section
   - At least 2 specific numbers, stats, or data points
   - One internal link to a JobPilot feature using markdown: [feature name](https://jobpilotai.co/features/...)
   - CTA at the end driving to a specific JobPilot tool
   - No fluff, no filler, no "In today's competitive..." openers
5. TONE: Expert career advisor sharing real insights. Confident, not salesy. No emojis.
6. SLUG: URL-friendly, lowercase, hyphens, no stop words. Must NOT be in the existing slugs list.
7. META DESCRIPTION: Under 160 characters, includes target keyword, compelling for search results.
8. CATEGORY: One of: ${CATEGORIES.join(", ")}
9. TAGS: 3-5 comma-separated SEO tags relevant to the article
10. MEDIA PROMPT: Describe a professional cover image (1200x630) for this article. Dark theme, space aesthetic, indigo/violet colors. Describe the composition, visual metaphor, and mood. This will be used to generate the cover image with AI.

Return a JSON object:
{
  "title": "The SEO-Optimized Title",
  "slug": "the-url-slug",
  "content": "## Full markdown article here...",
  "excerpt": "A ~30 word excerpt for the blog listing card.",
  "category": "One of the categories",
  "tags": "tag1, tag2, tag3",
  "metaDescription": "Under 160 char meta description",
  "mediaPrompt": "Description for cover image generation"
}

Return ONLY valid JSON.`;

  const raw = await callGemini(writePrompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { drafted: false, error: "Failed to parse article JSON from Gemini" };
  }

  const article: BlogArticle = JSON.parse(jsonMatch[0]);

  // # Validate category
  if (!CATEGORIES.includes(article.category)) {
    article.category = "Career Advice";
  }

  // # Validate slug uniqueness
  if (existingSlugs.includes(article.slug)) {
    article.slug = `${article.slug}-${Date.now().toString(36)}`;
  }

  // # Step 4: Editorial review (max 2 attempts)
  let finalContent = article.content;
  let editorialScore = 0;
  let editorialFeedback = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const review = await reviewContent(
      finalContent,
      "blog",
      "article",
      article.title
    );
    editorialScore = review.score;
    editorialFeedback = review.feedback;

    if (review.passed) {
      finalContent = review.revisedContent;
      break;
    }

    // # Use revised content for next attempt
    finalContent = review.revisedContent;
  }

  // # Step 5: Generate cover image via Visual Designer
  let coverImageUrl: string | null = null;
  try {
    const { slides } = await designVisual(
      article.title,
      "blog",
      "single_image",
      article.mediaPrompt,
      topic
    );

    // # Render the first slide as cover image
    if (slides.length > 0) {
      // # Override dimensions for OG image size
      slides[0].width = 1200;
      slides[0].height = 630;
      const rendered = await renderSlide(slides[0], 1200, 630);
      if (rendered) {
        coverImageUrl = rendered;
      }
    }
  } catch (err) {
    // # Cover image failure should not block article queuing
    console.error("Cover image generation failed:", err);
  }

  // # Step 6: Queue as Content record for approval
  const readTime = calcReadTime(finalContent);

  const content = await prisma.content.create({
    data: {
      agent: "blog-writer",
      platform: "blog",
      contentType: "blog_article",
      title: article.title,
      body: finalContent,
      captionText: article.excerpt,
      hook: article.metaDescription,
      mediaPrompt: article.mediaPrompt,
      imageUrl: coverImageUrl,
      hashtags: article.tags,
      status: "pending",
      editorialScore,
      editorialFeedback,
      researchBrief: JSON.stringify({
        topic,
        reasoning,
        slug: article.slug,
        category: article.category,
        readTime,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
      }),
      notes: JSON.stringify({
        slug: article.slug,
        category: article.category,
        readTime,
        tags: article.tags,
      }),
    },
  });

  return { drafted: true, contentId: content.id };
}
```

- [ ] **Step 2: Check renderSlide import**

Read `src/lib/visual/canvas-renderer.ts` to confirm `renderSlide` export signature. If the function signature differs, adjust the import and call accordingly. The cover image step is wrapped in try-catch so a signature mismatch won't crash — but verify for correctness.

- [ ] **Step 3: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog-writer.ts
git commit -m "feat: add Blog Writer Agent — topic discovery, writing, cover image, editorial, queuing"
```

---

### Task 5: Blog Generate Cron Route + Publish Hook (Marketing HQ)

**Files:**
- Create: `C:\Users\User\jobpilot-marketing\src\app\api\blog\generate\route.ts`
- Create: `C:\Users\User\jobpilot-marketing\src\app\api\blog\publish\route.ts`
- Modify: `C:\Users\User\jobpilot-marketing\vercel.json`

**Interfaces:**
- Consumes:
  - `generateBlogArticle()` from `@/lib/blog-writer` (Task 4)
  - `callGemini()` from `@/lib/gemini` for social teaser generation
  - `appendUtmParams()` from `@/lib/email/templates` or `appendUtm()` from `@/lib/funnel/utm`
- Produces:
  - `GET /api/blog/generate` — cron-triggered, runs Mon/Wed/Fri at 8 AM UTC
  - `POST /api/blog/publish` — called when a blog_article is approved, pushes to main app + creates social shares

- [ ] **Step 1: Create blog generate cron route**

Create `src/app/api/blog/generate/route.ts`:

```typescript
/* ============================================================
   BLOG GENERATE — /api/blog/generate
   ============================================================
   GET: Cron-triggered Mon/Wed/Fri at 8 AM UTC. Runs the blog
   writer pipeline to discover a topic, write an article,
   generate a cover image, run editorial review, and queue
   the draft for approval.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateBlogArticle } from "@/lib/blog-writer";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  // # Timing-safe auth check
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // # Run the blog writer pipeline
  try {
    const result = await generateBlogArticle();

    if (result.drafted) {
      return NextResponse.json({
        drafted: 1,
        errors: 0,
        contentId: result.contentId,
      });
    }

    return NextResponse.json({
      drafted: 0,
      errors: 1,
      error: result.error,
    });
  } catch (err) {
    console.error("Blog generation failed:", err);
    return NextResponse.json({
      drafted: 0,
      errors: 1,
      error: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create blog publish route**

Create `src/app/api/blog/publish/route.ts`:

```typescript
/* ============================================================
   BLOG PUBLISH — /api/blog/publish
   ============================================================
   POST: Called when a blog_article Content item is approved.
   Pushes the article to the main app via internal API and
   creates social share posts for each connected platform.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { contentId } = await req.json();
  if (!contentId) {
    return NextResponse.json({ error: "contentId is required" }, { status: 400 });
  }

  // # Fetch the content item
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.contentType !== "blog_article") {
    return NextResponse.json({ error: "Blog article not found" }, { status: 404 });
  }

  // # Parse metadata from notes and researchBrief
  let meta: { slug?: string; category?: string; readTime?: string; tags?: string } = {};
  try { meta = JSON.parse(content.notes || "{}"); } catch { /* empty */ }

  let briefMeta: { metaTitle?: string; metaDescription?: string } = {};
  try {
    const brief = JSON.parse(content.researchBrief || "{}");
    briefMeta = { metaTitle: brief.metaTitle, metaDescription: brief.metaDescription };
  } catch { /* empty */ }

  const slug = meta.slug;
  if (!slug) {
    return NextResponse.json({ error: "Article missing slug in notes" }, { status: 400 });
  }

  // # Step 1: Push article to main app
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;
  if (!apiUrl || !apiSecret) {
    return NextResponse.json({ error: "JOBPILOT_API_URL or JOBPILOT_API_SECRET not configured" }, { status: 500 });
  }

  const publishRes = await fetch(`${apiUrl}/api/internal/blog-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiSecret}`,
    },
    body: JSON.stringify({
      slug,
      title: content.title,
      excerpt: content.captionText || "",
      content: content.body,
      category: meta.category || "Career Advice",
      tags: meta.tags || null,
      metaTitle: briefMeta.metaTitle || null,
      metaDescription: briefMeta.metaDescription || null,
      coverImageUrl: content.imageUrl || null,
      readTime: meta.readTime || "2 min read",
    }),
    cache: "no-store",
  });

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({ error: "Unknown" }));
    return NextResponse.json(
      { error: `Failed to publish to main app: ${err.error}` },
      { status: publishRes.status }
    );
  }

  // # Mark as posted in the content queue
  await prisma.content.update({
    where: { id: contentId },
    data: { status: "posted", postedAt: new Date() },
  });

  // # Step 2: Generate social share posts
  const blogUrl = `https://jobpilotai.co/blog/${slug}`;
  const platforms = ["linkedin", "twitter"];

  for (const platform of platforms) {
    try {
      // # Generate a short teaser for the social post
      const teaserPrompt = `Write a ${platform === "twitter" ? "tweet (under 250 chars)" : "LinkedIn post (2-3 sentences)"} promoting this blog article. Include the link at the end.

ARTICLE TITLE: ${content.title}
ARTICLE EXCERPT: ${content.captionText || ""}
LINK: ${blogUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=blog-${slug}

Rules:
- Hook the reader with a surprising insight or question from the article
- Do NOT use emojis
- Do NOT start with "In today's..." or any banned opener
- End with the link
- ${platform === "twitter" ? "Keep under 250 characters to leave room for the URL" : "Keep to 2-3 punchy sentences"}

Return ONLY the post text, nothing else.`;

      const teaser = await callGemini(teaserPrompt);
      const postUrl = `${blogUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=blog-${slug}`;

      // # Ensure the link is in the post
      const postBody = teaser.includes(blogUrl) ? teaser : `${teaser}\n\n${postUrl}`;

      // # Create social post in the content queue
      await prisma.content.create({
        data: {
          agent: "blog-writer",
          platform,
          contentType: "post",
          title: `[Blog Share] ${content.title}`,
          body: postBody,
          status: "pending",
          imageUrl: content.imageUrl || null,
          researchBrief: JSON.stringify({ blogSlug: slug, blogTitle: content.title }),
        },
      });
    } catch (err) {
      // # Social share failure should not block the publish response
      console.error(`Failed to create ${platform} share post:`, err);
    }
  }

  return NextResponse.json({
    published: true,
    slug,
    socialSharesCreated: platforms.length,
  });
}
```

- [ ] **Step 3: Update vercel.json**

Add the blog cron entry to `vercel.json`:

```json
{
  "path": "/api/blog/generate",
  "schedule": "0 8 * * 1,3,5"
}
```

- [ ] **Step 4: Verify build**

```bash
cd C:\Users\User\jobpilot-marketing
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/blog/ vercel.json
git commit -m "feat: add blog generate cron + publish hook with social auto-share"
```

---

### Task 6: Wire Blog Publish into Content Approval Flow

**Files:**
- Modify: `C:\Users\User\jobpilot-marketing\src\app\api\content\[id]\route.ts`
- Modify: `C:\Users\User\jobpilot-marketing\src\app\page.tsx`

**Interfaces:**
- Consumes: `POST /api/blog/publish` from Task 5
- Produces: When a `blog_article` content item is set to `"approved"`, the PATCH handler auto-calls the publish endpoint. Dashboard shows a "Publish" button for blog articles instead of the social "Post" button.

- [ ] **Step 1: Extend PATCH handler for blog auto-publish**

Modify `src/app/api/content/[id]/route.ts` — after the `prisma.content.update()` call, add a check: if the content is a `blog_article` being set to `"approved"`, call the publish endpoint:

```typescript
  // # After the prisma.content.update() call, add:

  // # Auto-publish blog articles when approved
  if (data.status === "approved" && updated.contentType === "blog_article") {
    try {
      // # Call the blog publish endpoint internally
      const publishUrl = `${req.nextUrl.origin}/api/blog/publish`;
      await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ contentId: id }),
      });
    } catch (err) {
      // # Log but don't fail the approval — user can retry publish manually
      console.error("Auto-publish blog failed:", err);
    }
  }
```

- [ ] **Step 2: Add blog preview in dashboard**

Modify `src/app/page.tsx` — in the content queue item rendering, add a visual indicator for blog articles. Find the section where content items are rendered as cards and add a condition:

When `item.platform === "blog"` and `item.contentType === "blog_article"`:
- Show "Blog Article" badge instead of platform name
- Show the article body as markdown preview (truncated)
- Show "Approve & Publish" instead of just "Approve" on the button
- After approval, show "Published to jobpilotai.co/blog" instead of "Post to [platform]"

The minimal change: in the status badge area, add a condition to display "Blog" for `platform === "blog"`. In the approve button handler, the auto-publish is handled server-side (Step 1), so the UI just needs labeling.

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/content/\[id\]/route.ts src/app/page.tsx
git commit -m "feat: wire blog auto-publish into content approval flow"
```

---

### Task 7: Final Verification + Smoke Test

**Files:**
- No new files

**Interfaces:**
- Consumes: all previous tasks

- [ ] **Step 1: Full TypeScript check — both repos**

```bash
cd C:\Users\User\jobpilot-marketing && npx tsc --noEmit
cd C:\Users\User\jobpilot-website && npx tsc --noEmit
```

- [ ] **Step 2: Build check — both repos**

```bash
cd C:\Users\User\jobpilot-marketing && npx next build
cd C:\Users\User\jobpilot-website && npx next build
```

- [ ] **Step 3: Verify route manifest**

Check that these routes appear in the build output:
- Marketing HQ: `/api/blog/generate`, `/api/blog/publish`
- Main app: `/api/internal/blog-posts`, `/blog`, `/blog/[slug]`

- [ ] **Step 4: Verify vercel.json has all 4 crons**

```bash
cat C:\Users\User\jobpilot-marketing\vercel.json
```

Expected: scheduler, email/send, funnel/sync, blog/generate

- [ ] **Step 5: Verify seed ran**

```bash
cd C:\Users\User\jobpilot-website
node -e "const { PrismaClient } = require('./src/generated/prisma/client.js'); const p = new PrismaClient(); p.blogPost.count().then(c => { console.log('Blog posts:', c); p.\$disconnect(); })"
```

Expected: `Blog posts: 6`

- [ ] **Step 6: Commit if any fixes needed**

```bash
git add -A && git commit -m "fix: final verification fixes for blog pipeline"
```
