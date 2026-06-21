# Spec 2: Automated SEO Blog Pipeline

**Date:** 2026-06-22
**Repos:** jobpilot-marketing (primary), jobpilot-website (blog hosting)
**Status:** Approved

## Overview

Automated pipeline that generates SEO-optimized blog articles for jobpilotai.co/blog. A Blog Writer Agent in Marketing HQ researches trending career topics, writes 200-400 word articles with cover images, runs editorial review, and queues drafts for approval. Approved articles publish to the main app via internal API and auto-share to social channels with UTM tracking.

**Volume:** 3 articles per week (Mon/Wed/Fri), 200-400 words each.

## Pipeline Flow

```
1. Topic Discovery (Research Agent + Gemini Search grounding)
   ↓
2. Article Generation (Blog Writer Agent — 200-400 words, markdown)
   ↓
3. Cover Image Generation (Visual Designer Agent — 1200x630 OG image)
   ↓
4. Editorial Review (Editorial Agent — score >= 7 to pass)
   ↓
5. Queue for Approval (Content model, platform: "blog", status: "pending")
   ↓
6. User Approves in Dashboard (existing Queue tab)
   ↓
7. Publish to Main App (POST /api/internal/blog-posts)
   ↓
8. Auto-Share to Socials (creates social post linking to article with UTM)
```

## Data Model

### Main App (`jobpilot-website`) — New Model

```prisma
model BlogPost {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  excerpt         String
  content         String                    // Full markdown article body
  category        String                    // "Resume Tips", "Interview Prep", "LinkedIn", etc.
  tags            String?                   // Comma-separated SEO tags
  metaTitle       String?                   // SEO <title> override (falls back to title)
  metaDescription String?                   // SEO meta description (under 160 chars)
  coverImageUrl   String?                   // 1200x630 OG/cover image URL
  author          String    @default("JobPilot AI Team")
  readTime        String                    // "2 min read", "3 min read"
  status          String    @default("draft")  // draft, published, archived
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@index([category])
}
```

### Marketing HQ — No New Model

Blog drafts use the existing `Content` model:
- `platform`: `"blog"`
- `contentType`: `"blog_article"`
- `body`: full markdown article
- `title`: article title (internal label)
- `captionText`: excerpt
- `mediaPrompt`: description for cover image generation
- `imageUrl`: generated cover image URL (after visual generation)
- `researchBrief`: JSON with keyword data, research brief, SEO metadata
- `hook`: meta description
- `notes`: tags, category, slug stored as JSON

Drafts appear in the existing Queue tab alongside social posts — no new dashboard tab needed.

## Blog Writer Agent

### Topic Discovery

Uses the existing Research Agent (`conductResearch` from `src/lib/research.ts`) with Gemini Search grounding:

1. Queries trending career/job search topics in the last 7-14 days
2. Cross-references against existing blog slugs (fetched from main app) to avoid duplicates
3. Targets long-tail keywords with clear search intent
4. Outputs: topic, target keyword, suggested title, 3-point outline

### Article Generation

A new `generateBlogArticle` function in `src/lib/blog-writer.ts`:

- Takes the research brief + outline
- Calls Gemini to write a 200-400 word article in markdown
- Requirements for generated content:
  - SEO-optimized title with target keyword near the front
  - Meta description under 160 characters
  - H2/H3 structure for featured snippets
  - Natural keyword usage (no stuffing)
  - One internal link to a relevant JobPilot feature
  - CTA at the end driving to a specific JobPilot tool
  - Punchy, scannable, no padding or fluff
- Generates: slug (from title), excerpt (first ~30 words), category, read time, tags

### Cover Image Generation

Uses the existing Visual Designer Agent (`src/lib/visual/designer-agent.ts`):

- Blog Writer provides a `mediaPrompt` describing the article theme
- Visual Designer renders a 1200x630 image (standard OG size)
- Dark theme, space aesthetic, professional — matching JobPilot brand
- Image stored via the existing image pipeline (same as social post images)
- Used as both the blog header image and the OG social share image

### Editorial Review

Uses the existing Editorial Review Agent (`reviewContent` from `src/lib/editorial.ts`):

- Scores the article 1-10
- Checks for AI-detectable patterns, weak hooks, generic advice, brand alignment
- If score < 7, revises and re-scores (max 2 attempts)
- If still < 7 after 2 attempts, queues with editorial feedback for manual review

### Categories

Fixed set matching existing blog content:
- Resume Tips
- Interview Prep
- LinkedIn
- Cover Letters
- Career Change
- Job Search
- Career Advice
- Networking

## API Routes

### Marketing HQ — New Routes

**`GET /api/blog/generate`** — Cron-triggered (Mon/Wed/Fri 8 AM UTC)
- Auth: `CRON_SECRET` with timing-safe comparison
- Runs the full pipeline: topic discovery → write → cover image → editorial review → queue
- Returns: `{ drafted: number, errors: number }`

**Content approval hook** — Extend existing content approval logic:
- When a `blog_article` content item status changes to `"approved"`:
  1. Push article to main app via `POST /api/internal/blog-posts`
  2. Create a social post summarizing the article with link + UTM tags
- The social post enters the normal queue (separate approval or auto-post)

### Main App (`jobpilot-website`) — New Routes

**`POST /api/internal/blog-posts`** — Receives published articles from Marketing HQ
- Auth: `INTERNAL_API_SECRET` Bearer token with timing-safe comparison
- Accepts: `{ slug, title, excerpt, content, category, tags, metaTitle, metaDescription, coverImageUrl, author, readTime }`
- Creates `BlogPost` with `status: "published"`, `publishedAt: now()`
- Returns: `{ id, slug }`
- Rejects duplicate slugs with 409

**`GET /api/internal/blog-slugs`** — Returns all existing slugs (for duplicate avoidance)
- Auth: same `INTERNAL_API_SECRET` Bearer token
- Returns: `{ slugs: string[] }`

### Main App — Refactored Pages

**`/blog` (listing page):**
- Query `BlogPost` where `status: "published"`, ordered by `publishedAt` desc
- ISR with `revalidate = 3600` (1 hour)
- Same dark theme card layout as current hardcoded version
- Add cover image to each card
- Paginate if > 12 posts (simple "Load More" or page numbers)

**`/blog/[slug]` (article page):**
- Fetch single `BlogPost` by slug
- 404 if not found or not published
- Render markdown to HTML (use `react-markdown` or similar)
- Display cover image as header
- Keep existing JSON-LD structured data (ArticleJsonLd, BreadcrumbJsonLd)
- Add `<meta property="og:image">` from `coverImageUrl`
- Same dark theme styling as current articles

**Sitemap (`sitemap.ts`):**
- Add all published blog post URLs dynamically

### Existing Article Migration

Seed script to migrate the 6 hardcoded articles into the `BlogPost` table:
- Preserves existing slugs, titles, content, categories, dates
- Sets `status: "published"` and `publishedAt` to their original dates
- Run once after migration, then remove hardcoded arrays from page components

## Social Auto-Share

When a blog article is approved and published:

1. Create a `Content` record for each active social platform with:
   - `contentType`: `"post"`
   - `platform`: linkedin, twitter, etc.
   - `body`: 2-3 sentence summary of the article + link
   - Link: `https://jobpilotai.co/blog/<slug>?utm_source=<platform>&utm_medium=social&utm_campaign=blog-<slug>`
   - `status`: `"pending"` (enters normal approval queue)

The social post body is generated by Gemini — a short hook + the blog link. Not a full article rewrite, just a teaser to drive clicks.

## Cron Schedule

Add to `vercel.json`:
```json
{ "path": "/api/blog/generate", "schedule": "0 8 * * 1,3,5" }
```
Monday, Wednesday, Friday at 8 AM UTC. Generates one draft per run.

## Environment Variables

No new env vars needed. Reuses:
- `GEMINI_API_KEY` — for article generation and research
- `CRON_SECRET` — for cron route auth
- `JOBPILOT_API_SECRET` / `INTERNAL_API_SECRET` — for cross-app API auth

## Main App Dependencies

One new package in `jobpilot-website`:
- `react-markdown` — renders markdown article content to HTML (or use `marked` for server-side rendering if preferred)

## Out of Scope

- Comment system on blog posts — future enhancement
- Blog search / filtering UI — future enhancement
- RSS feed — future enhancement
- A/B testing article titles — future enhancement
- AI-generated article series / multi-part guides — future enhancement
- Blog analytics dashboard in Marketing HQ — covered by existing Funnel tab (UTM attribution tracks blog → signup conversion)
