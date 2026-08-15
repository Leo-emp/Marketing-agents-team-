# JobPilot Marketing Agents

An autonomous AI marketing system that generates, reviews, schedules, and publishes social media content across 4 platforms — with 8 specialized AI agents, multi-format visual generation, email sequences, and a KPI analytics dashboard.

Built to run a SaaS marketing operation with near-zero human effort: **6,700+ lines of TypeScript**, 46 API routes, 10 database models, AI-generated visuals (fal.ai Flux Pro), and auto-posting to LinkedIn, X, Instagram, and TikTok.

---

## Architecture

```mermaid
graph TB
    subgraph Dashboard["ADMIN DASHBOARD"]
        AD[Content queue · Schedule<br/>KPI · Visual editor · Settings]
    end

    subgraph API["46 API ROUTES"]
        GN[/generate · /research]
        VS[/visual · /creative]
        PS[/post · /scheduler]
        EM[/email · /kpi · /funnel]
    end

    subgraph Agents["8 AI AGENTS"]
        A1[Growth Hacker<br/>ROI stats, conversions]
        A2[Storyteller<br/>User journeys, arcs]
        A3[Data Nerd<br/>Charts, benchmarks]
        A4[Provocateur<br/>Hot takes, debates]
        A5[Educator<br/>How-to guides]
        A6[Visualist<br/>Carousels, infographics]
        A7[Trend Surfer<br/>Trending formats]
        A8[Ambassador<br/>Testimonials, proof]
    end

    subgraph Visual["VISUAL ENGINE"]
        FAL[fal.ai Flux Pro<br/>AI image generation]
        TMP[72 Templates<br/>LinkedIn · Instagram · TikTok]
        PDF[PDF Carousels<br/>Multi-slide builder]
        BO[Brand Overlay<br/>Logo + watermark]
    end

    subgraph Pipeline["QUALITY PIPELINE"]
        QP[Research → Generate → Editorial Review → Visual → Schedule<br/>Score 1-10: hook · specificity · brand · platform fit]
    end

    subgraph Delivery["AUTO-POSTING"]
        LI[LinkedIn OAuth]
        TW[Twitter/X OAuth]
        IG[Instagram API]
        TK[TikTok API]
        CR[Cron Scheduler<br/>Retry + backoff]
    end

    subgraph Email["EMAIL MARKETING"]
        ES[7 Sequences<br/>Onboarding · Drip · Re-engage<br/>Upgrade · Win-back · Digest]
        RE[Resend API]
    end

    subgraph Analytics["KPI ANALYTICS"]
        KP[Engagement tracking<br/>A/B testing · UTM funnel<br/>Attribution sync]
    end

    Dashboard --> API
    API --> Agents --> Pipeline
    Pipeline --> Visual
    Pipeline --> Delivery
    Pipeline --> Email
    Delivery --> Analytics
    ES --> RE

    style Agents fill:#1a1a2e,stroke:#F472B6,color:#fff
    style Visual fill:#1a1a2e,stroke:#06B6D4,color:#fff
    style Pipeline fill:#1a1a2e,stroke:#F59E0B,color:#fff
    style Delivery fill:#1a1a2e,stroke:#10B981,color:#fff
```

## Problem Statement

SaaS marketing demands consistent, high-quality content across multiple social platforms — a task that typically requires a dedicated marketing team or agency ($5,000-15,000/month). Solo founders face an impossible tradeoff: spend hours creating content manually, or neglect marketing entirely.

Three technical challenges make automation harder than simply "hooking up an AI to social media":

1. **Voice consistency** — Generic AI content sounds identical across posts and platforms. Building a recognizable brand requires distinct personas that maintain character across hundreds of posts.
2. **Quality variance** — LLM output quality is unpredictable. Without a quality gate, low-effort content dilutes the brand and reduces engagement.
3. **Multi-platform formatting** — A LinkedIn carousel has different constraints than a TikTok caption or an Instagram reel. Content must be platform-native, not cross-posted verbatim.

---

## Technical Deep Dive

### Multi-Agent Architecture

The system implements 8 specialized AI agents, each with a unique persona, voice, and platform expertise. Every agent receives the same brand context (product features, positioning, target audience) but applies it through a different lens.

Each agent receives **voice samples** — curated examples of their ideal writing style — injected into the prompt. This grounds the LLM's output in a specific voice rather than its default register, producing content that reads like it came from 8 different human writers.

### Two-Pass Quality Pipeline

Content generation uses a two-pass architecture:

**Pass 1 — Generation:** The selected agent creates content optimized for creativity, relevance, and platform-specific formatting. The prompt includes brand context, recent research, and voice samples.

**Pass 2 — Editorial Review:** A separate AI agent evaluates the content on 4 independent dimensions, each scored 1-10:

- **Hook Strength** — Will the first line stop the scroll?
- **Specificity** — Does it reference concrete features/data, or speak in generalities?
- **Brand Alignment** — Is the tone, positioning, and product representation accurate?
- **Platform Fit** — Does the format, length, and style match the target platform's norms?

Content scoring below threshold on any dimension is rejected with specific feedback. This two-pass approach is more effective than a single "generate good content" prompt because the generation and evaluation objectives are distinct — creativity vs. quality — and LLMs perform better when optimizing for one objective at a time.

### Visual Generation Engine

The system produces 5 types of visual content through different rendering pipelines:

| Format | Technology | Platforms |
|--------|-----------|-----------|
| Single images | fal.ai Flux Pro AI generation | All |
| Branded slides | HTML → PNG with brand overlay | LinkedIn, Instagram |
| PDF carousels | Multi-slide PDF generation | LinkedIn |
| Caption burning | Text overlays on images | Instagram Stories, TikTok |
| Reels/Shorts | Remotion video assembly | TikTok, Instagram |

**72 visual templates** across 3 platform template sets (LinkedIn, Instagram, TikTok) with shared constants for brand colors, typography, and layout patterns.

### Auto-Posting Pipeline

The posting system handles the full lifecycle from approved content to live post:

1. **OAuth Connection** — Each platform is connected via OAuth 2.0 with token storage and automatic refresh via cron
2. **Scheduling** — Content is assigned a posting time based on platform-specific optimal engagement windows
3. **Posting** — The cron scheduler picks up due content, calls the platform API, handles media upload, and records the platform post ID
4. **Retry Logic** — Failed posts are retried with exponential backoff (3 attempts), with failure notifications sent to the admin
5. **Engagement Tracking** — After posting, the system pulls engagement metrics (likes, comments, shares, impressions) back into the database

### Email Marketing Engine

Seven automated email sequences handle user lifecycle communication. Each sequence is defined as a series of timed emails with conditional triggers. The email engine uses Resend's API for delivery, with unsubscribe handling, webhook processing for delivery/bounce/complaint events, and automatic seed-on-deploy.

| Sequence | Trigger | Purpose |
|----------|---------|---------|
| Welcome | Signup | 3-email onboarding drip |
| Feature Discovery | Day 3-7 | Highlight underused features |
| Engagement | Low activity | Re-engagement nudge |
| Upgrade | Free plan limit | Pro upgrade pitch |
| Win-Back | Churned user | Return incentive |
| Weekly Digest | Cron (weekly) | New features + tips |
| Blog Notify | New blog post | Content alert |

### Analytics & Attribution

The KPI module tracks content performance across platforms and feeds insights back into the generation process:

- **Engagement metrics** per post (likes, comments, shares, saves, impressions)
- **A/B variation tracking** — content can be grouped into variation sets for split testing
- **UTM parameter generation** — every link includes UTM tags for funnel attribution
- **Attribution sync** — connects social engagement to website signups and conversions

---

## AI/ML Techniques

| # | Technique | Implementation | Purpose |
|---|-----------|---------------|---------|
| 1 | **Multi-Agent System** | 8 specialized personas with Gemini | Each agent has unique voice, platform expertise, content style |
| 2 | **Research Agent** | Topic discovery + competitor analysis | Ground content in real trends and data |
| 3 | **Editorial AI Review** | 4-dimensional scoring (hook, specificity, brand, platform) | Quality gate before publishing |
| 4 | **AI Image Generation** | fal.ai Flux Pro (primary) + branded HTML templates | Platform-native visuals at scale |
| 5 | **Dynamic Voice System** | Voice sample injection per agent | Consistent brand personality across content |
| 6 | **AI Content Repurposing** | Cross-platform adaptation | One piece → 4 platform-optimized versions |
| 7 | **Performance Feedback Loop** | Engagement metrics → content scoring | Learn what works, amplify winning patterns |

## The 8 Agents

| Agent | Persona | Platform Focus | Content Style |
|-------|---------|---------------|---------------|
| Growth Hacker | Data-driven marketer | LinkedIn, X | ROI stats, conversion tips |
| Storyteller | Narrative builder | LinkedIn, Instagram | User journeys, transformation arcs |
| Data Nerd | Analytics obsessed | LinkedIn, X | Charts, benchmarks, surprising stats |
| Provocateur | Hot takes machine | X, TikTok | Contrarian views, debate starters |
| Educator | Patient teacher | LinkedIn, Instagram | How-to guides, step-by-step tutorials |
| Visualist | Design thinker | Instagram, TikTok | Carousel explainers, infographics |
| Trend Surfer | Culture connector | TikTok, X | Trending formats, meme-aware hooks |
| Ambassador | Customer voice | All platforms | Testimonials, case studies, social proof |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma (content queue, analytics, email sends) |
| AI | Google Gemini (content generation, research, editorial) |
| Image AI | fal.ai Flux Pro (primary), HTML Canvas (fallback) |
| Video | Remotion (reel assembly) |
| Email | Resend API |
| Social APIs | LinkedIn, X/Twitter, Instagram, TikTok (OAuth 2.0) |
| Storage | Vercel Blob |
| Deployment | Vercel (serverless + cron) |

## Project Structure

```
jobpilot-marketing/                # 6,700+ lines of TypeScript
├── src/
│   ├── app/
│   │   ├── api/                   # 46 API routes
│   │   │   ├── generate/          # Content generation (agents)
│   │   │   ├── research/          # Topic research + trends
│   │   │   ├── visual/            # Image/PDF/slide generation
│   │   │   ├── post/              # Auto-posting to platforms
│   │   │   ├── scheduler/         # Cron-based scheduling
│   │   │   ├── connect/           # OAuth for 4 platforms
│   │   │   ├── email/             # Email sequences + webhooks
│   │   │   ├── kpi/               # Analytics + performance
│   │   │   ├── funnel/            # UTM attribution + sync
│   │   │   ├── blog/              # Blog post generation
│   │   │   ├── video/             # Reel rendering pipeline
│   │   │   ├── creative/          # AI image + ambassador visuals
│   │   │   └── content/           # CRUD + engagement tracking
│   │   └── page.tsx               # Admin dashboard
│   ├── lib/
│   │   ├── agents.ts              # 8 AI agent personas
│   │   ├── research.ts            # Topic discovery + analysis
│   │   ├── editorial.ts           # 4-dim quality scoring
│   │   ├── gemini.ts              # Gemini API client
│   │   ├── social-posting.ts      # Multi-platform posting
│   │   ├── blog-writer.ts         # SEO blog generation
│   │   ├── visual/                # Visual generation engine
│   │   │   ├── fal-image.ts       # fal.ai Flux Pro integration
│   │   │   ├── templates/         # 72 platform templates
│   │   │   ├── brand-overlay.ts   # Automatic brand watermarks
│   │   │   ├── pdf-carousel.ts    # Multi-slide PDF builder
│   │   │   └── reel-designer.ts   # Short-form video assembly
│   │   ├── email/                 # Email marketing engine
│   │   └── funnel/                # Attribution + analytics
│   └── components/
│       └── PlatformPreview.tsx     # Platform-faithful previews
├── prisma/
│   └── schema.prisma              # 10 models
└── scripts/                       # Seeding + admin tools
```

## By the Numbers

| Metric | Value |
|--------|-------|
| Source files | 148 TypeScript modules |
| Lines of code | 6,700+ |
| API routes | 46 |
| AI agents | 8 specialized personas |
| Visual templates | 72 (LinkedIn + Instagram + TikTok) |
| Email sequences | 7 automated drips |
| Database models | 10 |
| Platform integrations | 4 (LinkedIn, X, Instagram, TikTok) |

## Key Engineering Decisions

**Why 8 agents instead of 1?** Each social platform has distinct content norms. A LinkedIn thought leadership post reads differently than a TikTok hook. Specialized agents with injected voice samples produce platform-native content that a single generic prompt cannot match.

**Why fal.ai over DALL-E/Midjourney?** fal.ai Flux Pro offers API-first access with fast generation, transparent pricing, and no content restrictions on professional marketing imagery. The HTML template fallback ensures visuals are always available even if the AI image API is down.

**Why editorial review as a second AI pass?** First-pass generation optimizes for creativity. The editorial agent optimizes for quality — checking hook strength, specificity, brand alignment, and platform fit. This two-pass approach catches generic content before it reaches the queue.

**Why auto-posting over manual?** A solo founder cannot maintain consistent posting across 4 platforms. The cron scheduler + OAuth pipeline posts approved content automatically, with retry logic for API failures and token refresh for expired credentials.

## Future Work

- **Performance-driven agent selection** — automatically assign the best-performing agent per platform based on historical engagement data
- **Audience segmentation** — tailor content based on follower demographics and engagement patterns
- **Competitive intelligence** — monitor competitor social accounts and identify content gaps
- **Video-first content** — expand Remotion pipeline for TikTok/Reels as short-form video dominates engagement

## Setup

```bash
git clone https://github.com/Leo-emp/Marketing-agents-team-.git
cd Marketing-agents-team-

npm install

cp .env.example .env
# Add: GEMINI_API_KEY, FAL_KEY, RESEND_API_KEY
# Add OAuth keys for each platform you want to auto-post to

npx prisma migrate dev
npm run dev
```

## Live

- **Powers:** [jobpilotai.co](https://jobpilotai.co) marketing
- **Repository:** [github.com/Leo-emp/Marketing-agents-team-](https://github.com/Leo-emp/Marketing-agents-team-)

## License

MIT
